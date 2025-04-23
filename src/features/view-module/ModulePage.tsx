import { AppHeader, HeaderAction } from '@/components/layouts/AppHeader'
import { useDeleteQuiz, useGetQuizzesByModule } from '@/core/hooks/useQuizHooks'
import { useUiStore } from '@/core/stores/ui-store'
import { Module } from '@/core/types/module.types'
import { Quiz } from '@/core/types/quiz.types'
import { ModuleDetails } from '@/features/module-details/ModuleDetails'
import { QuizGenerationWizard } from '@/features/quiz-generation/QuizGenerationWizard'
import { UserSettingsPanel } from '@/features/user-settings-panel/UserSettingsPanel'
import { Button, Grid, Group, Loader, Menu, Modal, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { QuizCard } from './components/QuizCard'

type ModulePageProps = {
  mod: Module
}

export function ModulePage({ mod }: ModulePageProps) {
  const { settingsOpen, toggleSettings } = useUiStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
    isError: isErrorQuizzes,
    error: errorQuizzes,
  } = useGetQuizzesByModule(mod.id)

  const deleteQuizMutation = useDeleteQuiz()

  const headerActions: HeaderAction[] = ['explorer', 'settings']

  const handleQuizGenerated = (newQuiz: Quiz) => {
    // Added type for newQuiz
    setIsGenerating(false)
    notifications.show({
      title: 'Quiz Saved',
      message: `The generated quiz "${newQuiz.title}" has been saved.`, // Use quiz title
      color: 'green',
    })
  }

  const handleDeleteQuiz = async (quizId: string) => {
    deleteQuizMutation.mutate(
      { quizId, moduleId: mod.id },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Quiz deleted',
            message: 'The quiz has been successfully deleted.',
            color: 'green',
          })
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message: `Failed to delete quiz: ${error.message}`,
            color: 'red',
          })
        },
      }
    )
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
  }

  const openDetailsModal = () => {
    setDetailsModalOpen(true)
  }

  // Prepare sources for QuizGenerationWizard
  const sourcePaths = sources.map((s) => s.storage_object_path)

  return (
    <div
      id="module-page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader title={mod.title} actions={headerActions} />

      <div
        id="module-content-area"
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Group justify="space-between">
            <Group gap="xs">
              {!editMode && (
                <Menu shadow="md" width={150} position="bottom-start">
                  <Menu.Target>
                    <IconPlus
                      size={24}
                      color="var(--mantine-color-purple-6)"
                      style={{ cursor: 'pointer' }}
                    />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPlus size={14} />}
                      onClick={() => setIsGenerating(true)}
                      // Disable if no sources exist
                      disabled={sourcePaths.length === 0}
                      title={
                        sourcePaths.length === 0
                          ? 'Module needs source content first'
                          : 'Create Quiz'
                      }
                    >
                      Create Quiz
                    </Menu.Item>
                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={toggleEditMode}>
                      Edit Quizzes
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconInfoCircle size={14} />}
                      onClick={openDetailsModal}
                    >
                      View Details
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
              <Title order={2}>{editMode ? `${mod.title} (editing)` : mod.title}</Title>
            </Group>
            {editMode && (
              <Button variant="light" size="sm" onClick={toggleEditMode}>
                Done
              </Button>
            )}
          </Group>

          <div
            id="module-overview"
            style={{
              marginTop: '8px',
              marginBottom: '16px',
            }}
          >
            <Text>{mod.overview}</Text>
          </div>

          <div
            id="quizzes-list-container"
            style={{
              overflow: 'auto',
              flex: 1,
              maxWidth: '100%',
              overflowX: 'hidden',
            }}
          >
            {isLoadingQuizzes && (
              <Group justify="center" p="md">
                <Loader />
              </Group>
            )}
            {isErrorQuizzes && (
              <Text color="red" p="md">
                Error loading quizzes: {errorQuizzes?.message || 'Unknown error'}
              </Text>
            )}
            {!isLoadingQuizzes && !isErrorQuizzes && (
              <Grid style={{ width: '100%', margin: 0 }}>
                {quizzes?.map((quiz) => (
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={quiz.id}>
                    <QuizCard
                      moduleId={mod.id}
                      quizId={quiz.id}
                      title={quiz.title}
                      questionCount={0}
                      createdAt={quiz.created_at}
                      onDelete={() => handleDeleteQuiz(quiz.id)}
                      editMode={editMode}
                    />
                  </Grid.Col>
                ))}
                {quizzes?.length === 0 && <Text p="md">No quizzes created yet.</Text>}
              </Grid>
            )}
          </div>
        </div>
      </div>

      {/* Quiz generation modal */}
      <Modal
        id="quiz-generation-modal"
        opened={isGenerating}
        onClose={() => setIsGenerating(false)}
        title="Generate Quiz"
      >
        <QuizGenerationWizard
          sources={sourcePaths}
          moduleId={mod.id}
          onComplete={handleQuizGenerated}
          onCancel={() => setIsGenerating(false)}
        />
      </Modal>

      {/* Module details modal */}
      <Modal
        id="module-details-modal"
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Module Details"
        size="md"
      >
        <ModuleDetails module={mod} stats={stats} sources={sources} />
      </Modal>

      {/* Settings panel */}
      <Modal
        opened={settingsOpen}
        onClose={toggleSettings}
        title="Settings"
        size="lg"
        closeOnClickOutside={false}
      >
        <UserSettingsPanel />
      </Modal>
    </div>
  )
}
