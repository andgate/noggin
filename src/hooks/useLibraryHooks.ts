import {
  createLibrary,
  deleteLibrary,
  getAllLibraries,
  getLibrary,
  updateLibrary,
} from '@noggin/api/libraryApi'
import type { Database } from '@noggin/types/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { libraryKeys } from './query-keys'

// Define the DbLibrary type based on the Database schema
type DbLibrary = Database['public']['Tables']['libraries']['Row']

/**
 * Hook to fetch all libraries.
 */
export const useLibraries = () => {
  return useQuery<DbLibrary[], Error>({
    queryKey: libraryKeys.all,
    queryFn: getAllLibraries,
    staleTime: 1000 * 60 * 5, // 5 minutes (matching existing hooks)
  })
}

/**
 * Hook to fetch a single library by its ID.
 * @param libraryId The ID of the library to fetch, or null/undefined if no library should be fetched.
 */
export const useLibrary = (libraryId: string | null | undefined) => {
  return useQuery<DbLibrary | null, Error>({
    queryKey: libraryKeys.detail(libraryId!), // Use key structure from query-keys.ts
    queryFn: () => getLibrary(libraryId!),
    staleTime: 1000 * 60 * 5, // 5 minutes (matching existing hooks)
    enabled: !!libraryId, // Only run the query if libraryId is truthy
  })
}

/**
 * Hook to create a new library.
 */
export const useCreateLibrary = () => {
  const queryClient = useQueryClient()
  // Define the input type matching the createLibrary API function signature
  type CreateLibraryInput = { name: string; description: string }

  return useMutation<DbLibrary, Error, CreateLibraryInput>({
    mutationFn: (vars) => createLibrary(vars.name, vars.description),
    onSuccess: (newLibrary) => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: libraryKeys.all })

      // Immediately update the detail cache for the new library
      queryClient.setQueryData(libraryKeys.detail(newLibrary.id), newLibrary)

      // Optionally, optimistically add to the 'all' list cache
      // queryClient.setQueryData<DbLibrary[]>(libraryKeys.all, (oldData) =>
      //     oldData ? [...oldData, newLibrary] : [newLibrary]
      // );
    },
    onError: (error) => {
      console.error('Error creating library:', error)
      // Invalidate if optimistic updates were used for the list
      // queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  })
}

/**
 * Hook to update an existing library. Includes optimistic updates.
 */
export const useUpdateLibrary = () => {
  const queryClient = useQueryClient()
  // Define the input type matching the updateLibrary API function signature
  type UpdateLibraryInput = {
    libraryId: string
    updates: Partial<Pick<DbLibrary, 'name' | 'description'>>
  }

  return useMutation<
    DbLibrary | null,
    Error,
    UpdateLibraryInput,
    { previousLibrary: DbLibrary | undefined; libraryId: string }
  >({
    mutationFn: (vars) => updateLibrary(vars.libraryId, vars.updates),
    onMutate: async ({ libraryId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: libraryKeys.detail(libraryId) })

      // Snapshot previous value
      const previousLibrary = queryClient.getQueryData<DbLibrary>(libraryKeys.detail(libraryId))

      // Optimistically update
      if (previousLibrary) {
        queryClient.setQueryData<DbLibrary>(libraryKeys.detail(libraryId), {
          ...previousLibrary,
          ...updates,
        })
      }
      // Optionally update optimistically in the 'all' list cache
      // queryClient.setQueryData<DbLibrary[]>(libraryKeys.all, (old) =>
      //     old?.map(lib => lib.id === libraryId ? { ...lib, ...updates } : lib) ?? []
      // );

      return { previousLibrary, libraryId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating library ${variables.libraryId}:`, err)
      // Rollback on error
      if (context?.previousLibrary) {
        queryClient.setQueryData(libraryKeys.detail(context.libraryId), context.previousLibrary)
      }
      // Optionally rollback 'all' list cache if needed
      // queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: libraryKeys.detail(variables.libraryId) })
      queryClient.invalidateQueries({ queryKey: libraryKeys.all })
    },
  })
}

/**
 * Hook to delete a library. Includes cache removal on success.
 */
export const useDeleteLibrary = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, string>({
    // Input is libraryId (string)
    mutationFn: deleteLibrary,
    onSuccess: (success, libraryId) => {
      if (success) {
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: libraryKeys.all })
        // Immediately remove the detail query from cache
        queryClient.removeQueries({ queryKey: libraryKeys.detail(libraryId), exact: true })
        // Optionally, optimistically remove from the 'all' list cache
        // queryClient.setQueryData<DbLibrary[]>(libraryKeys.all, (old) =>
        //     old?.filter(lib => lib.id !== libraryId) ?? []
        // );
      } else {
        console.error(`Failed to delete library ${libraryId}, API returned false.`)
        // Consider invalidating to refetch if deletion failed unexpectedly
        // queryClient.invalidateQueries({ queryKey: libraryKeys.all });
        // queryClient.invalidateQueries({ queryKey: libraryKeys.detail(libraryId) });
      }
    },
    onError: (error, libraryId) => {
      console.error(`Error deleting library ${libraryId}:`, error)
      // Invalidate queries to revert potential optimistic updates
      // queryClient.invalidateQueries({ queryKey: libraryKeys.all });
      // queryClient.invalidateQueries({ queryKey: libraryKeys.detail(libraryId) });
    },
  })
}
