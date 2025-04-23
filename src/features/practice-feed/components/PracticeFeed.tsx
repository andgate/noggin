import { useDeleteModule } from '@/core/hooks/useModuleHooks'
import { useGetDueModules } from '@/core/hooks/usePracticeFeedHooks'
import { Quiz } from '@/core/types/quiz.types'
import { QuizGenerationWizard } from '@/features/quiz-generation/QuizGenerationWizard'
import { Group, Loader, Modal, SimpleGrid, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import ModuleCard from './ModuleCard'

type WizardState = {
  isOpen: boolean
  moduleId: string | null
  sources: string[]
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

  const handleNavigateToQuizSession = (quizId: string) => {
    if (!quizId) return
    navigate({ to: '/quiz/session/$quizId', params: { quizId } })
  }

  // Updated handler to open the modal
  const handleOpenCreateQuizWizard = (moduleId: string, sources: string[]) => {
    setWizardState({ isOpen: true, moduleId, sources })
  }

  // Handler for when the wizard completes
  const handleWizardComplete = (newQuiz: Quiz) => {
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
