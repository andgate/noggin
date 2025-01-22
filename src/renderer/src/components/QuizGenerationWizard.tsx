import { Button, Card, Group, List, NumberInput, Stack, Switch, Text } from '@mantine/core'
import { Question, Quiz } from '@noggin/types/quiz-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useQuizGenerator } from '@renderer/app/hooks/use-quiz-generator'
import { useEffect, useState } from 'react'
import { RainbowWrapper } from './RainbowWrapper'

interface QuizGenerationWizardProps {
    sources: string[]
    moduleSlug: string
    onComplete: (quiz: Quiz) => void
    onCancel: () => void
}

function QuestionPreview({ question }: { question: Question }) {
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
                        <List.Item key={index}>{choice.optionText}</List.Item>
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
    quiz: Quiz
    onBack: () => void
    onRegenerate: () => void
    onSave: () => void
}) {
    const allQuestions = quiz.questions

    useEffect(() => {
        console.log('Quiz preview:', quiz)
    }, [quiz])

    return (
        <Stack gap="md">
            <Text size="lg" fw={500}>
                Quiz Preview
            </Text>

            <Text size="sm" c="dimmed">
                Generated {quiz.questions.length} questions
                {` (${quiz.questions.filter((q) => q.questionType === 'multiple_choice').length} multiple choice, `}
                {`${quiz.questions.filter((q) => q.questionType === 'written').length} written response)`}
            </Text>

            <Stack gap="xs">
                {allQuestions.map((question, index) => (
                    <QuestionPreview key={index} question={question} />
                ))}
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

export function QuizGenerationWizard({
    sources,
    moduleSlug,
    onComplete,
    onCancel,
}: QuizGenerationWizardProps) {
    const [stage, setStage] = useState<'config' | 'preview'>('config')
    const [numQuestions, setNumQuestions] = useState(10)
    const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true)
    const [includeWritten, setIncludeWritten] = useState(true)
    const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const { generateQuiz } = useQuizGenerator()
    const { saveModuleQuiz } = useModule()

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

    const handleSaveQuiz = async (quiz: Quiz) => {
        if (!quiz.title || !quiz.questions) {
            throw new Error('Invalid quiz data')
        }

        await saveModuleQuiz(moduleSlug, quiz)
        onComplete(quiz)
    }

    if (stage === 'preview' && generatedQuiz) {
        return (
            <PreviewView
                quiz={generatedQuiz}
                onBack={() => setStage('config')}
                onRegenerate={handleGenerate}
                onSave={() => handleSaveQuiz(generatedQuiz)}
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
