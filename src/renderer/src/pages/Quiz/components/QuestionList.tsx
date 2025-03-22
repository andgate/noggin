import { Card, List, Stack, Text } from '@mantine/core'
import { Question } from '@noggin/types/quiz-types'

type QuestionListProps = {
    questions: Question[]
}

export function QuestionList({ questions }: QuestionListProps) {
    return (
        <Stack gap="md">
            {questions.map((question, index) => (
                <Card key={index} shadow="sm" radius="sm" withBorder>
                    <Card.Section withBorder inheritPadding py="xs" bg="dark.5">
                        <Text fw={600}>Question {index + 1}</Text>
                    </Card.Section>

                    <Stack gap="md" p="md">
                        <Text>{question.question}</Text>

                        {question.questionType === 'multiple_choice' && (
                            <List type="ordered" spacing="xs">
                                {question.choices.map((choice, choiceIndex) => (
                                    <List.Item key={choiceIndex}>{choice.optionText}</List.Item>
                                ))}
                            </List>
                        )}
                    </Stack>
                </Card>
            ))}
        </Stack>
    )
}
