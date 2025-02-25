import { ActionIcon, Button, Grid, Group, Modal, Stack, Title, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { Quiz } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { QuizGenerationWizard } from '@renderer/components/QuizGenerationWizard'
import { UserSettingsPanel } from '@renderer/components/UserSettingsPanel'
import {
    IconArrowLeft,
    IconLayoutSidebar,
    IconLayoutSidebarFilled,
    IconSettings,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ModuleInfoPanel } from './components/ModuleInfoPanel'
import { QuizCard } from './components/QuizCard'

type ModulePageProps = {
    module: Mod
}

export function ModulePage({ module }: ModulePageProps) {
    const { explorerCollapsed, toggleExplorer } = useUiStore()
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const navigate = useNavigate()
    const { deleteModuleQuiz } = useModule()

    const handleQuizGenerated = (_quiz: Quiz) => {
        setIsGenerating(false)
    }

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            await deleteModuleQuiz(module.metadata.libraryId, module.id, quizId)
            // Refresh the module data or update state to remove the quiz
            notifications.show({
                title: 'Quiz deleted',
                message: 'The quiz has been successfully deleted',
                color: 'green',
            })
        } catch (error) {
            console.error('Failed to delete quiz:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to delete quiz',
                color: 'red',
            })
        }
    }

    return (
        <Stack h="100vh">
            <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
                <Button variant="subtle" onClick={() => navigate({ to: '/' })}>
                    <Group gap="xs">
                        <IconArrowLeft size={16} />
                        Back to Dashboard
                    </Group>
                </Button>

                <Group gap="xs">
                    <Tooltip
                        label={
                            explorerCollapsed
                                ? 'Expand module explorer'
                                : 'Collapse module explorer'
                        }
                    >
                        <ActionIcon variant="subtle" onClick={toggleExplorer}>
                            {explorerCollapsed ? (
                                <IconLayoutSidebar size={24} />
                            ) : (
                                <IconLayoutSidebarFilled size={24} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Settings">
                        <ActionIcon variant="subtle" onClick={() => setSettingsOpen(true)}>
                            <IconSettings size={24} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Stack gap="xl" p="md" style={{ flex: 1 }}>
                <Title order={2}>{module.metadata.title}</Title>

                <Grid>
                    <Grid.Col span={explorerCollapsed ? 12 : 8}>
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Title order={3}>Quizzes</Title>
                                <Button
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan' }}
                                    onClick={() => setIsGenerating(true)}
                                >
                                    Generate Quiz
                                </Button>
                            </Group>
                            <Grid>
                                {module.quizzes.map((quiz) => (
                                    <Grid.Col key={quiz.id} span={6}>
                                        <QuizCard
                                            libraryId={module.metadata.libraryId}
                                            moduleId={module.id}
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

                    {!explorerCollapsed && (
                        <Grid.Col span={4}>
                            <ModuleInfoPanel module={module} />
                        </Grid.Col>
                    )}
                </Grid>
            </Stack>

            <Modal
                opened={isGenerating}
                onClose={() => setIsGenerating(false)}
                size="lg"
                title="Generate Quiz"
            >
                <QuizGenerationWizard
                    sources={module.sources}
                    libraryId={module.metadata.libraryId}
                    moduleSlug={module.id}
                    onComplete={handleQuizGenerated}
                    onCancel={() => setIsGenerating(false)}
                />
            </Modal>

            <Modal
                opened={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                title="Settings"
                size="lg"
                closeOnClickOutside={false}
            >
                <UserSettingsPanel />
            </Modal>
        </Stack>
    )
}
