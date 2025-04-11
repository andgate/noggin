import { getDueModules } from '@noggin/api/practiceFeedApi'
import { practiceFeedKeys } from '@noggin/hooks/query-keys'
import { Tables } from '@noggin/types/database.types'
import { useQuery } from '@tanstack/react-query'

type DbModule = Tables<'modules'>

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000

/**
 * Hook to fetch modules due for practice.
 */
export function useGetDueModules() {
  return useQuery<DbModule[], Error>({
    queryKey: practiceFeedKeys.dueModules,
    queryFn: getDueModules,
    staleTime: FIVE_MINUTES_IN_MS, // Cache data for 5 minutes
  })
}
