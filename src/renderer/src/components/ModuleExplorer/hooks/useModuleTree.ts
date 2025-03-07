import { TreeNodeData, useTree } from '@mantine/core'
import { useEffect, useRef } from 'react'
import { TreeExpandedState } from '../types'

/**
 * Custom hook to handle tree state management and initialization
 */
export function useModuleTree(treeData: TreeNodeData[], initialExpanded: string[] = []) {
    // Track if tree has been initialized
    const initializedRef = useRef(false)

    // Create a stable initial expanded state - empty object since we'll initialize later
    const emptyState = {} as TreeExpandedState

    // Create the tree controller with stable props
    const tree = useTree({
        initialExpandedState: emptyState,
        multiple: false,
    })

    // Update the tree data when it changes
    useEffect(() => {
        if (treeData.length > 0) {
            // Initialize tree with the current data
            tree.initialize(treeData)

            // If this is the first time with real data, expand all nodes in initialExpanded
            if (!initializedRef.current) {
                initialExpanded.forEach((value) => tree.expand(value))
                initializedRef.current = true
            }
        }
    }, [treeData, tree, initialExpanded])

    return tree
}
