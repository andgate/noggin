import { Paper, Stack, Text } from '@mantine/core'
import type { Tables } from '@noggin/types/database.types'

type DbSubmission = Tables<'submissions'>

interface SubmissionGradeInfoProps {
  submission: DbSubmission
}

export function SubmissionGradeInfo({ submission }: SubmissionGradeInfoProps) {
  // Format timestamp if available
  const completedDate = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleString()
    : 'N/A'

  // Calculate minutes, handle null time_elapsed_seconds
  const timeTakenMinutes =
    submission.time_elapsed_seconds != null
      ? Math.round(submission.time_elapsed_seconds / 60)
      : 'N/A'

  return (
    <Paper p="md" withBorder>
      <Stack gap="xs">
        <Text>Completed: {completedDate}</Text>
        <Text>Time Taken: {timeTakenMinutes} minutes</Text>
        {/* Use grade_percent and letter_grade */}
        {submission.grade_percent != null && (
          <Text>
            Grade: {submission.grade_percent}% ({submission.letter_grade ?? 'N/A'})
          </Text>
        )}
      </Stack>
    </Paper>
  )
}
