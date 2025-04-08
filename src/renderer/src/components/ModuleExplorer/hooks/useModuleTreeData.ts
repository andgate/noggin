import { ModuleOverview } from '@noggin/types/module-types'
import { useReadAllLibraries } from '@renderer/app/hooks/library/use-read-all-libraries'
import { useQueries } from '@tanstack/react-query' // Import useQueries and client
import { useMemo } from 'react'
import { getInitialExpandedState, libraryToTreeNode } from '../common/module-tree'

/**
 * Custom hook to fetch libraries and modules, then prepare tree data for display
 */
export function useModuleTreeData() {
    const { data: libraries = [], isLoading: isLoadingLibraries } = useReadAllLibraries()

    // Dynamically fetch module overviews for each library using useQueries
    const moduleOverviewQueries = useQueries({
        queries: libraries.map((library) => ({
            // Define a unique query key for each library's modules
            queryKey: ['moduleOverviews', library.slug],
            queryFn: () => window.api.modules.getModuleOverviews(library.slug),
            // Only enable the query once libraries are loaded
            enabled: !!libraries.length,
            // Consider adding staleTime if appropriate
            // staleTime: 1000 * 60 * 5, // 5 minutes
        })),
    })

    // Determine overall loading state
    const isLoadingModules = moduleOverviewQueries.some((q) => q.isLoading)
    const isLoading = isLoadingLibraries || isLoadingModules

    // Combine module data into the desired structure { [librarySlug]: ModuleOverview[] }
    const modulesByLibrary = useMemo(() => {
        const data: Record<string, ModuleOverview[]> = {}
        libraries.forEach((library, index) => {
            // Ensure the query result exists and has data
            if (moduleOverviewQueries[index]?.data) {
                data[library.slug] = moduleOverviewQueries[index].data
            }
        })
        return data
    }, [libraries, moduleOverviewQueries])

    // Convert libraries and modules into tree data structure - memoized
    const treeData = useMemo(
        () =>
            libraries.map((library) =>
                libraryToTreeNode(library, modulesByLibrary[library.slug] || [])
            ),
        [libraries, modulesByLibrary]
    )

    // Get initial expanded state values - memoized
    const initialExpanded = useMemo(() => getInitialExpandedState(treeData), [treeData])

    return {
        treeData,
        initialExpanded,
        libraries,
        isLoading,
    }
}
