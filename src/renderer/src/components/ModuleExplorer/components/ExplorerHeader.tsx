import { ActionIcon, Group, Text, Tooltip } from '@mantine/core'
import { IconFilePlus, IconFolderPlus } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

interface ExplorerHeaderProps {
    onCreateLibrary: () => void
}

export function ExplorerHeader({ onCreateLibrary }: ExplorerHeaderProps) {
    const navigate = useNavigate()

    const handleCreateModule = () => {
        navigate({ to: '/module/create' })
    }

    return (
        <Group px="xs" py={8} justify="space-between" bg="var(--mantine-color-dark-6)">
            <Text size="xs" fw={500}>
                MODULE EXPLORER
            </Text>
            <Group gap={4}>
                <Tooltip label="Create new library">
                    <ActionIcon variant="subtle" size="sm" onClick={onCreateLibrary}>
                        <IconFolderPlus size={16} />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Create new module">
                    <ActionIcon variant="subtle" size="sm" onClick={handleCreateModule}>
                        <IconFilePlus size={16} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        </Group>
    )
}
