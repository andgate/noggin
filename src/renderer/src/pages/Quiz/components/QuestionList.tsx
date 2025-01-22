import { List, Paper, Stack, Text } from '@mantine/core'
import { Question } from '@noggin/types/quiz-types'

type QuestionListProps = {
    questions: Question[]
}

export function QuestionList({ questions }: QuestionListProps) {
    return (
        <Stack gap="md">
            {questions.map((question, index) => (
                <Paper key={index} p="md" withBorder>
                    <Stack gap="sm">
                        <Text fw={500}>Question {index + 1}</Text>
                        <Text>{question.question}</Text>

                        {question.questionType === 'multiple_choice' && (
                            <List type="ordered" spacing="xs">
                                {question.choices.map((choice, choiceIndex) => (
                                    <List.Item key={choiceIndex}>{choice.optionText}</List.Item>
                                ))}
                            </List>
                        )}
                    </Stack>
                </Paper>
            ))}
        </Stack>
    )
}
