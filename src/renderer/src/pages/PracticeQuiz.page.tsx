// TODO quiz timer for practice quiz
import { Box, Button, Card, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useInterval } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useActiveQuiz } from '@renderer/hooks/use-active-quiz'
import { useNavigate } from '@tanstack/react-router'
import { produce } from 'immer'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Question, Quiz } from '../types/quiz-view-types'

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Component for multiple choice questions
const MultiChoiceQuestionItem: React.FC<{
    question: Extract<Question, { questionType: 'multiple_choice' }>
    questionLabel: string
    form: ReturnType<typeof useForm>
}> = ({ question, questionLabel, form }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Radio.Group {...form.getInputProps(`question_${question.id}`)}>
            <Stack>
                {question.choices.map((choice) => (
                    <Radio key={choice.id} value={choice.optionText} label={choice.optionText} />
                ))}
            </Stack>
        </Radio.Group>
    </Box>
)

// Component for written questions
const WrittenQuestionItem: React.FC<{
    question: Extract<Question, { questionType: 'written' }>
    questionLabel: string
    form: ReturnType<typeof useForm>
}> = ({ question, questionLabel, form }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Textarea {...form.getInputProps(`question_${question.id}`)} minRows={4} />
    </Box>
)

// Main QuestionItem component that delegates to specific question type components
const QuestionItem: React.FC<{
    question: Question
    index: number
    form: ReturnType<typeof useForm>
}> = ({ question, index, form }) => {
    const questionLabel = `${index + 1}. ${question.question}`

    if (question.questionType === 'multiple_choice') {
        return (
            <MultiChoiceQuestionItem
                question={question}
                questionLabel={questionLabel}
                form={form}
            />
        )
    }

    return <WrittenQuestionItem question={question} questionLabel={questionLabel} form={form} />
}

// TODO: Add keyboard navigation support
// TODO: Add progress saving functionality
// TODO: Implement time tracking for quiz attempts
// TODO: Add accessibility attributes to form elements
// TODO: Implement SSR for initial quiz data
// TODO: Add optimistic UI updates for submissions
// TODO: Add offline support with local storage
// TODO: Implement progressive loading for large quizzes
export const PracticeQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: '/quiz/practice/$quizId' })
    const { setActiveQuizState, startQuiz, setStudentResponses, submitActiveQuiz } = useActiveQuiz()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const timeLimitInSeconds = quiz.timeLimit * 60 // Convert minutes to seconds

    const form = useForm<Record<string, string>>({
        initialValues: quiz.questions.reduce(
            (acc, question) => ({
                ...acc,
                [`question_${question.id}`]: '',
            }),
            {}
        ),
    })

    // On mount, set the active quiz state
    useEffect(() => {
        startQuiz(quiz)
    }, [])

    const handleSubmit = useCallback(
        (_values: Record<string, string>, event: React.FormEvent<HTMLFormElement> | undefined) => {
            setIsSubmitting(true)
            event?.preventDefault()

            // Update active quiz state with end time
            submitActiveQuiz(Object.values(form.values))

            // Navigate to evaluation page
            navigate({
                to: '/quiz/eval',
                params: { quizId: `${quiz.id}` },
            })
        },
        [navigate, quiz.id, setActiveQuizState]
    )

    const handleFormChange = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()

            // Map form values to responses array in the same order as questions
            const formResponses = quiz.questions.map(
                (question) => form.getValues()[`question_${question.id}`] || ''
            )

            console.log('[PracticeQuizPage] Form updated:', formResponses)

            setStudentResponses(formResponses)

            setActiveQuizState((prev) =>
                produce(prev, (draft) => {
                    draft.questions = quiz.questions
                    draft.studentResponses = formResponses
                })
            )
        },
        [setActiveQuizState, quiz, setStudentResponses]
    )

    // Setup timer interval
    const timer = useInterval(() => {
        setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Start timer on mount
    useEffect(() => {
        timer.start()
        return () => timer.stop()
    }, [])

    // Auto-submit when time limit is reached
    useEffect(() => {
        if (elapsedTime >= timeLimitInSeconds) {
            notifications.show({
                title: "Time's up!",
                message: 'Your quiz is being submitted automatically.',
                color: 'blue',
            })
            handleSubmit(form.values, undefined)
        }
    }, [elapsedTime, timeLimitInSeconds])

    return (
        <Box maw={800} mx="auto" p="xl">
            <Title order={2} mb="lg">
                {quiz.title}
            </Title>

            <Box mb="md">
                <Title order={4} c={elapsedTime >= timeLimitInSeconds - 60 ? 'red' : undefined}>
                    Time Remaining: {formatDuration(Math.max(0, timeLimitInSeconds - elapsedTime))}
                </Title>
            </Box>

            <form onSubmit={form.onSubmit(handleSubmit)} onChange={handleFormChange}>
                <Stack>
                    {quiz.questions.map((question, index) => (
                        <Card key={question.id} withBorder padding="md">
                            <QuestionItem question={question} index={index} form={form} />
                        </Card>
                    ))}
                    <Button type="submit" size="lg" loading={isSubmitting}>
                        Submit Quiz
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}
