import { Button, Grid, Group, Modal, Stack, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { Quiz } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { QuizGenerationWizard } from '@renderer/components/QuizGenerationWizard'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ModuleInfoPanel } from './components/ModuleInfoPanel'
import { QuizCard } from './components/QuizCard'

type ModulePageProps = {
    module: Mod
}

export function ModulePage({ module }: ModulePageProps) {
    const { settingsOpen, toggleSettings } = useUiStore()
    const [isGenerating, setIsGenerating] = useState(false)
    const navigate = useNavigate()
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
        <>
            <AppHeader title={module.metadata.title} actions={headerActions} />

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack>
                        <Group justify="space-between">
                            <Title order={2}>Quizzes</Title>
                            <Button onClick={() => setIsGenerating(true)}>Generate Quiz</Button>
                        </Group>

                        <Grid>
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
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <ModuleInfoPanel module={module} />
                </Grid.Col>
            </Grid>

            {/* Quiz generation modal */}
            <Modal
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
        </>
    )
}
