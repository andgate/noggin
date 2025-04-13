import { Alert, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { AppHeader, HeaderAction } from '@noggin/components/layout/AppHeader'
import { useAllModules } from '@noggin/hooks/useModuleHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

type DbModule = Tables<'modules'>

export function LibraryPage() {
  const navigate = useNavigate()
  // Define which header actions to enable (might change based on context)
  const headerActions: HeaderAction[] = ['explorer', 'settings']

  // Fetch *all* modules using the refactored hook
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
    error: modulesError,
  } = useAllModules()

  const handleModuleClick = (moduleId: string) => {
    navigate({
      to: '/module/view/$moduleId',
      params: { moduleId },
    })
  }

  return (
    <>
      <AppHeader title="Browse Library" actions={headerActions} />

      <Stack p="md">
        {/* Section title */}
        <Title order={2} mt="md">
          All Modules
        </Title>

        {isModulesLoading && <Loader />}

        {isModulesError && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error loading modules" color="red">
            {modulesError?.message || 'An unknown error occurred.'}
          </Alert>
        )}

        {!isModulesLoading && !isModulesError && modules.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
            {modules.map((module: DbModule) => (
              <Card
                key={module.id}
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => handleModuleClick(module.id)}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={500} size="sm" truncate>
                    {module.title}
                  </Text>
                </Group>
                {/* Optionally display module overview or other details */}
                <Text size="xs" c="dimmed" lineClamp={2}>
                  {module.overview}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          !isModulesLoading && !isModulesError && <Text c="dimmed">No modules found.</Text>
        )}
      </Stack>
    </>
  )
}
