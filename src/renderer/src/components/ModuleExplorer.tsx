// src/renderer/src/components/ModuleExplorer.tsx
import { ActionIcon, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { useUiStore } from '@renderer/stores/ui-store'
import { IconClipboard, IconFolder, IconPlus, IconQuestionMark } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

// Module item component
function ModuleItem({
    name,
    isSelected,
    onSelect,
}: {
    path: string
    name: string
    isSelected: boolean
    onSelect: () => void
}) {
    return (
        <Stack gap={0}>
            <UnstyledButton
                onClick={onSelect}
                p="xs"
                style={(theme) => ({
                    backgroundColor: isSelected ? theme.colors.dark[5] : 'transparent',
                    '&:hover': {
                        backgroundColor: theme.colors.dark[6],
                    },
                })}
            >
                <Group gap="xs" wrap="nowrap">
                    <IconFolder size={16} />
                    <Text size="sm" truncate>
                        {name}
                    </Text>
                </Group>
            </UnstyledButton>

            {isSelected && (
                <Stack gap={0} pl={32}>
                    <UnstyledButton
                        p="xs"
                        style={(theme) => ({
                            '&:hover': {
                                backgroundColor: theme.colors.dark[6],
                            },
                        })}
                    >
                        <Group gap="xs">
                            <IconQuestionMark size={16} />
                            <Text size="sm">Quizzes</Text>
                        </Group>
                    </UnstyledButton>
                    <UnstyledButton
                        p="xs"
                        style={(theme) => ({
                            '&:hover': {
                                backgroundColor: theme.colors.dark[6],
                            },
                        })}
                    >
                        <Group gap="xs">
                            <IconClipboard size={16} />
                            <Text size="sm">Submissions</Text>
                        </Group>
                    </UnstyledButton>
                </Stack>
            )}
        </Stack>
    )
}

export function ModuleExplorer() {
    const navigate = useNavigate()
    const collapsed = useUiStore((s) => s.explorerCollapsed)
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

    // Fetch module paths
    const { data: modulePaths = [] } = useQuery({
        queryKey: ['modulePaths'],
        queryFn: () => window.api.modules.getRegisteredPaths(),
    })

    // If collapsed, don't render anything
    if (collapsed) {
        return null
    }

    return (
        <Stack gap={0} h="100%">
            {/* Header */}
            <Group px="xs" py={8} justify="space-between" bg="var(--mantine-color-dark-6)">
                <Text size="xs" fw={500}>
                    MODULE EXPLORER
                </Text>
                <Group gap={4}>
                    <Tooltip label="Create new module">
                        <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => navigate({ to: '/module/create' })}
                        >
                            <IconPlus size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            {/* Module List */}
            <Stack gap={0} style={{ overflow: 'auto' }}>
                {modulePaths.map((path) => (
                    <ModuleItem
                        key={path}
                        path={path}
                        name={path.split('/').pop() || path}
                        isSelected={selectedModuleId === path}
                        onSelect={() =>
                            setSelectedModuleId(selectedModuleId === path ? null : path)
                        }
                    />
                ))}
            </Stack>
        </Stack>
    )
}
