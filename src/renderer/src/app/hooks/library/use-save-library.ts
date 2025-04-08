import type { Library } from '@noggin/types/library-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useSaveLibrary() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (library: Library) => window.api.library.saveLibrary(library),
        onError: (error) => {
            // An error occured while saving the library
            console.error('Error saving library:', error)
        },
        onSuccess: (_, library) => {
            // Invalidate list of all libraries and the library detail
            queryClient.invalidateQueries({ queryKey: libraryKeys.all })

            // Set the detail cache immediately
            queryClient.setQueryData(libraryKeys.detail(library.id), library)
        },
        onSettled: () => {
            // Error or success... doesn't matter!
        },
    })
}
