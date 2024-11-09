import {
    Alert,
    Badge,
    Button,
    Card,
    Group,
    Paper,
    Skeleton,
    Stack,
    Text,
    Title,
} from '@mantine/core'
import { useGradesGenerator } from '@renderer/hooks/use-grades-generator'
import { useOpenAI } from '@renderer/hooks/use-openai'
import { storeQuizSubmission } from '@renderer/services/submission-service'
import { GradedResponse } from '@renderer/types/quiz-generation-types'
import { Question } from '@renderer/types/quiz-view-types'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
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
                                styles={
                                    choice.isCorrect
                                        ? {
                                              root: {
                                                  borderColor: 'var(--mantine-color-green-6)',
                                                  borderWidth: 2,
                                              },
                                          }
                                        : undefined
                                }
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
    const { openai } = useOpenAI()
    const navigate = useNavigate()
    const { activeQuizState } = useActiveQuiz()
    const { quiz, studentResponses } = useMemo(() => activeQuizState, [activeQuizState])
    const [isSubmissionSaved, setIsSubmissionSaved] = useState(false)

    const { generateGrades, gradedSubmission, isGradeGeneratorRunning, isDoneGrading, error } =
        useGradesGenerator()

    useEffect(() => {
        console.debug('[GradingPage] Current state:', {
            activeQuizState,
            hasQuiz: !!quiz,
            studentResponses: studentResponses.slice(0, 10),
            responseCount: studentResponses.length,
            isGradeGeneratorRunning,
            hasError: !!error,
        })
    }, [quiz, studentResponses, generateGrades, gradedSubmission, isGradeGeneratorRunning, error])

    useEffect(() => {
        if (quiz && isDoneGrading && !isSubmissionSaved) {
            setIsSubmissionSaved(true) // Immediately set to true to prevent re-saving (is there a race condition here?)
            console.debug('[GradingPage] Grading process completed. Saving...')
            storeQuizSubmission({
                quiz,
                gradedResponses: gradedSubmission?.responses || [],
                timeElapsed: activeQuizState.elapsedTime,
            })
        }
    }, [isDoneGrading, isSubmissionSaved, quiz, gradedSubmission, activeQuizState])

    const gradedResponses = useMemo(() => {
        const responses = gradedSubmission?.responses || []
        console.debug('[GradingPage] Graded responses:', responses.length)
        return responses
    }, [gradedSubmission])

    useEffect(() => {
        console.debug('[GradingPage] Starting grading process')

        if (!activeQuizState.quiz) {
            console.debug('[GradingPage] No quiz found, skipping grading')
            return
        }

        generateGrades({
            openai,
            quiz: activeQuizState.quiz,
            studentResponses: activeQuizState.studentResponses,
        })
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
        <Card maw={800} mx="auto" withBorder p="xl" radius="md">
            <Stack gap="lg">
                <Title order={2}>{quiz.title} - Grading</Title>

                {isGradeGeneratorRunning && (
                    <Alert color="blue" title="Grading in Progress">
                        The AI is currently grading your responses...
                    </Alert>
                )}

                <Stack gap="md">
                    {(quiz.questions || []).map((question, index) => (
                        <GradedQuestionDisplay
                            key={index}
                            question={question}
                            studentResponse={studentResponses[index]}
                            gradedResponse={gradedResponses[index] ?? undefined}
                        />
                    ))}
                </Stack>
            </Stack>
            {isDoneGrading && (
                <Group justify="space-between" mt="lg">
                    <Group>
                        <Button
                            size="lg"
                            onClick={() => {
                                navigate({
                                    to: '/quiz/practice/$quizId',
                                    params: { quizId: `${quiz.id}` },
                                })
                            }}
                        >
                            Retake Quiz
                        </Button>
                        <Button
                            size="lg"
                            variant="light"
                            onClick={() => navigate({ to: '/quiz/create' })}
                        >
                            New Quiz
                        </Button>
                    </Group>

                    <Text c="gray" fs="italic">
                        Submission saved!
                    </Text>

                    <Button size="lg" variant="subtle" onClick={() => navigate({ to: '/' })}>
                        Return to Dashboard
                    </Button>
                </Group>
            )}
        </Card>
    )
}
