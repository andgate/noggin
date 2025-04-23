import { ActionIcon, Group, Loader, Menu, Stack, Title, Tree } from '@mantine/core' // Added Loader import
import { IconDots, IconFilePlus } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { TreeNode } from './components/TreeNode'
import { useModuleTree } from './hooks/useModuleTree'
import { useModuleTreeData } from './hooks/useModuleTreeData'

export function ModuleExplorer() {
  const navigate = useNavigate()

  const { treeData, isLoading } = useModuleTreeData()

  const tree = useModuleTree(treeData)

  const handleCreateModule = () => {
    navigate({ to: '/module/create' })
  }

  return (
    <Stack style={{ height: '100%' }} gap="xs">
      <Group justify="space-between" px="md" py={5} bg="var(--mantine-color-dark-6)">
        <Title
          order={6}
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: '0.9rem',
            letterSpacing: '0.03em',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          MODULE EXPLORER
        </Title>
        <Menu shadow="md" width={200} position="bottom-start">
          <Menu.Target>
            <ActionIcon size="xs" variant="subtle" color="gray">
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconFilePlus size={16} />} onClick={handleCreateModule}>
              Create Module
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Conditionally render Loader or Tree based on isLoading state */}
      {isLoading ? (
        <Group justify="center" align="center" style={{ flexGrow: 1 }}>
          <Loader size="sm" />
        </Group>
      ) : (
        <Tree data={treeData} renderNode={TreeNode} tree={tree} style={{ paddingLeft: 10 }} />
      )}
    </Stack>
  )
}
