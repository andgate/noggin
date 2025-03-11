import { Group, RenderTreeNodePayload, Text, Tooltip } from '@mantine/core'
import { IconFile, IconFolder, IconFolderOpen } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { getNodeIdentifier, isLibraryNode, isModuleNode } from '../types'

// Navigation helpers
function navigateToModule(
    navigate: ReturnType<typeof useNavigate>,
    libraryId: string,
    moduleId: string
) {
    navigate({ to: '/module/view/$libraryId/$moduleId', params: { libraryId, moduleId } })
}

function navigateToLibrary(navigate: ReturnType<typeof useNavigate>, libraryId: string) {
    navigate({ to: '/library/view/$libraryId', params: { libraryId } })
}

// Context menu handlers
function handleModuleContextMenu(libraryId: string | undefined, moduleId: string) {
    if (!libraryId) {
        console.error(`Library ID not found for module ${moduleId}`)
        return
    }
    window.api.moduleExplorer.showModuleContextMenu(libraryId, moduleId)
}

function handleLibraryContextMenu(libraryId: string) {
    window.api.moduleExplorer.showLibraryContextMenu(libraryId)
}

export function TreeNode({ node, expanded, elementProps, tree }: RenderTreeNodePayload) {
    const navigate = useNavigate()

    const originalOnClick = elementProps.onClick
    elementProps.onClick = (e: React.MouseEvent) => {
        originalOnClick?.(e)
        tree.select(node.value)

        try {
            const { nodeType, nodeId, libraryId } = getNodeIdentifier(node.value)

            if (nodeType === 'module') {
                // For modules, we need the libraryId from node props
                const nodeLibraryId = node.nodeProps?.libraryId
                if (!nodeLibraryId) {
                    console.error(`Library ID not found for module ${nodeId}`)
                    return
                }
                navigateToModule(navigate, nodeLibraryId, nodeId)
            } else if (nodeType === 'library' && libraryId) {
                navigateToLibrary(navigate, libraryId)
            }
        } catch (error) {
            console.error('Error handling tree node click:', error)
        }
    }

    const handleContextMenu = () => {
        try {
            const { nodeType, nodeId, libraryId } = getNodeIdentifier(node.value)

            if (nodeType === 'library' && libraryId) {
                handleLibraryContextMenu(libraryId)
            } else if (nodeType === 'module') {
                const nodeLibraryId = node.nodeProps?.libraryId
                handleModuleContextMenu(nodeLibraryId, nodeId)
            }
        } catch (error) {
            console.error('Error handling context menu:', error)
        }
    }

    return (
        <Group gap={0} {...elementProps} onContextMenu={handleContextMenu} w="100%">
            <Tooltip label={node.label} openDelay={800} position="bottom" withinPortal>
                <Group
                    gap="xs"
                    bg={isLibraryNode(node) ? 'var(--mantine-color-dark-8)' : undefined}
                    px="xs"
                    py={4}
                    w="100%"
                    wrap="nowrap"
                >
                    {isModuleNode(node) ? (
                        <IconFile size={16} style={{ flexShrink: 0 }} />
                    ) : expanded ? (
                        <IconFolderOpen size={16} style={{ flexShrink: 0 }} />
                    ) : (
                        <IconFolder size={16} style={{ flexShrink: 0 }} />
                    )}
                    <Text
                        size="sm"
                        truncate="end"
                        c={isLibraryNode(node) ? 'dimmed' : undefined}
                        style={{ flexGrow: 1, minWidth: 0 }}
                    >
                        {node.label}
                    </Text>
                </Group>
            </Tooltip>
        </Group>
    )
}
