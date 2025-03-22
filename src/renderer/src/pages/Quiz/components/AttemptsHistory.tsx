import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { Submission } from '@noggin/types/quiz-types'
import { useNavigate } from '@tanstack/react-router'

type AttemptsHistoryProps = {
    submissions: Submission[]
    libraryId: string
    moduleId: string
    quizId: string
    onClose?: () => void
}

export function AttemptsHistory({
    submissions,
    libraryId,
    moduleId,
    quizId,
    onClose,
}: AttemptsHistoryProps) {
    const navigate = useNavigate()

    const handleViewDetails = (attemptNumber: number) => {
        if (onClose) {
            onClose()
        }

        navigate({
            to: '/submission/$libraryId/$moduleId/$quizId/$attempt',
            params: {
                libraryId,
                moduleId,
                quizId,
                attempt: `${attemptNumber}`,
            },
        })
    }

    return (
        <Stack gap="md">
            {submissions.length === 0 ? (
                <Text ta="center" c="dimmed" fz="sm">
                    No attempts yet
                </Text>
            ) : (
                submissions.map((submission) => (
                    <Card
                        key={submission.attemptNumber}
                        shadow="md"
                        radius="sm"
                        withBorder
                        bg="dark.7"
                    >
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text fw={500}>Attempt {submission.attemptNumber}</Text>
                                <Text size="sm" c="dimmed">
                                    {new Date(submission.completedAt).toLocaleDateString()}
                                </Text>
                                {submission.grade !== undefined && (
                                    <Text>Score: {submission.grade}%</Text>
                                )}
                            </div>
                            <Button
                                variant="filled"
                                color="purple"
                                size="sm"
                                onClick={() => handleViewDetails(submission.attemptNumber)}
                            >
                                View Details
                            </Button>
                        </Group>
                    </Card>
                ))
            )}
        </Stack>
    )
}
