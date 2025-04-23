import {
  useCreateQuestions,
  useCreateQuiz,
  type CreateQuestionsHookInput,
} from '@/core/hooks/useQuizHooks'
import type { Question } from '@/core/types/question.types'
import type { Quiz } from '@/core/types/quiz.types'
import {
  Alert,
  Button,
  Card,
  Group,
  List,
  LoadingOverlay,
  NumberInput,
  Stack,
  Switch,
  Text,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { generateQuiz } from './api/generate-quiz.api'
import type { GeneratedQuestion, GeneratedQuiz } from './types/generated-quiz.types'

type TransformedQuestionInput = CreateQuestionsHookInput['questionsData'][number]

export interface QuizGenerationWizardProps {
  sources: string[]
  moduleId: string
  onComplete: (quiz: Quiz) => void // Expect the Quiz View Type here
  onCancel: () => void
}

// QuestionPreview remains the same...
function QuestionPreview({ question }: { question: GeneratedQuestion }) {
  return (
    <Card withBorder shadow="sm" radius="md" mb="xs">
      <Text size="sm" c="dimmed">
        {question.questionType === 'multiple_choice' ? 'Multiple Choice' : 'Written Response'}
      </Text>
      <Text>{question.question}</Text>
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

// ConfigurationView remains the same...
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
        <Button variant="subtle" onClick={onCancel} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          loading={isGenerating}
          disabled={(!includeMultipleChoice && !includeWritten) || isGenerating}
          onClick={onGenerate}
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </Group>
    </Stack>
  )
}

// PreviewView remains the same...
function PreviewView({
  quizData,
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
  const allQuestions: GeneratedQuestion[] = [
    ...(quizData.multipleChoiceQuestions || []),
    ...(quizData.writtenQuestions || []),
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
        {` (${quizData.multipleChoiceQuestions?.length ?? 0} multiple choice, `}
        {`${quizData.writtenQuestions?.length ?? 0} written response)`}
      </Text>

      <Stack gap="xs" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const createQuizMutation = useCreateQuiz()
  const createQuestionsMutation = useCreateQuestions()

  const isSaving = createQuizMutation.isPending || createQuestionsMutation.isPending

  const handleGenerate = useCallback(async () => {
    if (!includeMultipleChoice && !includeWritten) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one question type.',
        color: 'red',
      })
      return
    }
    if (sources.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'No source content provided for quiz generation.',
        color: 'red',
      })
      return
    }

    setIsGenerating(true)
    setAiError(null)
    setGeneratedQuizData(null)

    try {
      const quizData = await aiService.generateQuiz({
        sources,
        numQuestions,
        includeMultipleChoice,
        includeWritten,
      })
      setGeneratedQuizData(quizData)
      setStage('preview')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not generate quiz.'
      console.error('Failed to generate quiz:', error)
      setAiError(errorMessage)
      notifications.show({
        title: 'Generation Failed',
        message: errorMessage,
        color: 'red',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [sources, numQuestions, includeMultipleChoice, includeWritten])

  // Update the return type of this function
  const transformGeneratedQuestions = useCallback(
    (quiz: GeneratedQuiz): TransformedQuestionInput[] => {
      let sequence = 0
      const mcQuestions = (quiz.multipleChoiceQuestions || []).map((q) => {
        sequence++
        // This object structure matches CreateQuestionInput (which omits id, user_id, quiz_id, updated_at)
        return {
          question_text: q.question,
          question_type: q.questionType,
          choices: JSON.stringify(q.choices.map((c) => c.text)),
          correct_answer_text: null,
          sequence_order: sequence,
        }
      })
      const writtenQuestions = (quiz.writtenQuestions || []).map((q) => {
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
    },
    []
  )

  const handleSaveQuiz = useCallback(async () => {
    if (!generatedQuizData) {
      notifications.show({
        title: 'Error',
        message: 'No generated quiz data to save.',
        color: 'red',
      })
      return
    }

    try {
      const newQuiz = await createQuizMutation.mutateAsync({
        moduleId: moduleId,
        quizData: { title: generatedQuizData.title },
      })

      if (!newQuiz) {
        throw new Error('Failed to create quiz entry.')
      }

      const questionsToInsert = transformGeneratedQuestions(generatedQuizData)
      let savedQuestions: Question[] | null = []

      if (questionsToInsert.length > 0) {
        savedQuestions = await createQuestionsMutation.mutateAsync({
          quizId: newQuiz.id,
          questionsData: questionsToInsert,
        })
        if (!savedQuestions) {
          console.warn('Question creation mutation succeeded but returned null/empty.')
          savedQuestions = []
        }
      } else {
        console.warn('Generated quiz has no questions to save.')
        savedQuestions = []
      }

      const completeQuizData: Quiz = {
        ...newQuiz,
        questions: savedQuestions, // Assign the saved questions (guaranteed to be Question[])
        submissions: [],
      }
      onComplete(completeQuizData)
    } catch (error) {
      console.error('Failed to save quiz:', error)
      notifications.show({
        title: 'Save Failed',
        message: error instanceof Error ? error.message : 'Could not save quiz.',
        color: 'red',
      })
    }
  }, [
    generatedQuizData,
    moduleId,
    createQuizMutation,
    createQuestionsMutation,
    transformGeneratedQuestions,
    onComplete,
  ])

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isGenerating} overlayProps={{ radius: 'sm', blur: 2 }} />
      {aiError && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Generation Error"
          color="red"
          withCloseButton
          onClose={() => setAiError(null)}
          mb="md"
        >
          {aiError} - Please adjust settings or try again.
        </Alert>
      )}
      {stage === 'preview' && generatedQuizData ? (
        <PreviewView
          quizData={generatedQuizData}
          onBack={() => setStage('config')}
          onRegenerate={handleGenerate}
          onSave={handleSaveQuiz}
          isSaving={isSaving}
          isRegenerating={isGenerating}
        />
      ) : (
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
      )}
    </div>
  )
}
