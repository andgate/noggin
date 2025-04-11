import { Alert, Box, Button, Card, Group, Radio, Stack, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCreateResponses, useCreateSubmission } from '@noggin//hooks/useSubmissionHooks'
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
  // Add other properties if they exist in your JSON structure
}

interface QuizSessionPageProps {
  libraryId: string // Keep libraryId if needed for navigation or context
  moduleId: string
  quiz: DbQuiz
  questions: DbQuestion[] // Use DbQuestion array
}

const QuestionCard: React.FC<{
  question: DbQuestion // Use DbQuestion type
  index: number
  value: string
  onChange: (value: string) => void
}> = ({ question, index, value, onChange }) => {
  const questionLabel = `${index + 1}. ${question.question_text}` // Use question_text

  // Safely parse choices JSON
  let choices: ChoiceOption[] = []
  if (question.question_type === 'multiple_choice' && question.choices) {
    try {
      // Assuming choices is an array of objects like { optionText: string }
      const parsedChoices = JSON.parse(question.choices as string) // Need to cast if type is Json
      if (Array.isArray(parsedChoices)) {
        choices = parsedChoices.filter(
          (choice): choice is ChoiceOption => typeof choice?.optionText === 'string'
        )
      }
    } catch (error) {
      console.error('Failed to parse question choices:', error)
      // Handle error, maybe show a message or default state
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

  // Assuming 'written' or other types use Textarea
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

// TODO: Implement a way to get the current user ID (e.g., from auth context/hook)
const getCurrentUserId = (): string => {
  console.warn('getCurrentUserId is a placeholder and needs implementation!')
  // Example: return useAuth().user?.id ?? 'unknown-user';
  return 'placeholder-user-id' // Replace with actual user ID retrieval
}

export function QuizSessionPage({ libraryId, moduleId, quiz, questions }: QuizSessionPageProps) {
  const navigate = useNavigate()
  const [startTime] = useState(() => new Date()) // Keep track of start time

  // --- Use Mutation Hooks ---
  const createSubmissionMutation = useCreateSubmission()
  const createResponsesMutation = useCreateResponses()
  // --- ---

  const form = useForm({
    initialValues: questions.reduce(
      (acc, question) => ({ ...acc, [question.id]: '' }), // Use question.id as key
      {} as Record<string, string>
    ),
  })

  const handleSubmit = useCallback(
    async (values: Record<string, string>) => {
      const timeElapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      const quizId = quiz.id // Get quizId from the prop
      const currentUserId = getCurrentUserId() // Get user ID

      // 1. Create the submission record
      createSubmissionMutation.mutate(
        {
          // Pass moduleId and quizId for invalidation purposes if needed by the hook logic
          moduleId,
          quizId,
          // Nest the actual submission data
          submissionData: {
            module_id: moduleId, // Required by TablesInsert<'submissions'>
            quiz_id: quizId, // Required by TablesInsert<'submissions'>
            time_elapsed_seconds: timeElapsedSeconds, // Now correctly nested
            // attempt_number is handled by the backend/hook
            // status is handled by the backend/hook
            // user_id is handled by the backend/hook
          },
        },
        {
          onSuccess: (newSubmission: DbSubmission | null) => {
            if (!newSubmission) {
              console.error('Submission creation failed.')
              // TODO: Add user notification for submission failure
              return
            }

            console.log('Submission created:', newSubmission)
            const submissionId = newSubmission.id
            const attemptNumber = newSubmission.attempt_number // Get attempt number

            // 2. Format responses using the new submission ID
            const formattedResponses: ResponseInsert[] = questions.map((question) => ({
              submission_id: submissionId,
              question_id: question.id,
              student_answer_text: values[question.id] || '',
              user_id: currentUserId,
            }))

            // 3. Create the response records
            createResponsesMutation.mutate(
              { submissionId: submissionId, responsesData: formattedResponses },
              {
                onSuccess: (newResponses) => {
                  console.log('Responses created:', newResponses)
                  // 4. Navigate to the EXISTING submission view page using attempt number
                  navigate({
                    to: '/submission/$libraryId/$moduleId/$quizId/$attempt', // Correct route
                    params: {
                      libraryId,
                      moduleId,
                      quizId: quizId, // Use quizId
                      attempt: attemptNumber.toString(), // Use attempt number from new submission
                    },
                  })
                },
                onError: (error) => {
                  console.error('Error creating responses:', error)
                  // TODO: Add user notification for response creation failure
                },
              }
            )
          },
          onError: (error) => {
            console.error('Error creating submission:', error)
            // TODO: Add user notification for submission creation failure
          },
        }
      )
    },
    [
      libraryId,
      moduleId,
      quiz.id, // Use quiz.id directly
      questions, // Depend on questions array
      startTime,
      navigate,
      createSubmissionMutation,
      createResponsesMutation,
    ]
  )

  // Determine loading/error state from mutations
  const isSubmitting = createSubmissionMutation.isPending || createResponsesMutation.isPending
  const submissionError = createSubmissionMutation.error || createResponsesMutation.error

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <QuizSessionHeader
        title={`Quiz: ${quiz.title}`} // Still valid
        onExit={() => {
          const confirmed = window.confirm(
            'Are you sure you want to exit this quiz? Your progress will not be saved.' // Update warning
          )
          if (confirmed) {
            navigate({
              to: '/quiz/view/$libraryId/$moduleId/$quizId', // Navigate back to view
              params: { libraryId, moduleId, quizId: quiz.id }, // Still valid
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
                }} // Allow dismissing error
              >
                Failed to submit quiz: {submissionError.message}
              </Alert>
            )}
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id} // Use question.id as key
                question={question} // Pass DbQuestion
                index={index}
                value={form.values[question.id]} // Use question.id
                onChange={(value) => form.setFieldValue(question.id, value)} // Use question.id
              />
            ))}
            <Group justify="flex-end">
              <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
