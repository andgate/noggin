import { Stack, Tree } from '@mantine/core'
import { TreeNode } from './components/TreeNode'
import { useModuleTree } from './hooks/useModuleTree'
import { useModuleTreeData } from './hooks/useModuleTreeData'

export function ModuleExplorer() {
    // Get tree data using our custom hook
    const { treeData, initialExpanded } = useModuleTreeData()

    // Get tree controller using our custom hook
    const tree = useModuleTree(treeData, initialExpanded)

    return (
        <Stack style={{ height: '100%', padding: '10px 0' }}>
            <Tree data={treeData} renderNode={TreeNode} tree={tree} style={{ paddingLeft: 10 }} />
        </Stack>
    )
}
