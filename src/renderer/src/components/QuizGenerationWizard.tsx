import { Button, Card, Group, List, NumberInput, Stack, Switch, Text } from '@mantine/core'
import { GeneratedQuestion, PartialGeneratedQuiz } from '@noggin/types/quiz-generation-types'
import { useState } from 'react'
import { useQuizGenerator } from '../hooks/use-quiz-generator'
import { RainbowWrapper } from './RainbowWrapper'

interface QuizGenerationWizardProps {
    sources: string[]
    onComplete: (quiz: PartialGeneratedQuiz) => void
    onCancel: () => void
}

function QuestionPreview({ question }: { question: GeneratedQuestion }) {
    return (
        <Card withBorder shadow="sm" radius="md" mb="xs">
            <Text size="sm" c="dimmed">
                {question.questionType === 'multiple_choice'
                    ? 'Multiple Choice'
                    : 'Written Response'}
            </Text>
            <Text>{question.question}</Text>
            {question.questionType === 'multiple_choice' && (
                <List size="sm" mt="xs">
                    {question.choices.map((choice, index) => (
                        <List.Item key={index}>{choice.text}</List.Item>
                    ))}
                </List>
            )}
        </Card>
    )
}

function ConfigurationView({
    numQuestions,
    setNumQuestions,
    includeMultipleChoice,
    setIncludeMultipleChoice,
    includeWritten,
    setIncludeWritten,
    onGenerate,
    onCancel,
    isGenerating,
}: {
    numQuestions: number
    setNumQuestions: (n: number) => void
    includeMultipleChoice: boolean
    setIncludeMultipleChoice: (b: boolean) => void
    includeWritten: boolean
    setIncludeWritten: (b: boolean) => void
    onGenerate: () => void
    onCancel: () => void
    isGenerating: boolean
}) {
    return (
        <Stack gap="md">
            <Text size="lg" fw={500}>
                Generate Quiz
            </Text>

            <NumberInput
                label="Number of Questions"
                value={numQuestions}
                onChange={(val) => setNumQuestions(Number(val))}
                min={1}
                max={20}
            />

            <Switch
                label="Include Multiple Choice Questions"
                checked={includeMultipleChoice}
                onChange={(e) => setIncludeMultipleChoice(e.currentTarget.checked)}
            />

            <Switch
                label="Include Written Response Questions"
                checked={includeWritten}
                onChange={(e) => setIncludeWritten(e.currentTarget.checked)}
            />

            <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={onCancel}>
                    Cancel
                </Button>
                <RainbowWrapper isPlaying={isGenerating} isVisible={!isGenerating}>
                    <Button
                        loading={isGenerating}
                        disabled={!includeMultipleChoice && !includeWritten}
                        onClick={onGenerate}
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan' }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Quiz'}
                    </Button>
                </RainbowWrapper>
            </Group>
        </Stack>
    )
}

function PreviewView({
    quiz,
    onBack,
    onRegenerate,
    onSave,
}: {
    quiz: PartialGeneratedQuiz
    onBack: () => void
    onRegenerate: () => void
    onSave: () => void
}) {
    const allQuestions = [
        ...(quiz.multipleChoiceQuestions || []),
        ...(quiz.writtenQuestions || []),
    ].filter((q): q is GeneratedQuestion => q !== undefined)

    return (
        <Stack gap="md">
            <Text size="lg" fw={500}>
                Quiz Preview
            </Text>

            <Text size="sm" c="dimmed">
                Generated {allQuestions.length} questions
                {quiz.multipleChoiceQuestions?.length ? ' (including multiple choice)' : ''}
                {quiz.writtenQuestions?.length ? ' (including written response)' : ''}
            </Text>

            <Stack gap="xs">
                {allQuestions.slice(0, 3).map((question, index) => (
                    <QuestionPreview key={index} question={question} />
                ))}
                {allQuestions.length > 3 && (
                    <Text c="dimmed" size="sm" ta="center">
                        ... and {allQuestions.length - 3} more questions
                    </Text>
                )}
            </Stack>

            <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={onBack}>
                    Back
                </Button>
                <Button variant="light" onClick={onRegenerate}>
                    Regenerate
                </Button>
                <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} onClick={onSave}>
                    Save Quiz
                </Button>
            </Group>
        </Stack>
    )
}

export function QuizGenerationWizard({ sources, onComplete, onCancel }: QuizGenerationWizardProps) {
    const [stage, setStage] = useState<'config' | 'preview'>('config')
    const [numQuestions, setNumQuestions] = useState(10)
    const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true)
    const [includeWritten, setIncludeWritten] = useState(true)
    const [generatedQuiz, setGeneratedQuiz] = useState<PartialGeneratedQuiz | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const { generateQuiz } = useQuizGenerator()

    const handleGenerate = async () => {
        if (!includeMultipleChoice && !includeWritten) return

        setIsGenerating(true)
        try {
            const quiz = await generateQuiz({
                sources,
                numQuestions,
                includeMultipleChoice,
                includeWritten,
            })
            setGeneratedQuiz(quiz)
            setStage('preview')
        } catch (error) {
            console.error('Failed to generate quiz:', error)
            // TODO: Add error handling UI
        } finally {
            setIsGenerating(false)
        }
    }

    if (stage === 'preview' && generatedQuiz) {
        return (
            <PreviewView
                quiz={generatedQuiz}
                onBack={() => setStage('config')}
                onRegenerate={handleGenerate}
                onSave={() => onComplete(generatedQuiz)}
            />
        )
    }

    return (
        <ConfigurationView
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            includeMultipleChoice={includeMultipleChoice}
            setIncludeMultipleChoice={setIncludeMultipleChoice}
            includeWritten={includeWritten}
            setIncludeWritten={setIncludeWritten}
            onGenerate={handleGenerate}
            onCancel={onCancel}
            isGenerating={isGenerating}
        />
    )
}
