import { Box, Group, RenderTreeNodePayload, Text, Tooltip } from '@mantine/core'
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

// Context menu handlers removed

export function TreeNode({ node, expanded, elementProps, tree }: RenderTreeNodePayload) {
  const navigate = useNavigate()
  const originalOnClick = elementProps.onClick

  const { onClick: _removedOnClick, ...restElementProps } = elementProps

  // Helper function for handling module clicks (icon or text)
  const handleModuleNodeClick = () => {
    tree.select(node.value) // Select the node first
    try {
      const { nodeId } = getNodeIdentifier(node.value)
      // For modules, we need the libraryId from node props
      const nodeLibraryId = node.nodeProps?.libraryId
      if (!nodeLibraryId) {
        console.error(`Library ID not found for module ${nodeId}`)
        return
      }
      navigateToModule(navigate, nodeLibraryId, nodeId)
    } catch (error) {
      console.error('Error handling module node click:', error)
    }
  }

  // handleContextMenu function removed

  // Handler for clicking the text label (Module or Library name)
  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    tree.select(node.value) // Keep selection separate in case logic diverges later

    try {
      const { nodeType, libraryId } = getNodeIdentifier(node.value)

      if (nodeType === 'module') {
        // Reuse the dedicated module click handler
        handleModuleNodeClick()
      } else if (nodeType === 'library' && libraryId) {
        navigateToLibrary(navigate, libraryId)
      }
    } catch (error) {
      console.error('Error handling tree node text click:', error)
    }
  }

  // Handler for clicking the Library expand/collapse icon
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    originalOnClick?.(e)
  }

  return (
    // onContextMenu prop removed from Group
    <Group gap={0} {...restElementProps} w="100%">
      <Tooltip label={node.label} openDelay={800} position="bottom" withinPortal>
        <Group gap="xs" px="xs" py={4} w="100%" wrap="nowrap">
          {isModuleNode(node) ? (
            // Module icon - navigates on click
            <Box onClick={handleModuleNodeClick} style={{ cursor: 'pointer', lineHeight: 0 }}>
              <IconFile size={16} style={{ flexShrink: 0 }} />
            </Box>
          ) : (
            // Library icon - toggles expand/collapse
            <Box onClick={handleIconClick} style={{ cursor: 'pointer', lineHeight: 0 }}>
              {expanded ? (
                <IconFolderOpen size={16} style={{ flexShrink: 0 }} />
              ) : (
                <IconFolder size={16} style={{ flexShrink: 0 }} />
              )}
            </Box>
          )}
          {/* Text label - navigates on click */}
          <Text
            size="sm"
            truncate="end"
            c={isLibraryNode(node) ? 'dimmed' : undefined}
            style={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={handleTextClick}
          >
            {node.label}
          </Text>
        </Group>
      </Tooltip>
    </Group>
  )
}
