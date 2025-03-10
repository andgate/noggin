import { Button, Grid, Group, Modal, Stack, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { Quiz } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { QuizGenerationWizard } from '@renderer/components/QuizGenerationWizard'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import { useState } from 'react'
import { ModuleInfoPanel } from './components/ModuleInfoPanel'
import { QuizCard } from './components/QuizCard'

type ModulePageProps = {
    module: Mod
}

export function ModulePage({ module }: ModulePageProps) {
    const { settingsOpen, toggleSettings } = useUiStore()
    const [isGenerating, setIsGenerating] = useState(false)
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
                title={module.metadata.title}
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
                    display: 'flex',
                }}
            >
                <div
                    style={{
                        flex: '0 0 66.66%',
                        height: '100%',
                        paddingRight: '8px',
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
                            <Title order={2}>Quizzes</Title>
                            <Button id="generate-quiz-btn" onClick={() => setIsGenerating(true)}>
                                Generate Quiz
                            </Button>
                        </Group>

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
                                    <Grid.Col span={{ base: 12, sm: 6 }} key={quiz.id}>
                                        <QuizCard
                                            libraryId={module.metadata.libraryId}
                                            moduleId={module.metadata.id}
                                            quizId={quiz.id}
                                            title={quiz.title}
                                            questionCount={quiz.questions.length}
                                            createdAt={quiz.createdAt}
                                            onDelete={() => handleDeleteQuiz(quiz.id)}
                                        />
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </div>
                    </div>
                </div>

                <div
                    id="module-info-section"
                    style={{ flex: '0 0 33.33%', height: '100%', paddingLeft: '8px' }}
                >
                    <div style={{ height: '100%', overflow: 'auto' }}>
                        <ModuleInfoPanel module={module} />
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
