import { ActionIcon, Group, Menu, Stack, Title, Tree } from '@mantine/core'
import { CreateLibraryModal } from '@renderer/components/CreateLibraryModal'
import { IconDots, IconFilePlus, IconFolderPlus } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { TreeNode } from './components/TreeNode'
import { useModuleTree } from './hooks/useModuleTree'
import { useModuleTreeData } from './hooks/useModuleTreeData'

export function ModuleExplorer() {
    const [createLibraryOpen, setCreateLibraryOpen] = useState(false)
    const navigate = useNavigate()

    // Get tree data using our custom hook
    const { treeData, initialExpanded, refetchLibraries } = useModuleTreeData()

    // Get tree controller using our custom hook
    const tree = useModuleTree(treeData, initialExpanded)

    const handleCreateLibrary = () => {
        setCreateLibraryOpen(true)
    }

    const handleCreateModule = () => {
        navigate({ to: '/module/create' })
    }

    const handleLibraryCreated = () => {
        setCreateLibraryOpen(false)
        refetchLibraries()
    }

    return (
        <Stack style={{ height: '100%' }} gap="xs">
            <Group justify="space-between" px="md" py="xs" bg="var(--mantine-color-dark-6)">
                <Title
                    order={6}
                    style={{
                        fontFamily: 'var(--mantine-font-family-monospace)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.03em',
                        fontWeight: 600,
                    }}
                >
                    MODULE EXPLORER
                </Title>
                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon size="sm" variant="subtle" color="gray">
                            <IconDots size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconFolderPlus size={16} />}
                            onClick={handleCreateLibrary}
                        >
                            Create Library
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconFilePlus size={16} />}
                            onClick={handleCreateModule}
                        >
                            Create Module
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Tree data={treeData} renderNode={TreeNode} tree={tree} style={{ paddingLeft: 10 }} />

            <CreateLibraryModal
                opened={createLibraryOpen}
                onClose={() => setCreateLibraryOpen(false)}
                onCreated={handleLibraryCreated}
            />
        </Stack>
    )
}
