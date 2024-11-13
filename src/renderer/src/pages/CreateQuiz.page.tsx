import {
    Box,
    Button,
    Card,
    Group,
    MultiSelect,
    NumberInput,
    Stack,
    Textarea,
    Title,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useHover } from '@mantine/hooks'
import { QuestionType } from '@noggin/types/quiz-types'
import { RainbowWrapper } from '@renderer/components/RainbowWrapper'
import { useQuizGenerator } from '@renderer/hooks/use-quiz-generator'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { QuizGenerator, QuizGeneratorHandle } from '../components/QuizGenerator'

function countWords(content: string) {
    return content.split(/\s+/).filter(Boolean).length
}

export const QuizFormSchema = z.object({
    content: z
        .string()
        .min(1, 'Please enter study content')
        .refine((content) => countWords(content) <= 6000, {
            message: 'Content cannot exceed 6000 words',
        }),
    questionCount: z
        .number()
        .min(1, 'Must have at least 1 question')
        .max(50, 'Maximum 50 questions allowed'),
    questionTypes: z
        .array(z.enum(['multiple-choice', 'written']))
        .min(1, 'Select at least one question type'),
    timeLimit: z
        .number()
        .min(0, 'Time limit cannot be negative')
        .max(180, 'Maximum time limit is 180 minutes'),
})

// TODO: Implement partial form saving to prevent data loss
// TODO: Add detailed error states for API/generation failures
// TODO: Add fallback UI for when OpenAI is unavailable
export const CreateQuizPage: React.FC = () => {
    const [showGenerator, setShowGenerator] = useState(false)
    const quizGeneratorRef = useRef<QuizGeneratorHandle>(null)
    const { isQuizGeneratorRunning, isQuizGeneratorDone } = useQuizGenerator()
    const { hovered: generateButtonHovered, ref: generateButtonRef } = useHover()
    const [isRainbowPlaying, setIsRainbowPlaying] = useState(true)
    const [isRainbowVisible, setIsRainbowVisible] = useState(false)

    const form = useForm({
        initialValues: {
            content: '',
            questionCount: 4,
            questionTypes: ['multiple-choice', 'written'],
            timeLimit: 10,
        },
        validate: zodResolver(QuizFormSchema),
    })

    const handleSubmit = () => {
        if (!showGenerator) {
            setShowGenerator(true)
        }
        quizGeneratorRef.current?.run()
    }

    // useEffect(() => {
    //     if (
    //         isQuizGeneratorRunning &&
    //         !isQuizGeneratorDone &&
    //         !(isRainbowPlaying || isRainbowVisible)
    //     ) {
    //         console.log('Quiz started, showing rainbow effect')
    //         setIsRainbowPlaying(true)
    //         setIsRainbowVisible(true)
    //     }
    // }, [
    //     isQuizGeneratorRunning,
    //     isQuizGeneratorDone,
    //     isRainbowPlaying,
    //     isRainbowVisible,
    //     setIsRainbowPlaying,
    //     setIsRainbowVisible,
    // ])

    // useEffect(() => {
    //     if (
    //         !generateButtonHovered &&
    //         isQuizGeneratorDone &&
    //         (isRainbowPlaying || isRainbowVisible)
    //     ) {
    //         console.log('Quiz ended, hiding rainbow effect')
    //         setIsRainbowPlaying(false)
    //         setIsRainbowVisible(false)
    //     }
    // }, [generateButtonHovered, setIsRainbowPlaying, setIsRainbowVisible])

    useEffect(() => {
        if (generateButtonHovered || isQuizGeneratorRunning) {
            setIsRainbowPlaying(true)
            setIsRainbowVisible(true)
        } else if (!generateButtonHovered || isQuizGeneratorDone) {
            setIsRainbowPlaying(false)
            setIsRainbowVisible(false)
        }
    }, [
        generateButtonHovered,
        isQuizGeneratorRunning,
        isQuizGeneratorDone,
        setIsRainbowPlaying,
        setIsRainbowVisible,
    ])

    return (
        <Box maw={1200} mx="auto" p="md">
            <Card withBorder>
                <Stack>
                    <Title order={2}>Create New Quiz</Title>

                    <Group align="flex-start" gap="xl">
                        <Box style={{ flex: 1 }}>
                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack>
                                    <Textarea
                                        label="Study Content"
                                        placeholder="Paste your study material here"
                                        rows={10}
                                        description={`Word count: ${countWords(form.values.content)} / 6000`}
                                        {...form.getInputProps('content')}
                                    />

                                    <Group grow>
                                        <NumberInput
                                            label="Number of Questions"
                                            min={1}
                                            max={50}
                                            {...form.getInputProps('questionCount')}
                                        />

                                        <MultiSelect
                                            label="Question Types"
                                            data={[
                                                {
                                                    label: 'Multiple Choice',
                                                    value: 'multiple-choice',
                                                },
                                                {
                                                    label: 'Written Answer',
                                                    value: 'written',
                                                },
                                            ]}
                                            {...form.getInputProps('questionTypes')}
                                        />

                                        <NumberInput
                                            label="Time Limit (minutes)"
                                            description="0 for no limit"
                                            min={0}
                                            max={180}
                                            {...form.getInputProps('timeLimit')}
                                        />
                                    </Group>

                                    <Group justify="flex-end">
                                        <div ref={generateButtonRef}>
                                            <RainbowWrapper
                                                isPlaying={isRainbowPlaying}
                                                isVisible={isRainbowVisible}
                                            >
                                                <Button
                                                    variant="gradient"
                                                    gradient={{
                                                        from: 'teal',
                                                        to: 'grape',
                                                        deg: 48,
                                                    }}
                                                    type="submit"
                                                >
                                                    Generate Quiz
                                                </Button>
                                            </RainbowWrapper>
                                        </div>
                                    </Group>
                                </Stack>
                            </form>
                        </Box>

                        <Box style={{ flex: 1 }}>
                            <QuizGenerator
                                ref={quizGeneratorRef}
                                show={showGenerator}
                                questionCount={form.values.questionCount}
                                questionTypes={form.values.questionTypes as QuestionType[]}
                                sources={[form.values.content]}
                                timeLimit={form.values.timeLimit}
                            />
                        </Box>
                    </Group>
                </Stack>
            </Card>
        </Box>
    )
}

export default CreateQuizPage
