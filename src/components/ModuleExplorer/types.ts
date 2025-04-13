import { TreeNodeData } from '@mantine/core'

// Type alias for tree expanded state (can be kept if needed for future nesting, but currently unused)
// export type TreeExpandedState = Record<string, boolean>

// Type for tree node identification - simplified to only modules
export interface NodeIdentifier {
  nodeId: string
  nodeType: 'module'
}

// Helper functions for node identification - simplified
export function getNodeIdentifier(nodeValue: string): NodeIdentifier {
  if (nodeValue.startsWith('module-')) {
    const nodeId = nodeValue.replace('module-', '')
    return {
      nodeId,
      nodeType: 'module',
    }
  }

  throw new Error(`Unknown node type or prefix: ${nodeValue}`)
}

export function isModuleNode(node: TreeNodeData): boolean {
  return node.value.startsWith('module-')
}
