import { Button, Card, Group, List, NumberInput, Stack, Switch, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useGenerateQuiz } from '@noggin/hooks/useAiHooks'
import { useCreateQuestions, useCreateQuiz } from '@noggin/hooks/useQuizHooks'
import type { Tables, TablesInsert } from '@noggin/types/database.types'
import type {
  GeneratedChoice,
  GeneratedQuestion,
  GeneratedQuiz,
} from '@noggin/types/quiz-generation-types'
import { useEffect, useState } from 'react'
import { RainbowWrapper } from './RainbowWrapper'

// Define DB types
type DbQuiz = Tables<'quizzes'>
type DbQuestionInsert = TablesInsert<'questions'>

export interface QuizGenerationWizardProps {
  sources: string[]
  moduleId: string
  onComplete: (quiz: DbQuiz) => void
  onCancel: () => void
}

// Updated QuestionPreview to handle the discriminated union type
function QuestionPreview({ question }: { question: GeneratedQuestion }) {
  return (
    <Card withBorder shadow="sm" radius="md" mb="xs">
      <Text size="sm" c="dimmed">
        {question.questionType === 'multiple_choice' ? 'Multiple Choice' : 'Written Response'}
      </Text>
      <Text>{question.question}</Text>
      {/* Conditionally render choices only for multiple_choice */}
      {question.questionType === 'multiple_choice' &&
        question.choices &&
        question.choices.length > 0 && (
          <List size="sm" mt="xs">
            {question.choices.map((choice: GeneratedChoice, index: number) => (
              <List.Item key={index}>{choice.text}</List.Item>
            ))}
          </List>
        )}
    </Card>
  )
}

// ConfigurationView remains the same
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
        max={20} // Example max
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
            disabled={(!includeMultipleChoice && !includeWritten) || isGenerating}
            onClick={onGenerate}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </RainbowWrapper>
      </Group>
    </Stack>
  )
}

// Updated PreviewView to handle GeneratedQuiz structure
function PreviewView({
  quizData, // Expect GeneratedQuiz type
  onBack,
  onRegenerate,
  onSave,
  isSaving,
  isRegenerating,
}: {
  quizData: GeneratedQuiz
  onBack: () => void
  onRegenerate: () => void
  onSave: () => void
  isSaving: boolean
  isRegenerating: boolean
}) {
  // Combine both question arrays for preview
  const allQuestions: GeneratedQuestion[] = [
    ...quizData.multipleChoiceQuestions,
    ...quizData.writtenQuestions,
  ]

  useEffect(() => {
    console.log('Quiz preview data:', quizData)
  }, [quizData])

  return (
    <Stack gap="md">
      <Text size="lg" fw={500}>
        Quiz Preview: {quizData.title}
      </Text>

      <Text size="sm" c="dimmed">
        Generated {allQuestions.length} questions
        {` (${quizData.multipleChoiceQuestions.length} multiple choice, `}
        {`${quizData.writtenQuestions.length} written response)`}
      </Text>

      <Stack gap="xs" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* Iterate over the combined array */}
        {allQuestions.map((question, index) => (
          <QuestionPreview key={`${question.questionType}-${index}`} question={question} />
        ))}
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onBack} disabled={isSaving || isRegenerating}>
          Back
        </Button>
        <Button variant="light" onClick={onRegenerate} loading={isRegenerating} disabled={isSaving}>
          Regenerate
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
          onClick={onSave}
          loading={isSaving}
          disabled={isRegenerating}
        >
          {isSaving ? 'Saving...' : 'Save Quiz'}
        </Button>
      </Group>
    </Stack>
  )
}

export function QuizGenerationWizard({
  sources,
  moduleId,
  onComplete,
  onCancel,
}: QuizGenerationWizardProps) {
  const [stage, setStage] = useState<'config' | 'preview'>('config')
  const [numQuestions, setNumQuestions] = useState(10)
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true)
  const [includeWritten, setIncludeWritten] = useState(true)
  const [generatedQuizData, setGeneratedQuizData] = useState<GeneratedQuiz | null>(null)

  const generateQuizMutation = useGenerateQuiz()
  const createQuizMutation = useCreateQuiz()
  const createQuestionsMutation = useCreateQuestions()

  const handleGenerate = async () => {
    if (!includeMultipleChoice && !includeWritten) return

    setGeneratedQuizData(null)
    try {
      const quizData = await generateQuizMutation.mutateAsync({
        sources,
        numQuestions,
        includeMultipleChoice,
        includeWritten,
        moduleId,
      })
      setGeneratedQuizData(quizData)
      setStage('preview')
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      notifications.show({
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Could not generate quiz.',
        color: 'red',
      })
    }
  }

  const transformGeneratedQuestions = (
    quiz: GeneratedQuiz
  ): Omit<DbQuestionInsert, 'quiz_id' | 'user_id'>[] => {
    let sequence = 0
    const mcQuestions = quiz.multipleChoiceQuestions.map((q) => {
      sequence++
      return {
        question_text: q.question,
        question_type: q.questionType,
        choices: JSON.stringify(q.choices.map((c) => c.text)),
        correct_answer_text: null,
        sequence_order: sequence,
      }
    })
    const writtenQuestions = quiz.writtenQuestions.map((q) => {
      sequence++
      return {
        question_text: q.question,
        question_type: q.questionType,
        choices: null,
        correct_answer_text: null,
        sequence_order: sequence,
      }
    })

    return [...mcQuestions, ...writtenQuestions]
  }

  const handleSaveQuiz = async () => {
    if (!generatedQuizData) return

    try {
      // 1. Create the Quiz entry
      const newQuiz = await createQuizMutation.mutateAsync({
        moduleId: moduleId,
        quizData: { title: generatedQuizData.title },
      })

      if (!newQuiz) {
        throw new Error('Failed to create quiz entry.')
      }

      // 2. Transform and Create the Questions
      const questionsToInsert = transformGeneratedQuestions(generatedQuizData)
      if (questionsToInsert.length > 0) {
        await createQuestionsMutation.mutateAsync({
          quizId: newQuiz.id,
          questionsData: questionsToInsert,
        })
      }

      // 3. Call onComplete
      onComplete(newQuiz)
    } catch (error) {
      console.error('Failed to save quiz:', error)
      notifications.show({
        title: 'Save Failed',
        message: error instanceof Error ? error.message : 'Could not save quiz.',
        color: 'red',
      })
    }
  }

  const isSaving = createQuizMutation.isPending || createQuestionsMutation.isPending

  if (stage === 'preview' && generatedQuizData) {
    return (
      <PreviewView
        quizData={generatedQuizData}
        onBack={() => setStage('config')}
        onRegenerate={handleGenerate}
        onSave={handleSaveQuiz}
        isSaving={isSaving}
        isRegenerating={generateQuizMutation.isPending}
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
      isGenerating={generateQuizMutation.isPending}
    />
  )
}
