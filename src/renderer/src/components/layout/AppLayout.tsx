import { AppShell, Box, Divider, Modal } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import { useRouterState } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { LeftSidepane } from './LeftSidepane'

export function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
    const { explorerCollapsed, settingsOpen, toggleSettings } = useUiStore()
    const router = useRouterState()
    const currentPath = router.location.pathname

    // Check if we're on a quiz session page
    const isQuizSession = currentPath.includes('/quiz/session/')

    return (
        <AppShell
            data-testid="app-shell"
            navbar={{
                width: { base: 280 },
                breakpoint: 'sm',
                collapsed: { desktop: explorerCollapsed || isQuizSession, mobile: true },
            }}
            padding={0}
        >
            {/* Only render the Navbar when not in a quiz session */}
            {!isQuizSession && (
                <AppShell.Navbar p={0}>
                    <LeftSidepane />
                </AppShell.Navbar>
            )}

            <AppShell.Main>
                {!isQuizSession && <Divider orientation="vertical" />}
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
