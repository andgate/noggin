import { ActionIcon, Group, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useAuth } from '@noggin/app/auth/AuthProvider'
import { supabase } from '@noggin/app/common/supabase-client'
import { useUiStore } from '@noggin/app/stores/ui-store'
import { AuthError } from '@supabase/supabase-js'
import {
  IconLayoutSidebar,
  IconLayoutSidebarFilled,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react'
import { AppBreadcrumbs } from './AppBreadcrumbs'

// Define the possible actions that can be used in headers
export type HeaderAction = 'explorer' | 'settings' | 'logout'

interface AppHeaderProps {
  title: string // Fallback title when breadcrumbs aren't available
  actions?: HeaderAction[]
}

export function AppHeader({ title, actions = ['explorer', 'settings'] }: AppHeaderProps) {
  const { explorerCollapsed, toggleExplorer, toggleSettings } = useUiStore()
  const { user } = useAuth() // Get user from auth context

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        color: 'green',
      })
      // The AuthProvider's onAuthStateChange will handle the UI update/redirect
    } catch (error: unknown) {
      // Handle logout error
      if (error instanceof AuthError) {
        console.error('Logout error:', error.message)
        notifications.show({
          title: 'Logout Failed',
          message: error.message || 'An error occurred during logout.',
          color: 'red',
        })
      } else {
        throw error // Re-throw if it's not an AuthError
      }
    }
  }

  return (
    <Group h={40} px="md" py={5} justify="space-between" bg="var(--mantine-color-dark-6)">
      <Group gap="md">
        {/* AppBreadcrumbs handles showing/hiding itself when needed */}
        <AppBreadcrumbs fallbackTitle={title} />
      </Group>

      <Group gap="xs">
        {actions.includes('explorer') && (
          <Tooltip
            label={explorerCollapsed ? 'Expand module explorer' : 'Collapse module explorer'}
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

        {/* Conditionally render Logout button if user exists */}
        {user && (
          <Tooltip label="Logout">
            <ActionIcon variant="subtle" onClick={handleLogout} size="sm">
              <IconLogout size={20} />
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
