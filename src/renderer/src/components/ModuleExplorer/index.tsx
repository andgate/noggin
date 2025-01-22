import {
    ActionIcon,
    Group,
    RenderTreeNodePayload,
    Stack,
    Text,
    Tooltip,
    Tree,
    useTree,
} from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import {
    IconFile,
    IconFilePlus,
    IconFolder,
    IconFolderOpen,
    IconFolderPlus,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CreateLibraryModal } from '../CreateLibraryModal'
import { buildModuleTreeData, getInitialExpandedState } from './module-tree'

function TreeNode({ node, expanded, elementProps, tree }: RenderTreeNodePayload) {
    const navigate = useNavigate()

    const originalOnClick = elementProps.onClick
    elementProps.onClick = (e: React.MouseEvent) => {
        originalOnClick?.(e)
        tree.select(node.value)

        if (node.value.startsWith('module-')) {
            const moduleId = node.value.replace('module-', '')
            navigate({ to: '/module/view/$moduleId', params: { moduleId } })
        } else if (node.value.startsWith('library-')) {
            const libraryId = node.value.replace('library-', '')
            if (libraryId !== 'unorganized') {
                navigate({ to: '/library/view/$libraryId', params: { libraryId } })
            }
        }
    }

    const handleContextMenu = () => {
        if (node.value.startsWith('library-')) {
            const libraryId = node.value.replace('library-', '')
            window.api.moduleExplorer.showLibraryContextMenu(libraryId)
        } else if (node.value.startsWith('module-')) {
            const moduleId = node.value.replace('module-', '')
            window.api.moduleExplorer.showModuleContextMenu(moduleId)
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

    // Fetch libraries and modules
    const { data: libraries = [], refetch: refetchLibraries } = useQuery({
        queryKey: ['libraries'],
        queryFn: () => window.api.library.getAllLibraries(),
    })

    const { data: moduleOverviews = [] } = useQuery({
        queryKey: ['moduleOverviews'],
        queryFn: () => window.api.modules.getModuleOverviews(),
    })

    if (collapsed) {
        return null
    }

    // Convert libraries and modules into tree data structure
    const treeData = useMemo(
        () => buildModuleTreeData(libraries, moduleOverviews),
        [libraries, moduleOverviews]
    )

    const initialExpandedState = useMemo(() => getInitialExpandedState(treeData), [treeData])

    const tree = useTree({
        initialExpandedState,
    })

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
