import { Alert, Button, Container, Group, Loader, Stack } from '@mantine/core'
import { getQuizWithQuestions } from '@noggin/api/quizApi'
import { AppHeader, HeaderAction } from '@noggin/components/layout/AppHeader'
import { quizKeys } from '@noggin/hooks/query-keys'
import { useGradeSubmission } from '@noggin/hooks/useAiHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconAlertCircle } from '@tabler/icons-react'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SubmissionGradeInfo } from './components/SubmissionGradeInfo'
import { SubmissionResponseCard } from './components/SubmissionResponseCard'

type DbResponse = Tables<'responses'>
type DbSubmission = Tables<'submissions'>
type DbQuestion = Tables<'questions'> // Define DbQuestion type
// Define the expected shape returned by getQuizWithQuestions
type QuizWithQuestions = { quiz: Tables<'quizzes'>; questions: DbQuestion[] } | null

interface SubmissionPageProps {
  libraryId: string // Keep libraryId, might be needed by AI hook context?
  moduleId: string // Keep moduleId, might be needed by AI hook context?
  submission: DbSubmission
  responses: DbResponse[]
}

// Define query options locally for fetching quiz + questions
const quizDetailsQueryOptions = (quizId: string) =>
  queryOptions<QuizWithQuestions, Error>({
    queryKey: quizKeys.detailWithQuestions(quizId), // Use existing key
    queryFn: () => getQuizWithQuestions(quizId), // Use API function
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  })

export function SubmissionPage({ submission, responses }: SubmissionPageProps) {
  // Use the correct AI grading hook
  const gradeSubmissionMutation = useGradeSubmission()
  const router = useRouter()
  // Keep isGrading state tied to the mutation's pending state
  const isGrading = gradeSubmissionMutation.isPending

  // Fetch the quiz details (including questions) using the quizId from the submission
  const quizQuery = useQuery(quizDetailsQueryOptions(submission.quiz_id))

  // Define which header actions to enable
  const headerActions: HeaderAction[] = ['explorer', 'settings']

  const handleGradeSubmission = async () => {
    // Ensure we have the questions data before attempting to grade
    if (!quizQuery.data?.questions) {
      console.error('Cannot grade submission: Quiz questions not loaded.')
      // TODO: Show user notification
      return
    }

    // Call the mutate function from the useGradeSubmission hook
    gradeSubmissionMutation.mutate(
      {
        submission: { ...submission, responses }, // Pass submission and explicitly include responses
        questions: quizQuery.data.questions, // Pass the fetched questions
      },
      {
        onSuccess: (gradingResult) => {
          console.log('Grading successful:', gradingResult)
          // Invalidate queries to refetch submission data after grading
          router.invalidate()
          // Optionally, refetch quiz query if grading could somehow affect it (unlikely)
          // quizQuery.refetch();
        },
        onError: (error) => {
          console.error('Failed to grade submission:', error)
          // TODO: Add user-facing error notification
        },
      }
    )
  }

  // Create a map of questions by ID for easy lookup once quiz data is loaded
  const questionsMap = useMemo(() => {
    if (!quizQuery.data?.questions) {
      return new Map<string, DbQuestion>()
    }
    return new Map(quizQuery.data.questions.map((q) => [q.id, q]))
  }, [quizQuery.data?.questions])

  // Handle loading states for quiz data
  if (quizQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" /> <span>Loading Quiz Details...</span>
      </div>
    )
  }

  // Handle error state for quiz data fetching
  if (quizQuery.isError) {
    return (
      <div className="p-4">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          Failed to load quiz details: {quizQuery.error.message}
        </Alert>
      </div>
    )
  }

  // Ensure quiz data is available
  const quizTitle = quizQuery.data?.quiz?.title ?? `Quiz ${submission.quiz_id}`
  const pageTitle = `${quizTitle} - Attempt ${submission.attempt_number}`

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={pageTitle} actions={headerActions} />

      <Container size="md" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <Stack gap="md">
          {/* Display grading error if any */}
          {gradeSubmissionMutation.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Grading Error"
              color="red"
              withCloseButton
              onClose={() => gradeSubmissionMutation.reset()}
            >
              Failed to grade submission: {gradeSubmissionMutation.error.message}
            </Alert>
          )}
          <Group justify="flex-end">
            <Button
              color="blue"
              onClick={handleGradeSubmission}
              loading={isGrading}
              disabled={!quizQuery.data?.questions}
            >
              {isGrading ? 'Grading...' : 'Grade Submission'}
            </Button>
          </Group>

          <SubmissionGradeInfo submission={submission} />

          <Stack gap="md">
            {responses.map((response, index) => {
              const question = questionsMap.get(response.question_id)
              return (
                <SubmissionResponseCard
                  key={response.id}
                  response={response}
                  index={index}
                  questionText={question?.question_text ?? 'Question text not found.'}
                  correctAnswerText={question?.correct_answer_text ?? null}
                />
              )
            })}
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}
