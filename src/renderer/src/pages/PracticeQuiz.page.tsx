import { Box, Button, Card, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useActiveQuiz } from '@renderer/hooks/use-active-quiz'
import { useNavigate } from '@tanstack/react-router'
import { FormEvent, useCallback, useState } from 'react'
import { Question, Quiz } from '../types/quiz-view-types'

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
    const { setActiveQuizState } = useActiveQuiz()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useForm<Record<string, string>>({
        initialValues: quiz.questions.reduce(
            (acc, question) => ({
                ...acc,
                [`question_${question.id}`]: '',
            }),
            {}
        ),
    })

    const handleSubmit = useCallback(
        (_values: Record<string, string>, event: React.FormEvent<HTMLFormElement> | undefined) => {
            setIsSubmitting(true)
            event?.preventDefault()

            // Update active quiz state with end time
            setActiveQuizState((prev) => ({
                ...prev,
                endTime: new Date().toISOString(),
            }))

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
            const responses = quiz.questions.map(
                (question) => form.values[`question_${question.id}`] || ''
            )

            setActiveQuizState({
                quiz, // Include the full quiz object
                questions: quiz.questions,
                studentResponses: responses,
                startTime: new Date().toISOString(),
            })
        },
        [setActiveQuizState, quiz]
    )

    return (
        <Box maw={800} mx="auto" p="xl">
            <Title order={2} mb="lg">
                {quiz.title}
            </Title>

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
