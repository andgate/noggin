import { ActionIcon, Group, Tooltip } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { IconLayoutSidebar, IconLayoutSidebarFilled, IconSettings } from '@tabler/icons-react'
import { AppBreadcrumbs } from './AppBreadcrumbs'

// Define the possible actions that can be used in headers
export type HeaderAction = 'explorer' | 'settings'

interface AppHeaderProps {
    title: string // Fallback title when breadcrumbs aren't available
    actions?: HeaderAction[]
}

export function AppHeader({ title, actions = ['explorer', 'settings'] }: AppHeaderProps) {
    const { explorerCollapsed, toggleExplorer, toggleSettings } = useUiStore()

    return (
        <Group h={40} px="md" py={5} justify="space-between" bg="var(--mantine-color-dark-6)">
            <Group gap="md">
                {/* AppBreadcrumbs handles showing/hiding itself when needed */}
                <AppBreadcrumbs fallbackTitle={title} />
            </Group>

            <Group gap="xs">
                {actions.includes('explorer') && (
                    <Tooltip
                        label={
                            explorerCollapsed
                                ? 'Expand module explorer'
                                : 'Collapse module explorer'
                        }
                    >
                        <ActionIcon variant="subtle" onClick={toggleExplorer} size="sm">
                            {explorerCollapsed ? (
                                <IconLayoutSidebar size={20} />
                            ) : (
                                <IconLayoutSidebarFilled size={20} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                )}

                {actions.includes('settings') && (
                    <Tooltip label="Settings">
                        <ActionIcon variant="subtle" onClick={toggleSettings} size="sm">
                            <IconSettings size={20} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Group>
    )
}
