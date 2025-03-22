import { ActionIcon, Button, Group, Title, Tooltip } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import {
    IconArrowLeft,
    IconLayoutSidebar,
    IconLayoutSidebarFilled,
    IconSettings,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

// Define the possible actions that can be used in headers
export type HeaderAction = 'explorer' | 'settings'

interface BackLinkConfig {
    to: string
    params?: Record<string, string>
    label: string
    requireConfirmation?: boolean
    confirmationMessage?: string
}

interface AppHeaderProps {
    title: string
    backLink?: BackLinkConfig
    actions?: HeaderAction[]
}

export function AppHeader({ title, backLink, actions = ['explorer', 'settings'] }: AppHeaderProps) {
    const { explorerCollapsed, toggleExplorer, toggleSettings } = useUiStore()
    const navigate = useNavigate()

    const handleBackNavigation = () => {
        if (!backLink) return

        if (backLink.requireConfirmation) {
            const confirmed = window.confirm(
                backLink.confirmationMessage || 'Are you sure you want to go back?'
            )
            if (!confirmed) return
        }

        navigate({ to: backLink.to, params: backLink.params })
    }

    return (
        <Group h={40} px="md" py={5} justify="space-between" bg="var(--mantine-color-dark-6)">
            <Group gap="md">
                {backLink && (
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft size={14} />}
                        onClick={handleBackNavigation}
                        size="xs"
                    >
                        {backLink.label}
                    </Button>
                )}
                <Title order={4} style={{ lineHeight: 1 }}>
                    {title}
                </Title>
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
