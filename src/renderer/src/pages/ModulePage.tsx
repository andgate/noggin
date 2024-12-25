import { Button, Grid, Group, Modal, Stack, Title } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { PartialGeneratedQuiz } from '@noggin/types/quiz-generation-types'
import { useState } from 'react'
import { ModuleInfoPanel } from '../components/ModuleInfoPanel'
import { QuizCard } from '../components/QuizCard'
import { QuizGenerationWizard } from '../components/QuizGenerationWizard'

type ModulePageProps = {
    module: Mod
}

export function ModulePage({ module }: ModulePageProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleQuizGenerated = (_quiz: PartialGeneratedQuiz) => {
        // TODO: Implement quiz saving logic
        setIsGenerating(false)
    }

    return (
        <Stack gap="xl">
            <Group justify="space-between" align="center">
                <Title order={2}>{module.name}</Title>
                <Button
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    onClick={() => setIsGenerating(true)}
                >
                    Generate Quiz
                </Button>
            </Group>

            <Grid>
                {/* Main Content - Quizzes Grid */}
                <Grid.Col span={8}>
                    <Stack gap="md">
                        <Title order={3}>Quizzes</Title>
                        <Grid>
                            {module.quizzes.map((quiz) => (
                                <Grid.Col key={quiz.id} span={6}>
                                    <QuizCard
                                        title={quiz.title}
                                        questionCount={quiz.questions.length}
                                        createdAt={quiz.createdAt}
                                        onStart={() => {
                                            // TODO: Implement quiz starting logic
                                        }}
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Stack>
                </Grid.Col>

                {/* Module Info Panel */}
                <Grid.Col span={4}>
                    <ModuleInfoPanel module={module} />
                </Grid.Col>
            </Grid>

            <Modal
                opened={isGenerating}
                onClose={() => setIsGenerating(false)}
                size="lg"
                title="Generate Quiz"
            >
                <QuizGenerationWizard
                    sources={module.sources}
                    onComplete={handleQuizGenerated}
                    onCancel={() => setIsGenerating(false)}
                />
            </Modal>
        </Stack>
    )
}
