import { Alert, Box, Button, Card, Group, Radio, Stack, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCreateResponses, useCreateSubmission } from '@noggin//hooks/useSubmissionHooks'
import { useGetUserProfile } from '@noggin/hooks/useUserHooks'
import type { Tables, TablesInsert } from '@noggin/types/database.types'
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { QuizSessionHeader } from './components/QuizSessionHeader'

// --- Define DB types locally ---
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>
type ResponseInsert = TablesInsert<'responses'>
// --- ---

// Define the structure expected for choices within DbQuestion JSON
interface ChoiceOption {
  optionText: string
}

interface QuizSessionPageProps {
  moduleId: string
  quiz: DbQuiz
  questions: DbQuestion[]
}

const QuestionCard: React.FC<{
  question: DbQuestion
  index: number
  value: string
  onChange: (value: string) => void
}> = ({ question, index, value, onChange }) => {
  const questionLabel = `${index + 1}. ${question.question_text}`

  let choices: ChoiceOption[] = []
  if (question.question_type === 'multiple_choice' && question.choices) {
    try {
      const parsedChoices = JSON.parse(question.choices as string)
      if (Array.isArray(parsedChoices)) {
        choices = parsedChoices.filter(
          (choice): choice is ChoiceOption => typeof choice?.optionText === 'string'
        )
      }
    } catch (error) {
      console.error('Failed to parse question choices:', error)
      return (
        <Card withBorder padding="md">
          <Alert color="red" title="Error">
            Could not load choices for question {index + 1}.
          </Alert>
        </Card>
      )
    }
  }

  if (question.question_type === 'multiple_choice') {
    return (
      <Card withBorder padding="md">
        <Radio.Group label={questionLabel} value={value} onChange={onChange} size="md">
          <Stack p="md">
            {choices.map((choice) => (
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

export function QuizSessionPage({ moduleId, quiz, questions }: QuizSessionPageProps) {
  const navigate = useNavigate()
  const [startTime] = useState(() => new Date())
  const { data: userProfile } = useGetUserProfile()
  const currentUserId = userProfile?.user_id

  const createSubmissionMutation = useCreateSubmission()
  const createResponsesMutation = useCreateResponses()

  const form = useForm({
    initialValues: questions.reduce(
      (acc, question) => ({ ...acc, [question.id]: '' }),
      {} as Record<string, string>
    ),
  })

  const handleSubmit = useCallback(
    async (values: Record<string, string>) => {
      // Check if user ID is available before submitting
      if (!currentUserId) {
        console.error('User ID not available. Cannot submit quiz.')
        // TODO: Show user notification about auth issue
        return
      }

      const timeElapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      const quizId = quiz.id

      createSubmissionMutation.mutate(
        {
          moduleId,
          quizId,
          submissionData: {
            module_id: moduleId,
            quiz_id: quizId,
            time_elapsed_seconds: timeElapsedSeconds,
            submitted_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: (newSubmission: DbSubmission | null) => {
            if (!newSubmission) {
              console.error('Submission creation failed.')
              return
            }

            console.log('Submission created:', newSubmission)
            const submissionId = newSubmission.id
            const attemptNumber = newSubmission.attempt_number

            const formattedResponses: ResponseInsert[] = questions.map((question) => ({
              submission_id: submissionId,
              question_id: question.id,
              student_answer_text: values[question.id] || '',
              user_id: currentUserId,
            }))

            createResponsesMutation.mutate(
              { submissionId: submissionId, responsesData: formattedResponses },
              {
                onSuccess: (newResponses) => {
                  console.log('Responses created:', newResponses)
                  navigate({
                    to: '/submission/$moduleId/$quizId/$attempt',
                    params: {
                      moduleId,
                      quizId: quizId,
                      attempt: attemptNumber.toString(),
                    },
                  })
                },
                onError: (error) => {
                  console.error('Error creating responses:', error)
                },
              }
            )
          },
          onError: (error) => {
            console.error('Error creating submission:', error)
          },
        }
      )
    },
    [
      moduleId,
      quiz.id,
      questions,
      startTime,
      navigate,
      createSubmissionMutation,
      createResponsesMutation,
      currentUserId,
    ]
  )

  const isSubmitting = createSubmissionMutation.isPending || createResponsesMutation.isPending
  const submissionError = createSubmissionMutation.error || createResponsesMutation.error

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <QuizSessionHeader
        title={`Quiz: ${quiz.title}`}
        onExit={() => {
          const confirmed = window.confirm(
            'Are you sure you want to exit this quiz? Your progress will not be saved.'
          )
          if (confirmed) {
            navigate({
              to: '/quiz/view/$moduleId/$quizId',
              params: { moduleId, quizId: quiz.id },
            })
          }
        }}
      />

      <Box p="xl" style={{ flex: 1, overflow: 'auto' }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {submissionError && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Submission Error"
                color="red"
                withCloseButton
                onClose={() => {
                  createSubmissionMutation.reset()
                  createResponsesMutation.reset()
                }}
              >
                Failed to submit quiz: {submissionError.message}
              </Alert>
            )}
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                value={form.values[question.id]}
                onChange={(value) => form.setFieldValue(question.id, value)}
              />
            ))}
            <Group justify="flex-end">
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting || !currentUserId}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
