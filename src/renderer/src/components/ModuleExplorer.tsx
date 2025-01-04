// src/renderer/src/components/ModuleExplorer.tsx
import { ActionIcon, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { ModuleOverview } from '@noggin/types/module-types'
import { useUiStore } from '@renderer/stores/ui-store'
import { IconFolder, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

// Module item component
function ModuleItem({ overview }: { overview: ModuleOverview }) {
    const navigate = useNavigate()

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        window.api.moduleExplorer.showContextMenu(overview.slug)
    }

    return (
        <UnstyledButton
            onContextMenu={handleContextMenu}
            onClick={() =>
                navigate({ to: '/module/view/$moduleId', params: { moduleId: overview.slug } })
            }
            p="xs"
            style={(theme) => ({
                '&:hover': {
                    backgroundColor: theme.colors.dark[6],
                },
            })}
        >
            <Group gap="xs" wrap="nowrap">
                <IconFolder size={16} />
                <Text size="sm" truncate>
                    {overview.displayName}
                </Text>
            </Group>
        </UnstyledButton>
    )
}

export function ModuleExplorer() {
    const navigate = useNavigate()
    const collapsed = useUiStore((s) => s.explorerCollapsed)

    // Fetch module overviews instead of paths
    const { data: moduleOverviews = [] } = useQuery({
        queryKey: ['moduleOverviews'],
        queryFn: () => window.api.modules.getModuleOverviews(),
    })

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

            <Stack gap={0} style={{ overflow: 'auto' }}>
                {moduleOverviews.map((overview) => (
                    <ModuleItem key={overview.slug} overview={overview} />
                ))}
            </Stack>
        </Stack>
    )
}
