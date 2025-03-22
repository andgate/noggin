import { Button, Grid, Group, Menu, Modal, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { Quiz } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { ModuleDetails } from '@renderer/components/ModuleDetails'
import { QuizGenerationWizard } from '@renderer/components/QuizGenerationWizard'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import { IconEdit, IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { QuizCard } from './components/QuizCard'

type ModulePageProps = {
    module: Mod
}

export function ModulePage({ module }: ModulePageProps) {
    const { settingsOpen, toggleSettings } = useUiStore()
    const [isGenerating, setIsGenerating] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const { deleteModuleQuiz } = useModule()

    // Define which header actions to enable
    const headerActions: HeaderAction[] = ['explorer', 'settings']

    const handleQuizGenerated = (_quiz: Quiz) => {
        setIsGenerating(false)
    }

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            await deleteModuleQuiz(module.metadata.libraryId, module.metadata.id, quizId)
            notifications.show({
                title: 'Quiz deleted',
                message: 'The quiz has been successfully deleted.',
                color: 'green',
            })
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete quiz.',
                color: 'red',
            })
        }
    }

    const toggleEditMode = () => {
        setEditMode((prev) => !prev)
    }

    const openDetailsModal = () => {
        setDetailsModalOpen(true)
    }

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
            <AppHeader
                title="Module"
                actions={headerActions}
                backLink={{
                    to: '/',
                    label: 'Back to Dashboard',
                }}
            />

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
                                        >
                                            Create Quiz
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconEdit size={14} />}
                                            onClick={toggleEditMode}
                                        >
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
                            <Title order={2}>
                                {editMode
                                    ? `${module.metadata.title} (editing)`
                                    : module.metadata.title}
                            </Title>
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
                        <Text>{module.metadata.overview}</Text>
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
                        <Grid style={{ width: '100%', margin: 0 }}>
                            {module.quizzes?.map((quiz) => (
                                <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={quiz.id}>
                                    <QuizCard
                                        libraryId={module.metadata.libraryId}
                                        moduleId={module.metadata.id}
                                        quizId={quiz.id}
                                        title={quiz.title}
                                        questionCount={quiz.questions.length}
                                        createdAt={quiz.createdAt}
                                        onDelete={() => handleDeleteQuiz(quiz.id)}
                                        editMode={editMode}
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>
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
                    sources={module.sources}
                    libraryId={module.metadata.libraryId}
                    moduleSlug={module.metadata.id}
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
                <ModuleDetails module={module} />
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
