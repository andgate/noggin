import {
    ActionIcon,
    Group,
    RenderTreeNodePayload,
    Stack,
    Text,
    Tooltip,
    Tree,
    TreeNodeData,
    useTree,
} from '@mantine/core'
import { ModuleOverview } from '@noggin/types/module-types'
import { useUiStore } from '@renderer/app/stores/ui-store'
import {
    IconFile,
    IconFilePlus,
    IconFolder,
    IconFolderOpen,
    IconFolderPlus,
} from '@tabler/icons-react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CreateLibraryModal } from '../CreateLibraryModal'
import { getInitialExpandedState, libraryToTreeNode } from './module-tree'

// Type alias for tree expanded state
type TreeExpandedState = Record<string, boolean>

function TreeNode({ node, expanded, elementProps, tree }: RenderTreeNodePayload) {
    const navigate = useNavigate()

    const originalOnClick = elementProps.onClick
    elementProps.onClick = (e: React.MouseEvent) => {
        originalOnClick?.(e)
        tree.select(node.value)

        if (node.value.startsWith('module-')) {
            const moduleId = node.value.replace('module-', '')
            const libraryId = node.nodeProps?.libraryId
            if (!libraryId) {
                console.error(`Library ID not found for module ${moduleId}`)
                return
            }
            navigate({ to: '/module/view/$libraryId/$moduleId', params: { libraryId, moduleId } })
        } else if (node.value.startsWith('library-')) {
            const libraryId = node.value.replace('library-', '')
            navigate({ to: '/library/view/$libraryId', params: { libraryId } })
        }
    }

    const handleContextMenu = () => {
        if (node.value.startsWith('library-')) {
            const libraryId = node.value.replace('library-', '')
            window.api.moduleExplorer.showLibraryContextMenu(libraryId)
        } else if (node.value.startsWith('module-')) {
            const moduleId = node.value.replace('module-', '')
            const libraryId = node.nodeProps?.libraryId
            if (!libraryId) {
                console.error(`Library ID not found for module ${moduleId}`)
                return
            }
            window.api.moduleExplorer.showModuleContextMenu(libraryId, moduleId)
        }
    }

    return (
        <Group gap={0} {...elementProps} onContextMenu={handleContextMenu}>
            <Group
                gap="xs"
                bg={node.value.startsWith('library-') ? 'var(--mantine-color-dark-8)' : undefined}
                px="xs"
                py={4}
                w="100%"
            >
                {node.value.startsWith('module-') ? (
                    <IconFile size={16} />
                ) : expanded ? (
                    <IconFolderOpen size={16} />
                ) : (
                    <IconFolder size={16} />
                )}
                <Text
                    size="sm"
                    truncate
                    c={node.value.startsWith('library-') ? 'dimmed' : undefined}
                >
                    {node.label}
                </Text>
            </Group>
        </Group>
    )
}

export function ModuleExplorer() {
    const navigate = useNavigate()
    const collapsed = useUiStore((s) => s.explorerCollapsed)
    const [createLibraryOpen, setCreateLibraryOpen] = useState(false)

    // Use a ref to track if tree data has been initialized
    const initializedRef = useRef(false)

    // Fetch libraries first
    const { data: libraries = [], refetch: refetchLibraries } = useQuery({
        queryKey: ['libraries'],
        queryFn: () => window.api.library.getAllLibraries(),
    })

    // Then fetch modules for each library
    const moduleQueries = useQueries({
        queries: libraries.map((library) => ({
            queryKey: ['moduleOverviews', library.metadata.slug],
            queryFn: () => window.api.modules.getModuleOverviews(library.metadata.slug),
        })),
    })

    // Convert libraries and modules into tree data structure
    const treeData: TreeNodeData[] = useMemo(() => {
        const modulesByLibrary = moduleQueries.reduce(
            (acc, query, index) => {
                if (query.data) {
                    acc[libraries[index].metadata.slug] = query.data
                }
                return acc
            },
            {} as Record<string, ModuleOverview[]>
        )

        return libraries.map((library) =>
            libraryToTreeNode(library, modulesByLibrary[library.metadata.slug] || [])
        )
    }, [libraries, moduleQueries])

    // Create a stable initial expanded state - empty object since we'll initialize later
    const initialExpandedState = useMemo<TreeExpandedState>(() => ({}), [])

    // Create the tree controller with stable props
    const tree = useTree({
        initialExpandedState,
        multiple: false,
    })

    // Update the tree data when it changes
    useEffect(() => {
        if (treeData.length > 0) {
            // Initialize tree with the current data, this also sets up the expanded state
            tree.initialize(treeData)

            // If this is the first time with real data, expand all library nodes
            if (!initializedRef.current) {
                const expandedValues = getInitialExpandedState(treeData)
                expandedValues.forEach((value) => tree.expand(value))
                initializedRef.current = true
            }
        }
    }, [treeData, tree])

    if (collapsed) {
        return null
    }

    return (
        <Stack gap={0} h="100%">
            <Group px="xs" py={8} justify="space-between" bg="var(--mantine-color-dark-6)">
                <Text size="xs" fw={500}>
                    MODULE EXPLORER
                </Text>
                <Group gap={4}>
                    <Tooltip label="Create new library">
                        <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => setCreateLibraryOpen(true)}
                        >
                            <IconFolderPlus size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Create new module">
                        <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => navigate({ to: '/module/create' })}
                        >
                            <IconFilePlus size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Tree data={treeData} renderNode={TreeNode} tree={tree} />

            <CreateLibraryModal
                opened={createLibraryOpen}
                onClose={() => setCreateLibraryOpen(false)}
                onCreated={() => {
                    setCreateLibraryOpen(false)
                    refetchLibraries()
                }}
            />
        </Stack>
    )
}
