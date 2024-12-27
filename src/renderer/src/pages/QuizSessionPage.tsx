import { Box, Button, Card, Group, Radio, Stack, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Question, Quiz, submissionSchema } from '@noggin/types/quiz-types'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { useModule } from '../hooks/use-module'

interface QuizSessionPageProps {
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

export function QuizSessionPage({ moduleId, quiz }: QuizSessionPageProps) {
    const navigate = useNavigate()
    const module = useModule()
    const [startTime] = useState(() => new Date())

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

            const submission = submissionSchema.parse({
                quizId: quiz.id,
                attemptNumber: (await module.getQuizAttemptCount(moduleId, quiz.id)) + 1,
                completedAt: new Date().toISOString(),
                quizTitle: quiz.title,
                timeElapsed,
                timeLimit: quiz.timeLimit,
                responses: formattedResponses,
                status: 'pending' as const,
            })

            await module.saveModuleSubmission(moduleId, submission)
            navigate({ to: '/quiz/view/$moduleId/$quizId', params: { moduleId, quizId: quiz.id } })
        },
        [moduleId, quiz, startTime, navigate, module]
    )

    const handleQuit = useCallback(() => {
        const confirmed = window.confirm(
            'Are you sure you want to quit? Your progress will be lost.'
        )
        if (confirmed) {
            navigate({ to: '/' })
        }
    }, [navigate])

    return (
        <Box maw={800} mx="auto" p="xl">
            <Title order={2} mb="lg">
                {quiz.title}
            </Title>

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
                    <Group justify="space-between">
                        <Button variant="light" color="red" onClick={handleQuit}>
                            Quit Quiz
                        </Button>
                        <Button type="submit" size="lg">
                            Submit Quiz
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    )
}
