import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Helper function to decode Base64
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Environment Variable Checks ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const encryptionKeyBase64 = Deno.env.get('GEMINI_ENCRYPTION_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !encryptionKeyBase64) {
      console.error('Missing required environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Initialize Supabase Clients ---
    const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    // --- Authenticate User ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth error:', userError?.message)
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Extract API Key from Request Body ---
    let apiKey: string | null = null
    try {
      const body = await req.json()
      apiKey = body.apiKey
      if (!apiKey || typeof apiKey !== 'string') {
        throw new Error("Missing or invalid 'apiKey' in request body")
      }
    } catch (e) {
      console.error('Failed to parse request body or missing API key:', e.message)
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'apiKey' in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // --- Encryption Logic ---
    let encryptedData: Uint8Array
    try {
      // Decode and import the encryption key
      const decodedKeyBytes = base64ToUint8Array(encryptionKeyBase64)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        decodedKeyBytes,
        { name: 'AES-GCM' },
        false, // non-exportable
        ['encrypt']
      )

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes for AES-GCM

      // Encode plaintext API key
      const encodedApiKey = new TextEncoder().encode(apiKey)

      // Encrypt
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encodedApiKey
      ) // Result is ArrayBuffer

      // Combine IV + Ciphertext
      encryptedData = new Uint8Array([...iv, ...new Uint8Array(ciphertext)])
    } catch (cryptoError) {
      console.error('Encryption error:', cryptoError)
      return new Response(JSON.stringify({ error: 'Failed to encrypt API key.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Store Encrypted Key in Database ---
    const { error: updateError } = await supabaseAdminClient
      .from('user_profiles')
      .update({ encrypted_gemini_api_key: encryptedData }) // Store combined bytes
      .eq('id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update user profile.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Success Response ---
    return new Response(JSON.stringify({ message: 'API key updated successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected server error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
