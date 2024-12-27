import { Paper, Stack, Text } from '@mantine/core'
import { Submission } from '@noggin/types/quiz-types'

interface SubmissionGradeInfoProps {
    submission: Submission
}

export function SubmissionGradeInfo({ submission }: SubmissionGradeInfoProps) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="xs">
                <Text>Completed: {new Date(submission.completedAt).toLocaleString()}</Text>
                <Text>Time Taken: {Math.round(submission.timeElapsed / 60)} minutes</Text>
                {submission.grade != null && (
                    <Text>
                        Grade: {submission.grade}% ({submission.letterGrade})
                    </Text>
                )}
            </Stack>
        </Paper>
    )
}
