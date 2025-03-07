import { Stack, Tree } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { useState } from 'react'
import { CreateLibraryModal } from '../CreateLibraryModal'
import { ExplorerHeader } from './components/ExplorerHeader'
import { TreeNode } from './components/TreeNode'
import { useModuleTree } from './hooks/useModuleTree'
import { useModuleTreeData } from './hooks/useModuleTreeData'

export function ModuleExplorer() {
    const collapsed = useUiStore((s) => s.explorerCollapsed)
    const [createLibraryOpen, setCreateLibraryOpen] = useState(false)

    // Get tree data using our custom hook
    const { treeData, initialExpanded, refetchLibraries } = useModuleTreeData()

    // Get tree controller using our custom hook
    const tree = useModuleTree(treeData, initialExpanded)

    const handleCreateLibrary = () => {
        setCreateLibraryOpen(true)
    }

    const handleLibraryCreated = () => {
        setCreateLibraryOpen(false)
        refetchLibraries()
    }

    if (collapsed) {
        return null
    }

    return (
        <Stack gap={0} h="100%">
            <ExplorerHeader onCreateLibrary={handleCreateLibrary} />

            <Tree data={treeData} renderNode={TreeNode} tree={tree} />

            <CreateLibraryModal
                opened={createLibraryOpen}
                onClose={() => setCreateLibraryOpen(false)}
                onCreated={handleLibraryCreated}
            />
        </Stack>
    )
}
