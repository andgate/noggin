import { TreeNodeData } from '@mantine/core'
import { Tables } from '@noggin/types/database.types'

type DbLibrary = Tables<'libraries'>
type DbModule = Tables<'modules'>

// Helper to group modules by library
export function groupModulesByLibrary(modules: DbModule[]): Record<string, DbModule[]> {
  return modules.reduce<Record<string, DbModule[]>>((acc, module) => {
    // Only group modules that have a library assigned
    // Use library_id from DbModule
    if (module.library_id) {
      acc[module.library_id] = acc[module.library_id] || []
      acc[module.library_id].push(module)
    }
    return acc
  }, {})
}

// Convert module to tree node
export function moduleToTreeNode(module: DbModule): TreeNodeData {
  return {
    value: `module-${module.id}`,
    // Use title from DbModule
    label: module.title ?? 'Untitled Module', // Use nullish coalescing for safety
    nodeProps: {
      // Use library_id from DbModule
      libraryId: module.library_id,
    },
  }
}

// Convert library to tree node with its modules
// Update type to DbLibrary
export function libraryToTreeNode(library: DbLibrary, modules: DbModule[] = []): TreeNodeData {
  return {
    value: `library-${library.id}`,
    // Use name from DbLibrary
    label: library.name,
    children: modules.map(moduleToTreeNode),
  }
}

// Build complete tree data
export function buildModuleTreeData(
  libraries: DbLibrary[], // Update type
  modules: DbModule[] // Update type
): TreeNodeData[] {
  const modulesByLibrary = groupModulesByLibrary(modules)

  const libraryNodes = libraries.map((library) =>
    // Ensure modulesByLibrary[library.id] is defined or pass empty array
    libraryToTreeNode(library, modulesByLibrary[library.id] || [])
  )

  return libraryNodes
}

export function getInitialExpandedState(nodes: TreeNodeData[]): string[] {
  return nodes.reduce<string[]>((acc, node) => {
    if (node.value.startsWith('library-')) {
      acc.push(node.value)
    }
    return acc
  }, [])
}
