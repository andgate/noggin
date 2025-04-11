import { Alert, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { AppHeader, HeaderAction } from '@noggin/components/layout/AppHeader'
import { useModulesByLibrary } from '@noggin/hooks/useModuleHooks' // Import the module hook
import type { Tables } from '@noggin/types/database.types' // Import Tables
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

// Define DbLibrary and DbModule using Tables utility type
type DbLibrary = Tables<'libraries'>
type DbModule = Tables<'modules'> // Assuming the hook returns this type

interface LibraryPageProps {
  library: DbLibrary // Use DbLibrary type
}

export function LibraryPage({ library }: LibraryPageProps) {
  // Remove modules parameter
  const navigate = useNavigate()
  // Define which header actions to enable
  const headerActions: HeaderAction[] = ['explorer', 'settings']

  // Fetch modules using the hook
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
    error: modulesError,
  } = useModulesByLibrary(library.id)

  const handleModuleClick = (moduleId: string, libraryId: string) => {
    navigate({
      to: '/module/view/$libraryId/$moduleId',
      params: { libraryId, moduleId },
    })
  }

  return (
    <>
      <AppHeader title={library.name} actions={headerActions} />

      <Stack p="md">
        <Title order={2}>{library.name}</Title>
        <Text c="dimmed">{library.description}</Text>

        {/* Module Section */}
        <Title order={3} mt="xl">
          Modules
        </Title>

        {isModulesLoading && <Loader />}

        {isModulesError && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error loading modules" color="red">
            {modulesError?.message || 'An unknown error occurred.'}
          </Alert>
        )}

        {!isModulesLoading && !isModulesError && modules.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
            {modules.map(
              (
                module: DbModule // Use modules from hook
              ) => (
                <Card
                  key={module.id}
                  shadow="sm"
                  padding="md"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleModuleClick(module.id, library.id)}
                >
                  {' '}
                  {/* Ensure module.libraryId exists on DbModule */}
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm" truncate>
                      {module.title}
                    </Text>{' '}
                    {/* Assuming name property */}
                  </Group>
                </Card>
              )
            )}
          </SimpleGrid>
        ) : (
          !isModulesLoading && !isModulesError && <Text c="dimmed">No modules in this library</Text> // Show only if not loading/error
        )}
      </Stack>
    </>
  )
}
