import { Button, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { IconArrowLeft } from '@tabler/icons-react'
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

    if (!libraryId) {
        throw new Error('Library ID is required')
    }

    return (
        <Stack h="100vh">
            <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
                <Button
                    variant="subtle"
                    onClick={() =>
                        navigate({
                            to: '/module/view/$libraryId/$moduleId',
                            params: { libraryId, moduleId },
                        })
                    }
                >
                    <Group gap="xs">
                        <IconArrowLeft size={16} />
                        Back to Module
                    </Group>
                </Button>
            </Group>

            <Grid p="md" style={{ flex: 1 }}>
                {/* Left side: Submissions Grid */}
                <Grid.Col span={8}>
                    <Stack gap="xl">
                        <Group justify="space-between" align="center">
                            <Title order={2}>{quiz.title}</Title>
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
