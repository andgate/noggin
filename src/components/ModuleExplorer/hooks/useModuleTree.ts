import { TreeNodeData, useTree } from '@mantine/core'
import { useEffect } from 'react'
import { TreeExpandedState } from '../types'

/**
 * Custom hook to handle tree state management and initialization
 */
export function useModuleTree(treeData: TreeNodeData[], initialExpanded: string[] = []) {
  // Create a stable initial expanded state - empty object since we'll initialize later
  const emptyState = {} as TreeExpandedState

  // Create the tree controller with stable props
  const tree = useTree({
    initialExpandedState: emptyState,
    multiple: false,
  })

  // Initialize tree with data and expand nodes only once when data is available
  useEffect(() => {
    if (treeData.length > 0) {
      tree.initialize(treeData)
      initialExpanded.forEach((value) => tree.expand(value))
    }
  }, [treeData, initialExpanded]) // Only run when treeData or initialExpanded changes

  return tree
}
