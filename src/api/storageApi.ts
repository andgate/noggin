import { supabase } from '@noggin/app/common/supabase-client'
import { type StorageError } from '@supabase/storage-js'

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
