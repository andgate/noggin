import { ActionIcon, Button, Card, Group, Loader, SimpleGrid, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { getQuizzesByModule } from '@noggin/api/quizApi'
import { quizKeys } from '@noggin/hooks/query-keys'
import { useDeleteModule } from '@noggin/hooks/useModuleHooks'
import { useGetDueModules } from '@noggin/hooks/usePracticeFeedHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconHistory, IconPlayerPlay, IconPlus, IconTrash } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query' // Import queryClient hook
import { useNavigate } from '@tanstack/react-router'

// Define DB Module type
type DbModule = Tables<'modules'>
type DbQuiz = Tables<'quizzes'> // Keep Quiz type

export function PracticeFeed() {
  const navigate = useNavigate()
  const queryClient = useQueryClient() // Get query client instance
  // Use the new hook to fetch due modules
  const { data: modules, isLoading, isError, error } = useGetDueModules()
  // Use the new hook for deleting modules
  const deleteModuleMutation = useDeleteModule()
  // Removed useGetQuizzesByModule hook usage here

  const handleDeleteMod = async (moduleId: string, libraryId: string | undefined) => {
    // Add libraryId param
    if (!moduleId || !libraryId) {
      notifications.show({ title: 'Error', message: 'Module or Library ID missing.', color: 'red' })
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this module?')
    if (!confirmed) return

    // Pass both moduleId and libraryId
    deleteModuleMutation.mutate(
      { moduleId, libraryId },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Module deleted successfully',
            color: 'green',
          })
          // Invalidation happens within the hook
        },
        onError: (err) => {
          notifications.show({
            title: 'Error',
            message: `Failed to delete module: ${err.message}`,
            color: 'red',
          })
        },
      }
    )
  }

  const handleModuleClick = (moduleId: string, libraryId: string) => {
    if (!libraryId || !moduleId) {
      notifications.show({
        title: 'Error',
        message: 'Library ID and Module ID are required for navigation',
        color: 'red',
      })
      return
    }

    navigate({
      to: '/module/view/$libraryId/$moduleId',
      params: { libraryId, moduleId },
    })
  }

  const handleStartQuiz = async (moduleId: string, libraryId: string) => {
    if (!libraryId || !moduleId) {
      notifications.show({
        title: 'Error',
        message: 'Library ID and Module ID are required for navigation',
        color: 'red',
      })
      return
    }

    try {
      // Fetch quizzes for the specific module on demand using queryClient
      const quizzes = await queryClient.fetchQuery<DbQuiz[], Error>({
        queryKey: quizKeys.list(moduleId), // Use the query key from quizKeys
        queryFn: () => getQuizzesByModule(moduleId), // Use the direct API function
        staleTime: 1000 * 60, // Optional: Cache for 1 minute
      })

      if (!quizzes || quizzes.length === 0) {
        throw new Error('No quizzes available for this module.')
      }

      // Sort by creation date desc to find the latest
      const latestQuiz = [...quizzes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      navigate({
        to: '/quiz/session/$libraryId/$moduleId/$quizId',
        params: { libraryId, moduleId, quizId: latestQuiz.id },
      })
    } catch (err: unknown) {
      // Use unknown for error type
      let errorMessage = 'Could not find or fetch a quiz for this module.'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      notifications.show({
        title: 'Error starting quiz',
        message: errorMessage,
        color: 'red',
      })
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <Text color="red" p="md">
        Error loading practice modules: {error?.message || 'Unknown error'}
      </Text>
    )
  }

  // Handle empty state
  if (!modules || modules.length === 0) {
    return (
      <Text c="dimmed" p="md">
        No modules due for practice right now.
      </Text>
    )
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
      p="md"
      style={{ flex: 1, overflow: 'auto' }}
    >
      {/* Map over data from the hook */}
      {modules.map((mod: DbModule) => (
        <Card
          key={mod.id} // Use new ID
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{
            width: '280px',
            height: '180px',
            cursor: 'pointer',
            display: 'flex', // Use flexbox for layout
            flexDirection: 'column', // Stack elements vertically
          }}
          onClick={() => handleModuleClick(mod.id, mod.library_id)} // Use new IDs
        >
          <div style={{ flexGrow: 1 }}>
            {' '}
            {/* Allow title/date to take available space */}
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm" truncate>
                {mod.title} {/* Use new title */}
              </Text>
            </Group>
            <Group gap={8} mb="md">
              <Text size="xs" c="dimmed">
                {/* Use new created_at */}
                Created {new Date(mod.created_at).toLocaleDateString()}
              </Text>
            </Group>
          </div>

          {/* Keep actions at the bottom */}
          <Group justify="space-between" mt="auto">
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlayerPlay size={14} />}
              onClick={(e) => {
                e.stopPropagation()
                handleStartQuiz(mod.id, mod.library_id) // Use new IDs
              }}
              title="Start the most recent quiz for this module"
            >
              Start Quiz
            </Button>
            <Group gap={8}>
              {/* TODO: Implement Generate Quiz action */}
              <ActionIcon variant="subtle" size="md" title="Generate New Quiz">
                <IconPlus size={18} />
              </ActionIcon>
              {/* TODO: Implement Review Submissions action/navigation */}
              <ActionIcon variant="subtle" size="md" title="Review Submissions">
                <IconHistory size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="md"
                title="Delete Module"
                onClick={(e) => {
                  e.stopPropagation()
                  // Pass library_id to delete handler
                  handleDeleteMod(mod.id, mod.library_id)
                }}
                disabled={deleteModuleMutation.isPending} // Disable while deleting
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  )
}
