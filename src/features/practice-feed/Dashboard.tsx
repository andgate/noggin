import { AppHeader, HeaderAction } from '@/components/layouts/AppHeader'
import { Stack } from '@mantine/core'
import React from 'react'
import { PracticeFeed } from './components/PracticeFeed'

export const DashboardPage: React.FC = () => {
  // Define which header actions to enable
  const headerActions: HeaderAction[] = ['explorer', 'settings']

  return (
    <Stack gap={0} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Practice" actions={headerActions} />

      <PracticeFeed />
    </Stack>
  )
}
