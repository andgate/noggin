import { ActionIcon, Button, Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { formatDate } from '../../../app/common/format'

type QuizCardProps = {
    libraryId: string
    moduleId: string
    title: string
    questionCount: number
    createdAt: string
    quizId: string
    onDelete?: () => void
}

export function QuizCard({
    libraryId,
    moduleId,
    quizId,
    title,
    questionCount,
    createdAt,
    onDelete,
}: QuizCardProps) {
    const navigate = useNavigate()

    const handleViewQuiz = () => {
        if (!libraryId) {
            throw new Error('Library ID is required for navigation')
        }

        navigate({
            to: '/quiz/view/$libraryId/$moduleId/$quizId',
            params: {
                libraryId,
                moduleId,
                quizId,
            },
        })
    }

    const handleStartQuiz = () => {
        if (!libraryId) {
            throw new Error('Library ID is required for navigation')
        }

        navigate({
            to: '/quiz/session/$libraryId/$moduleId/$quizId',
            params: {
                libraryId,
                moduleId,
                quizId,
            },
        })
    }

    return (
        <Card withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Text fw={500}>{title}</Text>
                    {onDelete && (
                        <Tooltip label="Delete quiz">
                            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        {questionCount} questions
                    </Text>
                    <Text size="sm" c="dimmed">
                        {formatDate(createdAt)}
                    </Text>
                </Group>
                <Group>
                    <Button variant="light" onClick={handleViewQuiz} fullWidth>
                        View Quiz
                    </Button>
                    <Button onClick={handleStartQuiz} fullWidth>
                        Start Quiz
                    </Button>
                </Group>
            </Stack>
        </Card>
    )
}
