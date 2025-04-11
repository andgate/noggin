// supabase/functions/call-gemini/index.ts
import { decode as base64Decode } from 'https://deno.land/std@0.168.0/encoding/base64.ts' // Import for Base64 decoding
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
    GenerateContentResponse,
    GoogleGenerativeAI,
} from 'https://esm.sh/@google/generative-ai@0.1.3' // Use appropriate version
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers - adjust origin as needed for your frontend
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Or specific origin: 'http://localhost:3000'
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const REQUEST_TIMEOUT_MS = 30000 // 30 seconds timeout

// Helper function to convert hex string (like Supabase bytea \x...) to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString.startsWith('\\x')) {
        hexString = hexString.slice(2)
    }
    if (hexString.length % 2 !== 0) {
        throw new Error('Invalid hex string format for decryption')
    }
    const byteArray = new Uint8Array(hexString.length / 2)
    for (let i = 0; i < byteArray.length; i++) {
        const byte = parseInt(hexString.substr(i * 2, 2), 16)
        if (isNaN(byte)) {
            throw new Error('Invalid hex character encountered during conversion')
        }
        byteArray[i] = byte
    }
    return byteArray
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Initialize Supabase Clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const encryptionKeyBase64 = Deno.env.get('GEMINI_ENCRYPTION_KEY') // Get encryption key

        if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
            console.error('Missing Supabase environment variables')
            return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
        if (!encryptionKeyBase64) {
            console.error('Missing GEMINI_ENCRYPTION_KEY environment variable')
            return new Response(
                JSON.stringify({ error: 'Server configuration error (key missing).' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })
        const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
        })

        // 2. Authenticate User
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
        const jwt = authHeader.replace('Bearer ', '')
        const {
            data: { user },
            error: authError,
        } = await supabaseAuthClient.auth.getUser(jwt)

        if (authError || !user) {
            console.error('Auth error:', authError)
            return new Response(JSON.stringify({ error: 'Authentication failed' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. Extract Request Body
        const body = await req.json()
        const { parts, geminiSchema } = body

        if (!parts || !geminiSchema) {
            return new Response(
                JSON.stringify({ error: 'Missing "parts" or "geminiSchema" in request body' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 4. Retrieve Encrypted API Key
        const { data: profile, error: profileError } = await supabaseAdminClient
            .from('user_profiles')
            .select('encrypted_gemini_api_key')
            .eq('id', user.id)
            .single()

        if (profileError || !profile || !profile.encrypted_gemini_api_key) {
            console.error('Profile fetch error:', profileError)
            // Distinguish between no key set and other errors
            const errorMsg = profileError
                ? 'Failed to retrieve user profile'
                : 'Gemini API key not set for this user'
            const status = profileError ? 500 : 404 // 404 if key simply not found
            return new Response(JSON.stringify({ error: errorMsg }), {
                status: status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
        const encryptedApiKeyHex = profile.encrypted_gemini_api_key // Assume hex string like \x...

        // 5. Decrypt API Key
        let decryptedApiKey: string
        try {
            // Decode the Base64 encryption key from env var
            const decodedKeyBytes = base64Decode(encryptionKeyBase64)

            // Convert the hex-encoded API key from DB to bytes
            const encryptedDataBytes = hexToUint8Array(encryptedApiKeyHex)

            // Separate IV (first 12 bytes) and ciphertext
            if (encryptedDataBytes.length <= 12) {
                throw new Error('Encrypted data is too short to contain IV and ciphertext.')
            }
            const iv = encryptedDataBytes.slice(0, 12)
            const ciphertext = encryptedDataBytes.slice(12)

            // Import the AES-GCM key
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                decodedKeyBytes,
                { name: 'AES-GCM' },
                false, // Key is not extractable
                ['decrypt'] // We only need to decrypt
            )

            // Decrypt the ciphertext
            const decryptedDataBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv }, // Algorithm parameters including IV
                cryptoKey, // The imported key
                ciphertext // The ciphertext to decrypt
            )

            // Decode the decrypted ArrayBuffer back to a UTF-8 string
            decryptedApiKey = new TextDecoder().decode(decryptedDataBuffer)
        } catch (decryptionError) {
            console.error('Decryption failed:', decryptionError)
            // Log specific error details if helpful, but return a generic message
            let userErrorMessage = 'Failed to decrypt API key.'
            if (decryptionError instanceof Error) {
                if (decryptionError.message.includes('hex')) {
                    userErrorMessage = 'Invalid format for stored API key.'
                } else if (
                    decryptionError.message ===
                    'The operation failed for an operation-specific reason'
                ) {
                    // This often indicates a bad key or corrupted data/IV mismatch
                    userErrorMessage =
                        'Decryption failed. Key might be incorrect or data corrupted.'
                }
            }

            return new Response(JSON.stringify({ error: userErrorMessage }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Ensure decryption actually produced a key
        if (!decryptedApiKey) {
            // This case should ideally be caught by the try/catch, but as a safeguard:
            console.error('Decryption process completed but resulted in an empty key.')
            return new Response(
                JSON.stringify({ error: 'Failed to obtain valid API key after decryption.' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 6. Initialize Google Gemini Client
        const genAI = new GoogleGenerativeAI(decryptedApiKey) // Use the decrypted key
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest', // Using latest flash model
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: geminiSchema,
            },
        })

        // 7. Call Gemini API with Timeout
        console.log('🤖 Calling model.generateContent with schema')
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
                () =>
                    reject(
                        new Error(
                            `Gemini API request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`
                        )
                    ),
                REQUEST_TIMEOUT_MS
            )
        })

        let result: GenerateContentResponse
        try {
            result = await Promise.race([model.generateContent(parts), timeoutPromise])
        } catch (callError) {
            console.error('🤖 Error during model.generateContent call:', callError)
            // Handle potential API key errors from Google
            if (callError instanceof Error && callError.message.includes('API key not valid')) {
                console.error('Gemini API rejected the key.')
                // Invalidate the key or notify the user? For now, return a specific error.
                return new Response(
                    JSON.stringify({
                        error: 'Invalid Gemini API Key. Please check and update your key.',
                    }),
                    {
                        status: 401, // Unauthorized
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    }
                )
            }
            // Re-throw specific timeout error or the original error
            throw callError instanceof Error && callError.message.includes('timed out')
                ? new Error(
                      `Gemini API request timed out. Please check your connection or try a smaller request.`
                  )
                : callError
        }

        console.log('🤖 model.generateContent returned successful response')
        const response = result.response

        if (!response) {
            throw new Error('Empty response from Gemini API')
        }

        const responseText = response.text()
        console.log('🤖 Raw response text:', responseText.substring(0, 100) + '...')

        // 8. Return Gemini JSON Response
        try {
            const jsonData = JSON.parse(responseText)
            return new Response(JSON.stringify(jsonData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } catch (parseError) {
            console.error('🤖 Failed to parse JSON response from Gemini:', parseError)
            console.error('🤖 Raw response text:', responseText)
            return new Response(
                JSON.stringify({
                    error: 'Gemini did not return valid JSON.',
                    rawResponse: responseText,
                }),
                {
                    status: 502,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }
    } catch (error) {
        console.error('Unhandled error in Edge Function:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred.'
        // Determine status code based on error type
        let statusCode = 500 // Default
        if (errorMessage.includes('timed out')) {
            statusCode = 504 // Gateway Timeout
        } else if (
            errorMessage.includes('Authentication failed') ||
            errorMessage.includes('authorization header') ||
            errorMessage.includes('Invalid Gemini API Key')
        ) {
            statusCode = 401 // Unauthorized
        } else if (
            errorMessage.includes('API key not set') ||
            errorMessage.includes('Invalid format for stored API key')
        ) {
            statusCode = 400 // Bad Request (client-side issue with key)
        } else if (
            errorMessage.includes('Failed to retrieve user profile') ||
            errorMessage.includes('Decryption failed')
        ) {
            statusCode = 500 // Server Internal Error
        } else if (errorMessage.includes('Missing "parts" or "geminiSchema"')) {
            statusCode = 400 // Bad Request
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
