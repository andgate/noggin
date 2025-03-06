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

export function getInitialExpandedState(nodes: TreeNodeData[]): string[] {
    return nodes.reduce<string[]>((acc, node) => {
        if (node.value.startsWith('library-')) {
            acc.push(node.value)
        }
        return acc
    }, [])
}
