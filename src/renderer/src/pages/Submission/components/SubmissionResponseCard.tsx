import { Paper, Stack, Text } from '@mantine/core'
import { Response } from '@noggin/types/quiz-types'

interface SubmissionResponseCardProps {
    response: Response
    index: number
}

export function SubmissionResponseCard({ response, index }: SubmissionResponseCardProps) {
    return (
        <Paper p="md" withBorder>
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
    )
}
