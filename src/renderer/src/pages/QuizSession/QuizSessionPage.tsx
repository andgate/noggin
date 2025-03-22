import { Box, Button, Card, Group, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Question, Quiz, submissionSchema } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { QuizSessionHeader } from './components/QuizSessionHeader'

interface QuizSessionPageProps {
    libraryId: string
    moduleId: string
    quiz: Quiz
}

const QuestionCard: React.FC<{
    question: Question
    index: number
    value: string
    onChange: (value: string) => void
}> = ({ question, index, value, onChange }) => {
    const questionLabel = `${index + 1}. ${question.question}`

    if (question.questionType === 'multiple_choice') {
        return (
            <Card withBorder padding="md">
                <Radio.Group label={questionLabel} value={value} onChange={onChange} size="md">
                    <Stack p="md">
                        {question.choices.map((choice) => (
                            <Card
                                key={choice.optionText}
                                withBorder
                                padding="sm"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onChange(choice.optionText)}
                            >
                                <Radio
                                    value={choice.optionText}
                                    label={choice.optionText}
                                    styles={{
                                        radio: { cursor: 'pointer' },
                                        label: { cursor: 'pointer' },
                                    }}
                                />
                            </Card>
                        ))}
                    </Stack>
                </Radio.Group>
            </Card>
        )
    }

    return (
        <Card withBorder padding="md">
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={questionLabel}
                description="Respond to the question in the space provided."
                placeholder="Type your answer here..."
                autosize
                minRows={4}
                maxRows={10}
                size="md"
            />
        </Card>
    )
}

export function QuizSessionPage({ libraryId, moduleId, quiz }: QuizSessionPageProps) {
    const navigate = useNavigate()
    const module = useModule()
    const [startTime] = useState(() => new Date())

    if (!libraryId) {
        throw new Error('Library ID is required')
    }

    const form = useForm({
        initialValues: quiz.questions.reduce(
            (acc, _, index) => ({ ...acc, [index.toString()]: '' }),
            {} as Record<string, string>
        ),
    })

    // Save responses periodically
    useEffect(() => {
        const saveInterval = setInterval(() => {
            // TODO: Implement autosave logic
            console.log('Autosaving responses:', form.values)
        }, 30000) // Every 30 seconds

        return () => clearInterval(saveInterval)
    }, [form.values])

    const handleSubmit = useCallback(
        async (values: Record<string, string>) => {
            const timeElapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)

            const formattedResponses = quiz.questions.map((question, index) => ({
                createdAt: new Date().toISOString(),
                quizId: quiz.id,
                submissionId: 0,
                question,
                studentAnswer: values[index.toString()] || '',
                status: 'pending' as const,
            }))

            const lastAttempt = await module.getQuizAttemptCount(libraryId, moduleId, quiz.id)

            const submission = submissionSchema.parse({
                quizId: quiz.id,
                attemptNumber: lastAttempt + 1,
                completedAt: new Date().toISOString(),
                quizTitle: quiz.title,
                timeElapsed,
                timeLimit: quiz.timeLimit,
                libraryId,
                moduleSlug: moduleId,
                responses: formattedResponses,
                status: 'pending' as const,
            })

            await module.saveModuleSubmission(libraryId, moduleId, submission)
            navigate({
                to: '/submission/$libraryId/$moduleId/$quizId/$attempt',
                params: {
                    libraryId,
                    moduleId,
                    quizId: quiz.id,
                    attempt: submission.attemptNumber.toString(),
                },
            })
        },
        [libraryId, moduleId, quiz, startTime, navigate, module]
    )

    return (
        <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
            <QuizSessionHeader
                title={`Quiz: ${quiz.title}`}
                onExit={() => {
                    const confirmed = window.confirm(
                        'Are you sure you want to exit this quiz? Your progress will be lost.'
                    )
                    if (confirmed) {
                        navigate({
                            to: '/quiz/view/$libraryId/$moduleId/$quizId',
                            params: { libraryId, moduleId, quizId: quiz.id },
                        })
                    }
                }}
            />

            <Box p="xl" style={{ flex: 1, overflow: 'auto' }}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        {quiz.questions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                question={question}
                                index={index}
                                value={form.values[index.toString()]}
                                onChange={(value) => form.setFieldValue(index.toString(), value)}
                            />
                        ))}
                        <Group justify="flex-end">
                            <Button type="submit" size="lg">
                                Submit Quiz
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Stack>
    )
}
