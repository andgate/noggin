import { formatDate } from '@/shared/utils/format'
import { ActionIcon, Button, Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

type QuizCardProps = {
  moduleId: string
  title: string
  questionCount: number
  createdAt: string
  quizId: string
  onDelete?: () => void
  editMode?: boolean
}

export function QuizCard({
  moduleId,
  quizId,
  title,
  questionCount,
  createdAt,
  onDelete,
  editMode = false,
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
          {onDelete && editMode && (
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
        <Group justify="flex-end">
          <Button variant="light" onClick={handleViewQuiz}>
            View Quiz
          </Button>
          <Button onClick={handleStartQuiz}>Start Quiz</Button>
        </Group>
      </Stack>
    </Card>
  )
}
