// TODO: Add a regenerate button
import { Alert, Badge, Button, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useOpenAI } from '@renderer/hooks/use-openai'
import { useQuizGenerator } from '@renderer/hooks/use-quiz-generator'
import { useUserSettings } from '@renderer/hooks/use-user-settings'
import { useNavigate } from '@tanstack/react-router'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { createQuiz } from '../services/quiz-service'
import { GeneratedQuestion, GeneratedQuiz } from '../types/quiz-generation-types'
import { QuestionType } from '../types/quiz-view-types'

export interface QuestionItemProps {
    index: number
    question?: GeneratedQuestion
    isLoading: boolean
    error?: Error
}

// Question component with generation logic
const QuestionGenerator: React.FC<QuestionItemProps> = ({ index, question, isLoading, error }) => {
    console.log('[QuestionGenerator] Rendering', { index, question, isLoading, error })
    if (error) return <Alert color="red">Failed to generate question {index + 1}</Alert>
    if (isLoading || !question) return <Skeleton height={100} mb="md" animate={true} />

    return (
        <Paper withBorder p="md" mb="md" radius="md">
            <Stack gap="sm">
                <Group justify="space-between" align="center">
                    <Title order={4}>Question {index + 1}</Title>
                    <Badge>
                        {question.questionType === 'multiple_choice'
                            ? 'Multiple Choice'
                            : 'Written'}
                    </Badge>
                </Group>

                <Text>{question.question}</Text>

                {question.questionType === 'multiple_choice' && (
                    <Stack gap="xs">
                        {question.choices.map((choice, choiceIndex) => (
                            <Paper key={choiceIndex} withBorder p="xs">
                                <Group gap="sm">
                                    <Text size="sm" fw={400}>
                                        {choice.text}
                                    </Text>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    )
}

export interface QuizTitleProps {
    title?: string
    isLoading: boolean
    error?: Error
}

// Quiz title component with generation logic
const QuizTitleGenerator: React.FC<QuizTitleProps> = ({ title, isLoading, error }) => {
    console.log('[QuizTitleGenerator] Rendering', { title, isLoading, error })
    if (error)
        return (
            <Alert color="red" title="Title Generation Error">
                Title failed
            </Alert>
        )
    if (isLoading || !title) return <Skeleton height={50} mb="xl" animate={true} />

    return <h2>{title}</h2>
}

interface QuizGeneratorProps {
    show: boolean
    sources: string[]
    questionTypes: QuestionType[]
    questionCount: number
    timeLimit: number
}

// Add this interface for the imperative handle
export interface QuizGeneratorHandle {
    run: () => void
}

/** Quiz generator component
 *
 * When mounted, the component will generate a quiz.
 * It is recommended to use the components `key` prop to control when generation is triggered.
 * This can be accomplished by passing in a simple number state and incrementing it to run the generation again.
 *
 * @param sources - The sources to use for the quiz
 * @param questionTypes - The question types to use for the quiz
 * @param questionCount - The number of questions to generate
 */
export const QuizGenerator = forwardRef<QuizGeneratorHandle, QuizGeneratorProps>(
    ({ show, sources, questionTypes, questionCount, timeLimit }, ref) => {
        const { openaiApiKey } = useUserSettings()
        const navigate = useNavigate({ from: '/quiz/create' })
        const [isSaving, setIsSaving] = useState(false)
        const [saveError, setSaveError] = useState<Error | undefined>(undefined)

        const {
            generateQuiz,
            quiz,
            isRunning: isGenerating,
            abort: handleCancel,
        } = useQuizGenerator()

        const { title = '', questions = [] } = useMemo(
            () => quiz || { title: '', questions: [] },
            [quiz]
        )
        const isGenerationComplete = useMemo(
            () => title && questions.every(Boolean),
            [title, questions]
        )

        // Add the generation function
        const runGeneration = useCallback<() => Promise<void>>(async () => {
            console.log('[QuizGenerator] Starting quiz generation')

            try {
                generateQuiz({
                    apiKey: openaiApiKey,
                    sources,
                    questionTypes,
                    questionCount,
                    existingQuestions: [],
                })
            } catch (error) {
                console.error('[QuizGenerator] Error generating quiz:', error)
                notifications.show({
                    title: 'Error',
                    message: 'Failed to generate quiz. Please try again.',
                    color: 'red',
                })
            }
        }, [generateQuiz, sources, questionTypes, questionCount])

        // Expose the run function via useImperativeHandle
        useImperativeHandle(
            ref,
            () => ({
                run: runGeneration,
            }),
            [runGeneration]
        )

        const handleSave = useCallback(async () => {
            if (!title || questions.some((q) => !q)) {
                console.log('[Save] Cannot save - incomplete quiz:', {
                    title,
                    questions,
                })
                return
            }

            console.log('[Save] Starting save with:', {
                title,
                questions,
                sources,
                timeLimit,
            })
            setIsSaving(true)
            setSaveError(undefined)

            try {
                const generatedQuiz: GeneratedQuiz = {
                    title: title,
                    questions: questions as GeneratedQuestion[],
                }
                const quizId = await createQuiz({ generatedQuiz, sources, timeLimit })
                console.log('[Save] Quiz saved successfully')
                return quizId
            } catch (error) {
                console.error('[Save] Save failed:', error)
                setSaveError(error as Error)
            } finally {
                setIsSaving(false)
            }

            return null
        }, [title, questions, sources, setIsSaving, setSaveError])

        const handleStartPractice = useCallback(async () => {
            const quizId = await handleSave()
            if (quizId) navigate({ to: '/quiz/practice/$quizId', params: { quizId: `${quizId}` } })
        }, [handleSave, navigate])

        if (!show) return <></>

        return (
            <div>
                <Group mt="xl">
                    <Button
                        onClick={handleStartPractice}
                        disabled={!isGenerationComplete}
                        loading={isSaving}
                        variant="light"
                    >
                        Practice Now
                    </Button>
                    {isGenerating && (
                        <Button onClick={handleCancel} color="red" variant="light">
                            Cancel
                        </Button>
                    )}
                </Group>

                <QuizTitleGenerator title={title} isLoading={!title} />
                <div>
                    {(questions || []).map((_, index) => (
                        <QuestionGenerator
                            key={index}
                            index={index}
                            question={questions[index]}
                            isLoading={!questions[index]}
                        />
                    ))}
                </div>

                {saveError && (
                    <Alert color="red" mt="md">
                        Failed to save quiz: {saveError.message}
                    </Alert>
                )}
            </div>
        )
    }
)
