import { AppShell, Box, Divider, Modal, NavLink, Stack } from '@mantine/core'
import { useUiStore } from '@noggin/app/stores/ui-store'
import { ModuleExplorer } from '@noggin/components/ModuleExplorer'
import { UserSettingsPanel } from '@noggin/components/UserSettingsPanel'
import { IconHome, IconList } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { type ReactNode } from 'react'

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
          {/* Updated Navbar structure */}
          <Stack gap={0} style={{ height: '100%', width: '100%' }}>
            {/* Home Link */}
            <NavLink
              component={Link}
              to="/"
              label="Home"
              leftSection={<IconHome size="1rem" stroke={1.5} />}
              active={currentPath === '/'} // Basic active state check
            />
            {/* Browse Link - Assuming LibraryPage is now the browse route at '/library' */}
            {/* TODO: Confirm the actual route path for the refactored LibraryPage */}
            <NavLink
              component={Link}
              to="/library" // Link to the refactored LibraryPage route
              label="Browse"
              leftSection={<IconList size="1rem" stroke={1.5} />}
              active={currentPath.startsWith('/library')} // Basic active state check
            />
            <Divider />
            {/* Module Explorer takes remaining space */}
            <Box style={{ flexGrow: 1, overflow: 'auto' }}>
              <ModuleExplorer />
            </Box>
          </Stack>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        {!isQuizSession && <Divider orientation="vertical" />}
        <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{children}</Box>
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
