import { TreeNodeData } from '@mantine/core'
import { Library } from '@noggin/types/library-types'
import { ModuleOverview } from '@noggin/types/module-types'

// Helper to group modules by library
export function groupModulesByLibrary(modules: ModuleOverview[]): Record<string, ModuleOverview[]> {
    return modules.reduce<Record<string, ModuleOverview[]>>((acc, module) => {
        // Only group modules that have a library assigned
        if (module.librarySlug) {
            acc[module.librarySlug] = acc[module.librarySlug] || []
            acc[module.librarySlug].push(module)
        }
        return acc
    }, {})
}

// Convert module to tree node
export function moduleToTreeNode(module: ModuleOverview): TreeNodeData {
    return {
        value: `module-${module.id}`,
        label: module.displayName,
        nodeProps: {
            libraryId: module.librarySlug,
        },
    }
}

// Convert library to tree node with its modules
export function libraryToTreeNode(library: Library, modules: ModuleOverview[] = []): TreeNodeData {
    return {
        value: `library-${library.metadata.slug}`,
        label: library.metadata.name,
        children: modules.map(moduleToTreeNode),
    }
}

// Build complete tree data
export function buildModuleTreeData(
    libraries: Library[],
    moduleOverviews: ModuleOverview[]
): TreeNodeData[] {
    const modulesByLibrary = groupModulesByLibrary(moduleOverviews)

    const libraryNodes = libraries.map((library) =>
        libraryToTreeNode(library, modulesByLibrary[library.metadata.slug])
    )

    return libraryNodes
}

// Get initial expanded state for libraries
export function getInitialExpandedState(treeData: TreeNodeData[]): Record<string, boolean> {
    const collectLibraryNodes = (nodes: TreeNodeData[]): string[] => {
        return nodes.flatMap((node) => {
            const values: string[] = []
            if (node.value.startsWith('library-')) {
                values.push(node.value)
            }
            if (node.children) {
                values.push(...collectLibraryNodes(node.children))
            }
            return values
        })
    }

    const libraryNodes = collectLibraryNodes(treeData)
    return libraryNodes.reduce(
        (acc, value) => {
            acc[value] = true
            return acc
        },
        {} as Record<string, boolean>
    )
}
