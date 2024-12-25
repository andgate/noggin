import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { formatDate } from '../common/format'

type QuizCardProps = {
    title: string
    questionCount: number
    createdAt: string
    onStart: () => void
}

export function QuizCard({ title, questionCount, createdAt, onStart }: QuizCardProps) {
    return (
        <Card withBorder>
            <Stack gap="sm">
                <Text fw={500}>{title}</Text>
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        {questionCount} questions
                    </Text>
                    <Text size="sm" c="dimmed">
                        {formatDate(createdAt)}
                    </Text>
                </Group>
                <Button onClick={onStart} fullWidth>
                    Start Quiz
                </Button>
            </Stack>
        </Card>
    )
}
