import { Button, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { useNavigate } from '@tanstack/react-router'
import { QuestionList } from './components/QuestionList'

export type QuizPageProps = {
    libraryId: string
    moduleId: string
    quiz: Quiz
    submissions: Submission[]
}

export function QuizPage({ libraryId, moduleId, quiz, submissions }: QuizPageProps) {
    const navigate = useNavigate()

    // Define which header actions to enable
    const headerActions: HeaderAction[] = ['explorer', 'settings']

    if (!libraryId) {
        throw new Error('Library ID is required')
    }

    return (
        <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
            <AppHeader
                title={quiz.title}
                backLink={{
                    to: '/module/view/$libraryId/$moduleId',
                    params: { libraryId, moduleId },
                    label: 'Back to Module',
                }}
                actions={headerActions}
            />

            <Grid p="md" style={{ flex: 1, overflow: 'auto' }}>
                {/* Left side: Submissions Grid */}
                <Grid.Col span={8}>
                    <Stack gap="xl">
                        <Group justify="space-between" align="center">
                            <Title order={3}>Attempts</Title>
                            <Button
                                variant="light"
                                onClick={() =>
                                    navigate({
                                        to: '/quiz/session/$libraryId/$moduleId/$quizId',
                                        params: { libraryId, moduleId, quizId: quiz.id },
                                    })
                                }
                            >
                                Start Quiz
                            </Button>
                        </Group>

                        <Grid>
                            {submissions.map((submission) => (
                                <Grid.Col key={submission.attemptNumber} span={4}>
                                    <Paper p="md" withBorder>
                                        <Stack gap="xs">
                                            <Text fw={500}>Attempt {submission.attemptNumber}</Text>
                                            <Text size="sm" c="dimmed">
                                                {new Date(
                                                    submission.completedAt
                                                ).toLocaleDateString()}
                                            </Text>
                                            {submission.grade && (
                                                <Text>Score: {submission.grade}%</Text>
                                            )}
                                            <Button
                                                variant="light"
                                                size="xs"
                                                onClick={() =>
                                                    navigate({
                                                        to: '/submission/$libraryId/$moduleId/$quizId/$attempt',
                                                        params: {
                                                            libraryId,
                                                            moduleId,
                                                            quizId: quiz.id,
                                                            attempt: `${submission.attemptNumber}`,
                                                        },
                                                    })
                                                }
                                            >
                                                View Details
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Stack>
                </Grid.Col>

                {/* Right side: Questions List */}
                <Grid.Col span={4}>
                    <Paper p="md" withBorder>
                        <Stack gap="md">
                            <Title order={3}>Quiz Questions</Title>
                            <QuestionList questions={quiz.questions} />
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}
