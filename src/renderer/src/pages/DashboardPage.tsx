import { ActionIcon, Group, Modal, Stack, Title, Tooltip } from '@mantine/core'
import { useUiStore } from '@renderer/stores/ui-store'
import { IconLayoutSidebar, IconLayoutSidebarFilled, IconSettings } from '@tabler/icons-react'
import React, { useState } from 'react'
import { PracticeFeed } from '../components/PracticeFeed'
import { UserSettingsPanel } from '../components/UserSettingsPanel'

const DashboardPage: React.FC = () => {
    const { explorerCollapsed, toggleExplorer } = useUiStore()
    const [settingsOpen, setSettingsOpen] = useState(false)

    return (
        <Stack gap={0} h="100vh">
            <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
                <Title order={4}>Practice Feed</Title>
                <Group gap="xs">
                    <Tooltip
                        label={
                            explorerCollapsed
                                ? 'Expand module explorer'
                                : 'Collapse module explorer'
                        }
                    >
                        <ActionIcon variant="subtle" onClick={toggleExplorer}>
                            {explorerCollapsed ? (
                                <IconLayoutSidebar size={24} />
                            ) : (
                                <IconLayoutSidebarFilled size={24} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Settings">
                        <ActionIcon variant="subtle" onClick={() => setSettingsOpen(true)}>
                            <IconSettings size={24} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <PracticeFeed />

            <Modal
                opened={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                title="Settings"
                size="lg"
                closeOnClickOutside={false}
            >
                <UserSettingsPanel />
            </Modal>
        </Stack>
    )
}

export default DashboardPage
