import { useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useDeleteLibrary() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (librarySlug: string) => window.api.library.deleteLibrary(librarySlug),
        onError: (error) => {
            // An error occured while deleting the library
            console.error('Error deleting library:', error)
        },
        onSuccess: (_, librarySlug) => {
            // Invalidate list of all libraries and the library detail
            queryClient.invalidateQueries({ queryKey: libraryKeys.all })

            // Set the detail cache immediately
            queryClient.removeQueries({ queryKey: libraryKeys.detail(librarySlug), exact: true })
        },
        onSettled: () => {
            // Error or success... doesn't matter!
        },
    })
}
