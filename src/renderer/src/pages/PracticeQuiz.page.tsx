// TODO quiz timer for practice quiz
import { Box, Button, Card, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useInterval } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useActiveQuiz } from '@renderer/hooks/use-active-quiz'
import { useNavigate } from '@tanstack/react-router'
import { produce } from 'immer'
import { debounce } from 'lodash'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Question, Quiz } from '../types/quiz-view-types'

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

interface MultiChoiceQuestionItemProps {
    question: Extract<Question, { questionType: 'multiple_choice' }>
    questionLabel: string
    form: ReturnType<typeof useForm>
}

// Component for multiple choice questions
const MultiChoiceQuestionItem: React.FC<MultiChoiceQuestionItemProps> = ({
    question,
    questionLabel,
    form,
}: MultiChoiceQuestionItemProps) => {
    const inputProps = form.getInputProps(`question_${question.id}`)

    return (
        <Box mb="md">
            <Radio.Group
                {...inputProps}
                key={form.key(`question_${question.id}`)}
                label={questionLabel}
                size="md"
            >
                <Stack p="md">
                    {question.choices.map((choice) => (
                        <Card
                            key={choice.id}
                            withBorder
                            padding="sm"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                                form.setFieldValue(`question_${question.id}`, choice.optionText)
                            }
                        >
                            <Radio
                                value={choice.optionText}
                                label={choice.optionText}
                                checked={
                                    form.values[`question_${question.id}`] === choice.optionText
                                }
                                styles={{
                                    radio: { cursor: 'pointer' },
                                    label: { cursor: 'pointer' },
                                }}
                                readOnly
                            />
                        </Card>
                    ))}
                </Stack>
            </Radio.Group>
        </Box>
    )
}

// Component for written questions
const WrittenQuestionItem: React.FC<{
    question: Extract<Question, { questionType: 'written' }>
    questionLabel: string
    form: ReturnType<typeof useForm>
}> = ({ question, questionLabel, form }) => (
    <Box mb="md">
        {/* <Title order={4} mb="xs">
            {questionLabel}
        </Title> */}
        <Textarea
            {...form.getInputProps(`question_${question.id}`)}
            key={form.key(`question_${question.id}`)}
            size="md"
            p="md"
            autosize
            minRows={4}
            maxRows={10}
            label={questionLabel}
            description="Respond to the question in the space provided."
            placeholder="Type your answer here..."
        />
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
        mode: 'uncontrolled',
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
        debounce((event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()

            // Map form values to responses array using getValues
            const formValues = form.getValues()
            const formResponses = quiz.questions.map(
                (question) => formValues[`question_${question.id}`] || ''
            )

            setStudentResponses(formResponses)

            setActiveQuizState((prev) =>
                produce(prev, (draft) => {
                    draft.questions = quiz.questions
                    draft.studentResponses = formResponses
                })
            )
        }, 300),
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
