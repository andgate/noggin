import { Box, Button, Card, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Question, Quiz } from '@noggin/types/quiz-types'
import { useActiveQuiz } from '@renderer/hooks/use-active-quiz'
import { debounce } from 'lodash'
import { FormEvent, useCallback, useEffect, useMemo } from 'react'

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

// TODO: Add progress tracker (display completed/remaining questions) (progress bar??)
// TODO: Add keyboard navigation support
// TODO: Add accessibility attributes to form elements
// TODO: Implement progressive loading for large quizzes
export const PracticeQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const quizId = useMemo(() => quiz.id, [quiz.id])
    const {
        isQuizInProgress,
        quizId: activeQuizId,
        activeQuizState,
        startQuiz,
        endQuiz,
        setStudentResponses,
    } = useActiveQuiz()

    const form = useForm<Record<string, string>>({
        mode: 'uncontrolled',
        initialValues: quiz.questions.reduce(
            (acc, question, index) => ({
                ...acc,
                [`question_${question.id}`]:
                    // Load existing responses if this is the active quiz
                    isQuizInProgress && quizId === activeQuizId
                        ? activeQuizState.studentResponses[index] || ''
                        : '',
            }),
            {}
        ),
    })

    // On mount, set the active quiz state
    useEffect(() => {
        if (!isQuizInProgress || quizId !== activeQuizId) {
            startQuiz(quiz)
        }
    }, [])

    const handleSubmit = useCallback(
        (_values: Record<string, string>, event: React.FormEvent<HTMLFormElement> | undefined) => {
            event?.preventDefault()

            // Update active quiz state with end time
            endQuiz()
        },
        [endQuiz]
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
        }, 300),
        [quiz, setStudentResponses]
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
                    <Button type="submit" size="lg">
                        Submit Quiz
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}
