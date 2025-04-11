import { TreeNodeData } from '@mantine/core'

// Type alias for tree expanded state
export type TreeExpandedState = Record<string, boolean>

// Type for tree node identification
export interface NodeIdentifier {
    nodeId: string
    nodeType: 'library' | 'module'
    libraryId?: string
}

// Helper functions for node identification
export function getNodeIdentifier(nodeValue: string): NodeIdentifier {
    if (nodeValue.startsWith('module-')) {
        const nodeId = nodeValue.replace('module-', '')
        return {
            nodeId,
            nodeType: 'module',
        }
    } else if (nodeValue.startsWith('library-')) {
        const nodeId = nodeValue.replace('library-', '')
        return {
            nodeId,
            nodeType: 'library',
            libraryId: nodeId,
        }
    }

    throw new Error(`Unknown node type: ${nodeValue}`)
}

// Helper to check node types
export function isLibraryNode(node: TreeNodeData): boolean {
    return node.value.startsWith('library-')
}

export function isModuleNode(node: TreeNodeData): boolean {
    return node.value.startsWith('module-')
}
