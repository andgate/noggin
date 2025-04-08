import { useQuery } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useReadAllLibraries() {
    return useQuery({
        queryKey: [libraryKeys.all],
        queryFn: async () => window.api.library.readAllLibraries(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
