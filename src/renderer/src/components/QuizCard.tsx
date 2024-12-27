import { ActionIcon, Button, Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { formatDate } from '../common/format'

type QuizCardProps = {
    moduleId: string
    title: string
    questionCount: number
    createdAt: string
    quizId: string
    onDelete?: () => void
}

export function QuizCard({
    moduleId,
    quizId,
    title,
    questionCount,
    createdAt,
    onDelete,
}: QuizCardProps) {
    const navigate = useNavigate()

    const handleViewQuiz = () => {
        navigate({
            to: '/quiz/view/$moduleId/$quizId',
            params: {
                moduleId,
                quizId,
            },
        })
    }

    const handleStartQuiz = () => {
        navigate({
            to: '/quiz/session/$moduleId/$quizId',
            params: {
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
