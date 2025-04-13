import { ActionIcon, Button, Card, Group, Loader, Modal, SimpleGrid, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { type DueModuleWithSources } from '@noggin/api/practiceFeedApi'
import { QuizGenerationWizard } from '@noggin/components/QuizGenerationWizard'
import { useDeleteModule } from '@noggin/hooks/useModuleHooks'
import { useGetDueModules } from '@noggin/hooks/usePracticeFeedHooks'
import {
  latestCreatedQuizByModuleQueryOptions,
  latestSubmittedQuizByModuleQueryOptions,
} from '@noggin/hooks/useQuizHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconHistory, IconPlayerPlay, IconPlus, IconTrash } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

type DbQuiz = Tables<'quizzes'>

// Define state for the wizard modal
type WizardState = {
  isOpen: boolean
  moduleId: string | null
  sources: string[]
}

interface ModuleCardProps {
  mod: DueModuleWithSources
  onModuleClick: (moduleId: string) => void
  onStartQuiz: (moduleId: string, quizId: string) => void
  onOpenCreateQuizWizard: (moduleId: string, sources: string[]) => void
  onDelete: (moduleId: string) => void
  isDeleting: boolean
}

function ModuleCard({
  mod,
  onModuleClick,
  onStartQuiz,
  onOpenCreateQuizWizard,
  onDelete,
  isDeleting,
}: ModuleCardProps) {
  const queryClient = useQueryClient()

  const { data: latestCreatedQuiz, isLoading: isLoadingQuizCheck } = useQuery(
    latestCreatedQuizByModuleQueryOptions(mod.id)
  )

  const handleQuizAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoadingQuizCheck) return

    if (!latestCreatedQuiz) {
      // Extract source paths before calling the handler
      const sourcePaths = mod.module_sources.map((s) => s.storage_object_path)
      if (sourcePaths.length === 0) {
        notifications.show({
          title: 'Cannot Create Quiz',
          message: 'This module has no source content to generate a quiz from.',
          color: 'orange',
        })
        return
      }
      onOpenCreateQuizWizard(mod.id, sourcePaths)
      return
    }

    try {
      const latestSubmittedQuiz = await queryClient.fetchQuery(
        latestSubmittedQuizByModuleQueryOptions(mod.id)
      )

      // Use submitted or fallback to created
      onStartQuiz(mod.id, latestSubmittedQuiz?.id ?? latestCreatedQuiz.id)
    } catch (err) {
      notifications.show({
        title: 'Error Starting Quiz',
        message: err instanceof Error ? err.message : 'Could not determine which quiz to start.',
        color: 'red',
      })
    }
  }

  const buttonText = isLoadingQuizCheck
    ? 'Loading...'
    : latestCreatedQuiz
      ? 'Start Quiz'
      : 'Create Quiz'
  const buttonIcon = latestCreatedQuiz ? <IconPlayerPlay size={14} /> : <IconPlus size={14} />

  return (
    <Card
      key={mod.id}
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        width: '280px',
        height: '180px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onModuleClick(mod.id)}
    >
      <div style={{ flexGrow: 1 }}>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="sm" truncate>
            {mod.title}
          </Text>
        </Group>
        <Group gap={8} mb="md">
          <Text size="xs" c="dimmed">
            Created {new Date(mod.created_at).toLocaleDateString()}
          </Text>
        </Group>
      </div>

      <Group justify="space-between" mt="auto">
        <Button
          variant="light"
          size="xs"
          leftSection={buttonIcon}
          onClick={handleQuizAction}
          title={latestCreatedQuiz ? 'Start the most recent quiz' : 'Create a quiz for this module'}
          disabled={isLoadingQuizCheck}
        >
          {buttonText}
        </Button>
        <Group gap={8}>
          <ActionIcon variant="subtle" size="md" title="Generate New Quiz (AI)">
            <IconPlus size={18} />
          </ActionIcon>
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
              onDelete(mod.id)
            }}
            disabled={isDeleting}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  )
}

export function PracticeFeed() {
  const navigate = useNavigate()
  const { data: modules, isLoading, isError, error } = useGetDueModules()
  const deleteModuleMutation = useDeleteModule()
  const [wizardState, setWizardState] = useState<WizardState>({
    isOpen: false,
    moduleId: null,
    sources: [],
  })

  const handleDeleteMod = async (moduleId: string) => {
    if (!moduleId) return
    const confirmed = window.confirm('Are you sure you want to delete this module?')
    if (!confirmed) return

    deleteModuleMutation.mutate(
      { moduleId },
      {
        onSuccess: () =>
          notifications.show({ title: 'Success', message: 'Module deleted.', color: 'green' }),
        onError: (err) =>
          notifications.show({
            title: 'Error',
            message: `Delete failed: ${err.message}`,
            color: 'red',
          }),
      }
    )
  }

  const handleModuleClick = (moduleId: string) => {
    if (!moduleId) return
    navigate({ to: '/module/view/$moduleId', params: { moduleId } })
  }

  const handleNavigateToQuizSession = (moduleId: string, quizId: string) => {
    if (!moduleId || !quizId) return
    navigate({ to: '/quiz/session/$moduleId/$quizId', params: { moduleId, quizId } })
  }

  // Updated handler to open the modal
  const handleOpenCreateQuizWizard = (moduleId: string, sources: string[]) => {
    setWizardState({ isOpen: true, moduleId, sources })
  }

  // Handler for when the wizard completes
  const handleWizardComplete = (newQuiz: DbQuiz) => {
    setWizardState({ isOpen: false, moduleId: null, sources: [] })
    notifications.show({
      title: 'Quiz Created',
      message: `Successfully created quiz: ${newQuiz.title}`,
      color: 'green',
    })
    // Navigate to the new quiz or session
    // navigate({ to: '/quiz/view/$moduleId/$quizId', params: { moduleId: newQuiz.module_id, quizId: newQuiz.id } });
  }

  const handleWizardCancel = () => {
    setWizardState({ isOpen: false, moduleId: null, sources: [] })
  }

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    )
  }
  if (isError) {
    return (
      <Text color="red" p="md">
        Error loading practice modules: {error?.message || 'Unknown error'}
      </Text>
    )
  }
  if (!modules || modules.length === 0) {
    return (
      <Text c="dimmed" p="md">
        No modules due for practice right now.
      </Text>
    )
  }

  return (
    <>
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        p="md"
        style={{ flex: 1, overflow: 'auto' }}
      >
        {modules.map((mod: DueModuleWithSources) => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            onModuleClick={handleModuleClick}
            onStartQuiz={handleNavigateToQuizSession}
            onOpenCreateQuizWizard={handleOpenCreateQuizWizard} // Pass the modal opener
            onDelete={handleDeleteMod}
            isDeleting={
              deleteModuleMutation.isPending && deleteModuleMutation.variables?.moduleId === mod.id
            }
          />
        ))}
      </SimpleGrid>

      {/* Quiz Generation Wizard Modal */}
      <Modal
        opened={wizardState.isOpen}
        onClose={handleWizardCancel}
        title="Generate New Quiz"
        size="xl" // Adjust size as needed
      >
        {wizardState.moduleId && (
          <QuizGenerationWizard
            moduleId={wizardState.moduleId}
            sources={wizardState.sources} // Pass source paths
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}
      </Modal>
    </>
  )
}
