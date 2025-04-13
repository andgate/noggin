import { Box, Group, RenderTreeNodePayload, Text, Tooltip } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { getNodeIdentifier, isModuleNode } from '../types'

export function TreeNode({ node, elementProps, tree }: RenderTreeNodePayload) {
  const navigate = useNavigate()

  const { ...restElementProps } = elementProps

  // Click handler for module nodes (icon or text)
  const handleModuleNodeClick = () => {
    tree.select(node.value) // Select the node
    try {
      const { nodeId: moduleId } = getNodeIdentifier(node.value)
      // Call updated navigation function
      navigate({ to: '/module/view/$moduleId', params: { moduleId } })
    } catch (error) {
      console.error('Error handling module node click:', error)
    }
  }

  // Ensure the node is actually a module node before rendering
  if (!isModuleNode(node)) {
    console.warn('TreeNode rendered with unexpected node type:', node.value)
    return null
  }

  return (
    <Group gap={0} {...restElementProps} w="100%">
      <Tooltip label={node.label} openDelay={800} position="bottom" withinPortal>
        {/* Apply click handler to the whole row */}
        <Group
          gap="xs"
          px="xs"
          py={4}
          w="100%"
          wrap="nowrap"
          onClick={handleModuleNodeClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Always render Module icon */}
          <Box style={{ lineHeight: 0 }}>
            <IconFile size={16} style={{ flexShrink: 0 }} />
          </Box>
          {/* Text label */}
          <Text size="sm" truncate="end" style={{ flexGrow: 1, minWidth: 0 }}>
            {node.label}
          </Text>
        </Group>
      </Tooltip>
    </Group>
  )
}
