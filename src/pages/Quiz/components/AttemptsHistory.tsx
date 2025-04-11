import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { Route } from '@noggin/routes/quiz/view.$libraryId.$moduleId.$quizId'
import type { Tables } from '@noggin/types/database.types'
import { useNavigate } from '@tanstack/react-router'

type DbSubmission = Tables<'submissions'>

type AttemptsHistoryProps = {
  submissions: DbSubmission[]
  libraryId: string
  onClose?: () => void
}

export function AttemptsHistory({ submissions, libraryId, onClose }: AttemptsHistoryProps) {
  const navigate = useNavigate()
  const { moduleId, quizId } = Route.useParams()

  const handleViewDetails = (attemptNumber: number) => {
    if (onClose) {
      onClose()
    }

    if (!moduleId || !quizId) {
      console.error('Missing moduleId or quizId from route params for navigation')
      // Optionally show an error to the user
      return
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
        [...submissions]
          .sort((a, b) => a.attempt_number - b.attempt_number)
          .map((submission) => (
            <Card key={submission.id} shadow="md" radius="sm" withBorder bg="dark.7">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={500}>Attempt {submission.attempt_number}</Text>
                  {/* Use submitted_at, check for null */}
                  {submission.submitted_at && (
                    <Text size="sm" c="dimmed">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </Text>
                  )}
                  {/* Use grade_percent, check for null */}
                  {submission.grade_percent !== null && (
                    <Text>Score: {submission.grade_percent}%</Text>
                  )}
                </div>
                <Button
                  variant="filled"
                  color="purple"
                  size="sm"
                  // Pass attempt_number to handler
                  onClick={() => handleViewDetails(submission.attempt_number)}
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
