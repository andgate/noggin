import { getModulesByLibrary } from '@noggin/api/moduleApi' // Added import
import { moduleKeys } from '@noggin/hooks/query-keys' // Added import
import { useLibraries } from '@noggin/hooks/useLibraryHooks' // Updated import
import { Tables } from '@noggin/types/database.types' // Added imports for Db types
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getInitialExpandedState, libraryToTreeNode } from '../common/module-tree'

type DbLibrary = Tables<'libraries'>
type DbModule = Tables<'modules'>

/**
 * Custom hook to fetch libraries and modules, then prepare tree data for display
 */
export function useModuleTreeData() {
  // Use the new useLibraries hook
  const { data: libraries = [], isLoading: isLoadingLibraries } = useLibraries()

  // Dynamically fetch module overviews for each library using useQueries
  const moduleOverviewQueries = useQueries({
    queries: (libraries as DbLibrary[]).map((library) => ({
      // Cast libraries to DbLibrary[]
      // Use the new query key structure
      queryKey: moduleKeys.list(library.id),
      // Use the new API function
      queryFn: () => getModulesByLibrary(library.id),
      // Only enable the query once libraries are loaded
      enabled: !!libraries.length,
      // Consider adding staleTime if appropriate
      // staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  })

  // Determine overall loading state
  const isLoadingModules = moduleOverviewQueries.some((q) => q.isLoading)
  const isLoading = isLoadingLibraries || isLoadingModules

  // Combine module data into the desired structure
  const modulesByLibrary = useMemo(() => {
    const data: Record<string, DbModule[]> = {} // Use DbModule type
    ;(libraries as DbLibrary[]).forEach((library, index) => {
      // Cast libraries to DbLibrary[]
      // Ensure the query result exists and has data
      if (moduleOverviewQueries[index]?.data) {
        // Assign the fetched modules (already DbModule[])
        data[library.id] = moduleOverviewQueries[index].data as DbModule[]
      }
    })
    return data
  }, [libraries, moduleOverviewQueries])

  // Convert libraries and modules into tree data structure - memoized
  const treeData = useMemo(
    () =>
      (libraries as DbLibrary[]).map(
        // Cast libraries to DbLibrary[]
        (library) => libraryToTreeNode(library, modulesByLibrary[library.id] || [])
      ),
    [libraries, modulesByLibrary]
  )

  // Get initial expanded state values - memoized
  const initialExpanded = useMemo(() => getInitialExpandedState(treeData), [treeData])

  return {
    treeData,
    initialExpanded,
    libraries: libraries as DbLibrary[], // Cast libraries to DbLibrary[] on return
    isLoading,
  }
}
