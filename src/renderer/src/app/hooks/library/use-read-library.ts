import { useQuery } from '@tanstack/react-query'
import { libraryKeys } from '../query-keys'

export function useReadLibrary(libraryId: string) {
    return useQuery({
        queryKey: libraryKeys.detail(libraryId),
        queryFn: async () => window.api.library.readLibrary(libraryId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!libraryId,
    })
}
