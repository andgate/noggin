import { TreeNodeData } from '@mantine/core'
import { Tables } from '@noggin/types/database.types'

type DbModule = Tables<'modules'>

/**
 * Converts a module database object into a TreeNodeData structure
 * suitable for the Mantine Tree component.
 *
 * @param module - The module object from the database.
 * @returns TreeNodeData representing the module.
 */
export function moduleToTreeNode(module: DbModule): TreeNodeData {
  return {
    // Unique value for the node, prefixed to avoid clashes if other types were present
    value: `module-${module.id}`,
    // Display label for the node
    label: module.title ?? 'Untitled Module', // Use nullish coalescing for safety
  }
}

/**
 * Builds a flat list of tree nodes directly from the module list.
 *
 * @param modules - An array of module objects from the database.
 * @returns An array of TreeNodeData, one for each module.
 */
export function buildModuleTreeData(modules: DbModule[]): TreeNodeData[] {
  // Directly map modules to tree nodes
  return modules.map(moduleToTreeNode)
}
