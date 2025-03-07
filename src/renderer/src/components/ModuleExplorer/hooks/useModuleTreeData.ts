import { TreeNodeData } from '@mantine/core'
import { ModuleOverview } from '@noggin/types/module-types'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getInitialExpandedState, libraryToTreeNode } from '../common/module-tree'

/**
 * Custom hook to fetch libraries and modules, then prepare tree data for display
 */
export function useModuleTreeData() {
    // Fetch libraries
    const {
        data: libraries = [],
        refetch: refetchLibraries,
        isLoading: isLoadingLibraries,
    } = useQuery({
        queryKey: ['libraries'],
        queryFn: () => window.api.library.getAllLibraries(),
    })

    // Fetch modules for each library
    const moduleQueries = useQueries({
        queries: libraries.map((library) => ({
            queryKey: ['moduleOverviews', library.metadata.slug],
            queryFn: () => window.api.modules.getModuleOverviews(library.metadata.slug),
        })),
    })

    // Check if module queries are still loading
    const isLoadingModules = useMemo(
        () => moduleQueries.some((query) => query.isLoading),
        [moduleQueries]
    )

    // Convert libraries and modules into tree data structure
    const treeData: TreeNodeData[] = useMemo(() => {
        const modulesByLibrary = moduleQueries.reduce(
            (acc, query, index) => {
                if (query.data) {
                    acc[libraries[index].metadata.slug] = query.data
                }
                return acc
            },
            {} as Record<string, ModuleOverview[]>
        )

        return libraries.map((library) =>
            libraryToTreeNode(library, modulesByLibrary[library.metadata.slug] || [])
        )
    }, [libraries, moduleQueries])

    // Get initial expanded state values
    const initialExpanded = useMemo(() => getInitialExpandedState(treeData), [treeData])

    return {
        treeData,
        initialExpanded,
        libraries,
        isLoading: isLoadingLibraries || isLoadingModules,
        refetchLibraries,
    }
}
