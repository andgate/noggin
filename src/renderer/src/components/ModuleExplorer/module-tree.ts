import { TreeNodeData } from '@mantine/core'
import { Library } from '@noggin/types/library-types'
import { ModuleOverview } from '@noggin/types/module-types'

// Helper to group modules by library
export function groupModulesByLibrary(modules: ModuleOverview[]): Record<string, ModuleOverview[]> {
    return modules.reduce<Record<string, ModuleOverview[]>>((acc, module) => {
        const librarySlug = module.librarySlug || 'unorganized'
        acc[librarySlug] = acc[librarySlug] || []
        acc[librarySlug].push(module)
        return acc
    }, {})
}

// Convert module to tree node
export function moduleToTreeNode(module: ModuleOverview): TreeNodeData {
    return {
        value: `module-${module.slug}`,
        label: module.displayName,
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

// Create unorganized library node
export function createUnorganizedLibraryNode(modules: ModuleOverview[]): TreeNodeData {
    return {
        value: 'library-unorganized',
        label: 'Unorganized',
        children: modules.map(moduleToTreeNode),
    }
}

// Build complete tree data
export function buildModuleTreeData(
    libraries: Library[],
    moduleOverviews: ModuleOverview[]
): TreeNodeData[] {
    const modulesByLibrary = groupModulesByLibrary(moduleOverviews)

    const unorganizedLibrary = createUnorganizedLibraryNode(modulesByLibrary.unorganized || [])

    const libraryNodes = libraries.map((library) =>
        libraryToTreeNode(library, modulesByLibrary[library.metadata.slug])
    )

    return [unorganizedLibrary, ...libraryNodes]
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
