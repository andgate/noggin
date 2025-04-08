import { useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useDeleteLibrary() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (libraryId: string) => window.api.library.deleteLibrary(libraryId),
        onError: (error) => {
            // An error occured while deleting the library
            console.error('Error deleting library:', error)
        },
        onSuccess: (_, libraryId) => {
            // Invalidate list of all libraries and the library detail
            queryClient.invalidateQueries({ queryKey: libraryKeys.all })

            // Remove the detail cache immediately
            queryClient.removeQueries({ queryKey: libraryKeys.detail(libraryId), exact: true })
        },
        onSettled: () => {
            // Error or success... doesn't matter!
        },
    })
}
