import { Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { Submission } from '@noggin/types/quiz-types'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

interface SubmissionPageProps {
    moduleId: string
    submission: Submission
}

export function SubmissionPage({ moduleId, submission }: SubmissionPageProps) {
    const navigate = useNavigate()

    return (
        <Container size="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Button
                        onClick={() =>
                            navigate({ to: '/module/view/$moduleId', params: { moduleId } })
                        }
                        leftSection={<IconArrowLeft />}
                        variant="subtle"
                    >
                        Back to Module
                    </Button>

                    {submission.status === 'pending' && (
                        <Button color="blue">Grade Submission</Button>
                    )}
                </Group>

                <Title order={2}>{submission.quizTitle}</Title>

                <Paper p="md" withBorder>
                    <Stack gap="xs">
                        <Text>Completed: {new Date(submission.completedAt).toLocaleString()}</Text>
                        <Text>Time Taken: {Math.round(submission.timeElapsed / 60)} minutes</Text>
                        {submission.grade && (
                            <Text>
                                Grade: {submission.grade}% ({submission.letterGrade})
                            </Text>
                        )}
                    </Stack>
                </Paper>

                <Stack gap="md">
                    {submission.responses.map((response, index) => (
                        <Paper key={index} p="md" withBorder>
                            <Stack gap="xs">
                                <Text fw={500}>Question {index + 1}</Text>
                                <Text>{response.question.question}</Text>
                                <Text c="dimmed">Your Answer:</Text>
                                <Text>{response.studentAnswer}</Text>

                                {response.status === 'graded' && (
                                    <>
                                        <Text c="dimmed">Correct Answer:</Text>
                                        <Text>{response.correctAnswer}</Text>
                                        <Text c={response.verdict === 'pass' ? 'green' : 'red'}>
                                            {response.verdict === 'pass' ? 'Correct' : 'Incorrect'}
                                        </Text>
                                        <Text size="sm">{response.feedback}</Text>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        </Container>
    )
}
