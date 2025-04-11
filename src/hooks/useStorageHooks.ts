import { deleteModuleSourceFile, getPublicUrl, uploadModuleSource } from '@noggin/api/storageApi'
import type { StorageError } from '@supabase/storage-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleKeys, storageKeys } from './query-keys'

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

  type UploadModuleSourceInput = {
    userId: string
    moduleId: string
    file: File
  }

  type UploadModuleSourceResult = {
    path: string | null
    error: StorageError | Error | null
  }

  return useMutation<UploadModuleSourceResult, Error, UploadModuleSourceInput>({
    mutationFn: (variables) =>
      uploadModuleSource(variables.userId, variables.moduleId, variables.file),
    onSuccess: (data, variables) => {
      if (!data.error) {
        console.log('Module source uploaded successfully, path:', data.path)
        // Invalidate queries related to module details and sources
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detailWithDetails(variables.moduleId),
        })
        queryClient.invalidateQueries({
          queryKey: moduleKeys.sources(variables.moduleId),
        })
        // Optionally pre-fetch or set data for the new public URL if needed immediately
        // if (data.path) {
        //   queryClient.prefetchQuery({
        //     queryKey: storageKeys.publicUrl(data.path),
        //     queryFn: () => getPublicUrl(data.path!),
        //   });
        // }
      } else {
        console.error('Upload mutation succeeded but API returned error:', data.error)
      }
    },
    onError: (error) => {
      console.error('Error uploading module source:', error)
      // Potentially show an error notification to the user
    },
  })
}

/**
 * Hook to delete a module source file.
 */
export const useDeleteModuleSourceFile = () => {
  const queryClient = useQueryClient()

  type DeleteModuleSourceInput = {
    path: string
    moduleId: string // Needed for invalidation
  }

  type DeleteModuleSourceResult = {
    error: StorageError | Error | null
  }

  return useMutation<DeleteModuleSourceResult, Error, DeleteModuleSourceInput>({
    mutationFn: (variables) => deleteModuleSourceFile(variables.path),
    onSuccess: (data, variables) => {
      if (!data.error) {
        console.log('Module source file deleted successfully, path:', variables.path)
        // Invalidate queries related to module details and sources
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detailWithDetails(variables.moduleId),
        })
        queryClient.invalidateQueries({
          queryKey: moduleKeys.sources(variables.moduleId),
        })
        // Remove the specific public URL query from the cache
        queryClient.removeQueries({ queryKey: storageKeys.publicUrl(variables.path) })
      } else {
        console.error('Delete mutation succeeded but API returned error:', data.error)
      }
    },
    onError: (error) => {
      console.error('Error deleting module source file:', error)
      // Potentially show an error notification to the user
    },
  })
}
