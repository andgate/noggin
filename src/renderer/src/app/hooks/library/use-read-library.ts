import { useQuery } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useReadLibrary(librarySlug: string) {
    return useQuery({
        queryKey: libraryKeys.detail(librarySlug),
        queryFn: async () => window.api.library.readLibrary(librarySlug),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!librarySlug,
    })
}
