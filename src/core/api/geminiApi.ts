/* Storage Limitations (for gemini-2.5-pro):
 *
 * Images:
 *   - Maximum images per prompt: 3,000
 *   - Maximum image size: 7 MB
 *   - Supported MIME types: image/png, image/jpeg, image/webp
 *
 * Documents:
 *   - Maximum number of files per prompt: 3,000
 *   - Maximum number of pages per file: 1,000
 *   - Maximum file size per file: 50 MB
 *   - Supported MIME types: application/pdf, text/plain
 *
 * Video:
 *   - Maximum video length (with audio): Approximately 45 minutes
 *   - Maximum video length (without audio): Approximately 1 hour
 *   - Maximum number of videos per prompt: 10
 *   - Supported MIME types: video/x-flv, video/quicktime, video/mpeg, video/mpegs, video/mpgs, video/mpg, video/mp4, video/webm, video/wmv, video/3gpp
 *
 * Audio:
 *   - Maximum audio length per prompt: Approximately 8.4 hours, or up to 1 million tokens
 *   - Maximum number of audio files per prompt: 1
 *   - Speech understanding for: Audio summarization, transcription, and translation
 *   - Supported MIME types: audio/x-aac, audio/flac, audio/mp3, audio/m4a, audio/mpeg, audio/mpga, audio/mp4, audio/opus, audio/pcm, audio/wav, audio/webm
 */
import { supabase } from '@/shared/api/supabase-client'
import { toGeminiSchema } from '@/shared/utils/gemini-zod'
import { File as GoogleFile, GoogleGenAI, Part, UsageMetadata } from '@google/genai'
import { z } from 'zod'

export async function getGeminiApiKey(): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated. Please log in to access this feature.')
  }

  const { data: userProfile, error: dbError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (dbError || !userProfile) {
    console.error('Error fetching user profile:', dbError.message)
    throw new Error('Error fetching user profile. Please try again later.')
  }

  const geminiApiKey = userProfile.gemini_api_key

  if (!geminiApiKey) {
    throw new Error(
      'Gemini API key not found. Please set a valid API key in Settings > Gemini Api Key.'
    )
  }

  return geminiApiKey
}

export interface UploadedFile {
  mimeType: string
  uri: string
}

export interface UploadFilesInput {
  apiKey: string
  files: File[]
}

export async function uploadFiles({ apiKey, files }: UploadFilesInput): Promise<GoogleFile[]> {
  const ai = new GoogleGenAI({ apiKey })

  const uploadedFiles = await Promise.all(
    files.map((f) => ai.files.upload({ file: f.webkitRelativePath }))
  )

  return uploadedFiles
}

export interface DeleteFilePartsInput {
  apiKey: string
  files: GoogleFile[]
}

export async function deleteFileParts({ apiKey, files }: DeleteFilePartsInput) {
  const ai = new GoogleGenAI({ apiKey })

  await Promise.all(
    files.map((file) => {
      if (file.name) ai.files.delete({ name: file.name })
    })
  )
}

export interface CountTokensInput {
  apiKey: string
  text: string
}

export async function countTokens({ apiKey, text }: CountTokensInput): Promise<number> {
  const ai = new GoogleGenAI({ apiKey })

  const countTokensResponse = await ai.models.countTokens({
    model: 'gemini-2.5-pro-exp-03-25',
    contents: text,
  })

  if (!countTokensResponse || !countTokensResponse.totalTokens) {
    throw new Error('Error counting tokens. Please try again later.')
  }

  return countTokensResponse.totalTokens
}

export type CallGeminiInput<T> = {
  apiKey: string
  parts: Part[]
  schema: z.ZodType<T>
}

export interface CallGeminiOutput<T> {
  data: T
  usageMetadata: UsageMetadata
}

export async function callGemini<T>({
  apiKey,
  parts,
  schema,
}: CallGeminiInput<T>): Promise<CallGeminiOutput<T>> {
  try {
    // Connect to Gemini API
    const ai = new GoogleGenAI({ apiKey })

    // Call the model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-exp-03-25',
      contents: parts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(schema),
      },
    })

    // Check response exists
    if (!response || !response.text || !response.usageMetadata) {
      throw new Error('Empty response from Gemini API')
    }

    // Extract and parse the response
    const responseText = response.text
    const jsonData = JSON.parse(responseText)
    const parsed = schema.parse(jsonData)

    // Return the parsed data
    return { data: parsed, usageMetadata: response.usageMetadata }
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw new Error('Error calling Gemini API. Please try again later.')
  }
}
