import { AppShell, Box, Divider, Modal } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { ModuleExplorer } from '@renderer/components/ModuleExplorer'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import React, { type ReactNode } from 'react'

export function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
    const { explorerCollapsed, settingsOpen, toggleSettings } = useUiStore()

    return (
        <AppShell
            data-testid="app-shell"
            navbar={{
                width: { base: 280 },
                breakpoint: 'sm',
                collapsed: { desktop: explorerCollapsed, mobile: true },
            }}
            padding={0}
        >
            <AppShell.Navbar p={0}>
                <ModuleExplorer />
            </AppShell.Navbar>

            <AppShell.Main>
                <Divider orientation="vertical" />
                <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Let the page component control its own header */}
                    {children}
                </Box>
            </AppShell.Main>

            <Modal
                opened={settingsOpen}
                onClose={toggleSettings}
                title="Settings"
                size="lg"
                closeOnClickOutside={false}
            >
                <UserSettingsPanel />
            </Modal>
        </AppShell>
    )
}
