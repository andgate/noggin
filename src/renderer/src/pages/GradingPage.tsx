import { Alert, Badge, Card, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useGradesGenerator } from '@renderer/hooks/use-grades-generator'
import { GradedResponse } from '@renderer/types/quiz-generation-types'
import { Question } from '@renderer/types/quiz-view-types'
import { useEffect, useMemo } from 'react'
import { useActiveQuiz } from '../hooks/use-active-quiz'

interface GradedQuestionDisplayProps {
    question: Question
    studentResponse: string
    gradedResponse?: GradedResponse
}

// Separate component for rendering individual graded responses
const GradedQuestionDisplay: React.FC<GradedQuestionDisplayProps> = ({
    question,
    studentResponse,
    gradedResponse,
}) => {
    return (
        <Paper withBorder p="md" mb="md" radius="md">
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={4}>Question</Title>
                    {gradedResponse && (
                        <Badge color={gradedResponse.verdict === 'pass' ? 'green' : 'red'}>
                            {gradedResponse.verdict.toUpperCase()}
                        </Badge>
                    )}
                </Group>

                <Text fw={500}>{question.question}</Text>

                {question.questionType === 'multiple_choice' && (
                    <Stack gap="xs">
                        {question.choices.map((choice, idx) => (
                            <Paper
                                key={idx}
                                withBorder
                                p="xs"
                                bg={choice.isCorrect ? 'var(--mantine-color-green-0)' : undefined}
                            >
                                <Text size="sm">{choice.optionText}</Text>
                            </Paper>
                        ))}
                    </Stack>
                )}

                <Stack gap="xs">
                    <Text fw={500}>Student Answer:</Text>
                    <Paper withBorder p="xs">
                        <Text>{studentResponse || '...'}</Text>
                    </Paper>
                </Stack>

                {gradedResponse ? (
                    <Stack gap="xs">
                        <Text fw={500}>Feedback:</Text>
                        <Paper withBorder p="xs">
                            <Stack gap="xs">
                                <Text fw={500}>Correct Answer:</Text>
                                <Paper withBorder p="xs">
                                    <Text>{gradedResponse.correctAnswer}</Text>
                                </Paper>
                            </Stack>
                            <Text fw={500} mb={4} tt="capitalize">
                                {gradedResponse.verdict}
                            </Text>
                            <Text>{gradedResponse.feedback}</Text>
                        </Paper>
                    </Stack>
                ) : (
                    <Stack gap="xs">
                        <Text fw={500}>Feedback:</Text>
                        <Paper withBorder p="xs">
                            <Stack gap="xs">
                                <Skeleton height={20} />
                                <Skeleton height={60} />
                            </Stack>
                        </Paper>
                    </Stack>
                )}
            </Stack>
        </Paper>
    )
}

export function GradingPage() {
    const { activeQuizState } = useActiveQuiz()
    const { quiz, studentResponses } = useMemo(() => activeQuizState, [activeQuizState])

    const { generateGrades, gradedSubmission, isRunning, error, abort } = useGradesGenerator()
    const abortController = new AbortController()

    useEffect(() => {
        // No quiz to grade, return early.
        if (!activeQuizState.quiz) return

        generateGrades({
            quiz: activeQuizState.quiz,
            studentResponses: activeQuizState.studentResponses,
            controller: abortController,
        })

        return () => {
            abortController.abort()
            abort()
        }
    }, [])

    if (!quiz) {
        return (
            <Alert color="red" title="Grading Error">
                No quiz to grade
            </Alert>
        )
    }

    if (error) {
        return (
            <Alert color="red" title="Grading Error">
                Failed to grade quiz: {error.message}
            </Alert>
        )
    }

    return (
        <Card withBorder p="xl" radius="md">
            <Stack gap="lg">
                <Title order={2}>{quiz.title} - Grading</Title>

                {isRunning && (
                    <Alert color="blue" title="Grading in Progress">
                        The AI is currently grading your responses...
                    </Alert>
                )}

                <Stack gap="md">
                    {quiz.questions.map((question, index) => (
                        <GradedQuestionDisplay
                            key={index}
                            question={question}
                            studentResponse={studentResponses[index]}
                            gradedResponse={gradedSubmission?.responses[index]}
                        />
                    ))}
                </Stack>
            </Stack>
        </Card>
    )
}
