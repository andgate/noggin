import { deleteModuleSourceFile, getPublicUrl, uploadModuleSource } from '@/core/api/storageApi'
import type { StorageError } from '@supabase/storage-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleKeys, storageKeys } from './query-keys'

// --- Exported Hook Input/Result Types ---

export type UploadModuleSourceHookInput = {
  userId: string
  moduleId: string
  file: File
}

export type UploadModuleSourceHookResult = {
  path: string | null
  error: StorageError | Error | null
}

export type DeleteModuleSourceFileHookInput = {
  path: string
  moduleId: string // Needed for invalidation
}

export type DeleteModuleSourceFileHookResult = {
  error: StorageError | Error | null
}

// --- Hooks ---

/**
 * Hook to get the public URL for a storage object.
 * @param path - The path to the file in storage.
 */
export const useGetPublicUrl = (path: string | undefined | null) => {
  return useQuery<{ publicUrl: string }, Error>({
    queryKey: storageKeys.publicUrl(path!), // Use non-null assertion as enabled handles null/undefined
    queryFn: () => getPublicUrl(path!),
    enabled: !!path, // Only run the query if path is provided
    staleTime: Infinity, // Public URLs generally don't change unless the object is deleted/moved
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  })
}

/**
 * Hook to upload a module source file.
 */
export const useUploadModuleSource = () => {
  const queryClient = useQueryClient()

  return useMutation<UploadModuleSourceHookResult, Error, UploadModuleSourceHookInput>({
    mutationFn: (variables) =>
      uploadModuleSource(variables.userId, variables.moduleId, variables.file),
    onSuccess: (data, variables) => {
      if (!data.error) {
        console.log('Module source uploaded successfully, path:', data.path)
        // Invalidate queries related to module details and sources
        // Use the updated module detail query key
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
        queryClient.invalidateQueries({ queryKey: moduleKeys.sources(variables.moduleId) }) // Keep this if a dedicated sources query exists
      } else {
        console.error('Upload mutation succeeded but API returned error:', data.error)
      }
    },
    onError: (error) => {
      console.error('Error uploading module source:', error)
    },
  })
}

/**
 * Hook to delete a module source file.
 */
export const useDeleteModuleSourceFile = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteModuleSourceFileHookResult, Error, DeleteModuleSourceFileHookInput>({
    mutationFn: (variables) => deleteModuleSourceFile(variables.path),
    onSuccess: (data, variables) => {
      if (!data.error) {
        console.log('Module source file deleted successfully, path:', variables.path)
        // Invalidate queries related to module details and sources
        // Use the updated module detail query key
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
        queryClient.invalidateQueries({ queryKey: moduleKeys.sources(variables.moduleId) }) // Keep this if needed
        // Remove the specific public URL query from the cache
        queryClient.removeQueries({ queryKey: storageKeys.publicUrl(variables.path) })
      } else {
        console.error('Delete mutation succeeded but API returned error:', data.error)
      }
    },
    onError: (error) => {
      console.error('Error deleting module source file:', error)
    },
  })
}
