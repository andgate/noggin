// TODO Add support for resumable uploads
/**
 * Supabase Storage API wrapper for handling module source file uploads, retrieval, and deletion.
 *
 * Storage Limitations (for gemini-2.5-pro):
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
import { type StorageError } from '@supabase/storage-js'
import tus from 'tus-js-client'

// TODO Store as secrets
const PROJECT_ID = 'dfreaglzkffskxbgdfdf'
const BUCKET_NAME = 'noggin-dev-module-sources'

/**
 * Uploads a module source file to Supabase Storage.
 * @param userId - The ID of the user uploading the file.
 * @param moduleId - The ID of the module the file belongs to.
 * @param file - The file object to upload.
 * @returns An object containing the storage path on success, or an error on failure.
 */
export const uploadModuleSource = async (
  userId: string,
  moduleId: string,
  file: File
): Promise<{ path: string | null; error: StorageError | Error | null }> => {
  const uuid = crypto.randomUUID()
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_') // Sanitize filename
  const path = `user_${userId}/module_${moduleId}/${uuid}_${fileName}`

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file)

    if (error) {
      console.error('Error uploading module source:', error)
      return { path: null, error }
    }

    // The 'path' returned by upload includes the bucket name, but we only want the object path.
    // However, the 'path' variable we constructed is the correct object path.
    console.log('Upload successful, data:', data) // data contains { path: string }
    return { path: path, error: null }
  } catch (err) {
    console.error('Unexpected error during upload:', err)
    return { path: null, error: err instanceof Error ? err : new Error('Unknown upload error') }
  }
}

/**
 * Retrieves the public URL for a file in Supabase Storage.
 * @param path - The storage path of the file.
 * @returns An object containing the public URL.
 */
export const getPublicUrl = (path: string): { publicUrl: string } => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return { publicUrl: data.publicUrl }
}

/**
 * Deletes a module source file from Supabase Storage.
 * @param path - The storage path of the file to delete.
 * @returns An object containing an error if deletion failed.
 */
export const deleteModuleSourceFile = async (
  path: string
): Promise<{ error: StorageError | Error | null }> => {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
      console.error('Error deleting module source file:', error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error during deletion:', err)
    return { error: err instanceof Error ? err : new Error('Unknown deletion error') }
  }
}
