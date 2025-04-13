import { getDueModules, type DueModuleWithSources } from '@noggin/api/practiceFeedApi'
import { practiceFeedKeys } from '@noggin/hooks/query-keys'
import { useQuery } from '@tanstack/react-query'

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000

/**
 * Hook to fetch modules due for practice, including their source paths.
 */
export function useGetDueModules() {
  return useQuery<DueModuleWithSources[], Error>({
    queryKey: practiceFeedKeys.dueModules,
    queryFn: getDueModules,
    staleTime: FIVE_MINUTES_IN_MS,
  })
}
