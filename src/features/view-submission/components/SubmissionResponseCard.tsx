import type { Tables } from '@/shared/types/database.types'
import { Paper, Stack, Text } from '@mantine/core'

type DbResponse = Tables<'responses'>

interface SubmissionResponseCardProps {
  response: DbResponse
  index: number
  // --- TODO: These should be passed down from the parent ---
  // The parent (SubmissionPage) needs to fetch questions and find the matching one
  questionText: string
  correctAnswerText: string | null // Correct answer might not always be text (e.g., multiple choice selection)
  // --- ---
}

export function SubmissionResponseCard({
  response,
  index,
  questionText,
  correctAnswerText,
}: SubmissionResponseCardProps) {
  const isGraded = response.graded_at != null

  return (
    <Paper p="md" withBorder>
      <Stack gap="xs">
        <Text fw={500}>Question {index + 1}</Text>
        {/* Use the passed questionText prop */}
        <Text>{questionText}</Text>
        <Text c="dimmed">Your Answer:</Text>
        {/* Use student_answer_text */}
        <Text>{response.student_answer_text ?? 'No answer provided'}</Text>

        {/* Show grading info if graded_at is not null */}
        {isGraded && (
          <>
            {/* Use the passed correctAnswerText prop */}
            {correctAnswerText && (
              <>
                <Text c="dimmed">Correct Answer:</Text>
                <Text>{correctAnswerText}</Text>
              </>
            )}
            {/* Use is_correct boolean */}
            {response.is_correct != null && (
              <Text c={response.is_correct ? 'green' : 'red'}>
                {response.is_correct ? 'Correct' : 'Incorrect'}
              </Text>
            )}
            {/* Use feedback */}
            {response.feedback && <Text size="sm">Feedback: {response.feedback}</Text>}
          </>
        )}
      </Stack>
    </Paper>
  )
}
