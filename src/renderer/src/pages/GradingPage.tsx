// TODO Retry grading
// Add the ability to retry grading a submission, even if it's already been graded and saved.
// While you're at it, make sure ungraded submissions are also saved.
// This will GREATLY improve the user experience.
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
import { useUserSettings } from '@renderer/hooks/use-user-settings'
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
    error?: Error
}

// Separate component for rendering individual graded responses
const GradedQuestionDisplay: React.FC<GradedQuestionDisplayProps> = ({
    question,
    studentResponse,
    gradedResponse,
    error,
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

                {!error &&
                    (gradedResponse ? (
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
                    ))}
            </Stack>
        </Paper>
    )
}

export function GradingPage() {
    const navigate = useNavigate()
    const { openaiApiKey } = useUserSettings()
    const { activeQuizState } = useActiveQuiz()
    const { quiz, studentResponses } = useMemo(() => activeQuizState, [activeQuizState])
    const [isSubmissionSaved, setIsSubmissionSaved] = useState(false)

    const {
        generateGrades,
        gradedSubmission,
        isGradeGeneratorRunning,
        isDoneGrading,
        gradingError,
    } = useGradesGenerator()

    useEffect(() => {
        console.debug('[GradingPage] Current state:', {
            activeQuizState,
            hasQuiz: !!quiz,
            studentResponses: studentResponses.slice(0, 10),
            responseCount: studentResponses.length,
            isGradeGeneratorRunning,
            hasError: !!gradingError,
        })
    }, [
        quiz,
        studentResponses,
        generateGrades,
        gradedSubmission,
        isGradeGeneratorRunning,
        gradingError,
    ])

    useEffect(() => {
        if (quiz && isDoneGrading && !isSubmissionSaved && !gradingError) {
            setIsSubmissionSaved(true) // Immediately set to true to prevent re-saving (is there a race condition here?)
            console.debug('[GradingPage] Grading process completed. Saving...')
            storeQuizSubmission({
                quiz,
                gradedResponses: gradedSubmission?.responses || [],
                timeElapsed: activeQuizState.elapsedTime,
            })
        }
    }, [isDoneGrading, isSubmissionSaved, quiz, gradedSubmission, activeQuizState, gradingError])

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
            apiKey: openaiApiKey,
            quiz: activeQuizState.quiz,
            studentResponses: activeQuizState.studentResponses,
        })
    }, [])

    return (
        <Card maw={800} mx="auto" withBorder p="xl" radius="md">
            <Stack gap="lg">
                {!quiz && (
                    <Alert color="red" title="Grading Error">
                        No quiz available to grade.
                    </Alert>
                )}

                {quiz && <Title order={2}>{quiz.title} - Grading</Title>}

                {gradingError && (
                    <Alert color="red" mt="md" title="Generation Error">
                        <Text lineClamp={3} size="sm" style={{ wordBreak: 'break-word' }}>
                            {gradingError.message}
                        </Text>
                    </Alert>
                )}

                {isGradeGeneratorRunning && !gradingError && (
                    <Alert color="blue" title="Grading in Progress">
                        The AI is currently grading your responses...
                    </Alert>
                )}

                {quiz && (
                    <Stack gap="md">
                        {(quiz?.questions || []).map((question, index) => (
                            <GradedQuestionDisplay
                                key={index}
                                question={question}
                                studentResponse={studentResponses[index]}
                                gradedResponse={gradedResponses[index] ?? undefined}
                                error={gradingError}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
            {isDoneGrading && (
                <Group justify="space-between" mt="lg">
                    <Group>
                        <Button
                            size="lg"
                            onClick={() => {
                                navigate({
                                    to: '/quiz/practice/$quizId',
                                    params: { quizId: `${quiz!.id}` },
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
                        {isSubmissionSaved ? (
                            <Text c="gray" fs="italic">
                                Submission saved!
                            </Text>
                        ) : (
                            <Text c="red" fs="italic">
                                Submission not saved.
                            </Text>
                        )}
                    </Group>

                    <Button size="lg" variant="subtle" onClick={() => navigate({ to: '/' })}>
                        Return to Dashboard
                    </Button>
                </Group>
            )}
        </Card>
    )
}
