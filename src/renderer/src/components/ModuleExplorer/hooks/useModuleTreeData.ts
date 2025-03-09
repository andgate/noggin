import { Library } from '@noggin/types/library-types'
import { ModuleOverview } from '@noggin/types/module-types'
import { useEffect, useMemo, useState } from 'react'
import { getInitialExpandedState, libraryToTreeNode } from '../common/module-tree'

/**
 * Custom hook to fetch libraries and modules, then prepare tree data for display
 */
export function useModuleTreeData() {
    const [libraries, setLibraries] = useState<Library[]>([])
    const [modulesByLibrary, setModulesByLibrary] = useState<Record<string, ModuleOverview[]>>({})
    const [isLoading, setIsLoading] = useState(true)

    // Fetch libraries and their modules
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                const libs = await window.api.library.getAllLibraries()
                setLibraries(libs)

                const moduleData: Record<string, ModuleOverview[]> = {}
                for (const lib of libs) {
                    const modules = await window.api.modules.getModuleOverviews(lib.metadata.slug)
                    moduleData[lib.metadata.slug] = modules
                }
                setModulesByLibrary(moduleData)
            } catch (error) {
                console.error('Failed to fetch libraries and modules:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, []) // Only run on mount

    // Convert libraries and modules into tree data structure - memoized
    const treeData = useMemo(
        () =>
            libraries.map((library) =>
                libraryToTreeNode(library, modulesByLibrary[library.metadata.slug] || [])
            ),
        [libraries, modulesByLibrary]
    )

    // Get initial expanded state values - memoized
    const initialExpanded = useMemo(() => getInitialExpandedState(treeData), [treeData])

    const refetchLibraries = async () => {
        setIsLoading(true)
        try {
            const libs = await window.api.library.getAllLibraries()
            setLibraries(libs)

            const moduleData: Record<string, ModuleOverview[]> = {}
            for (const lib of libs) {
                const modules = await window.api.modules.getModuleOverviews(lib.metadata.slug)
                moduleData[lib.metadata.slug] = modules
            }
            setModulesByLibrary(moduleData)
        } catch (error) {
            console.error('Failed to refetch libraries:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        treeData,
        initialExpanded,
        libraries,
        isLoading,
        refetchLibraries,
    }
}
