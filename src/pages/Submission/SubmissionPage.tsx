import { Alert, Button, Container, Group, Loader, Stack } from '@mantine/core'
import { AppHeader, HeaderAction } from '@noggin/components/layout/AppHeader'
import { useGradeSubmission } from '@noggin/hooks/useAiHooks'
import { quizWithQuestionsQueryOptions } from '@noggin/hooks/useQuizHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconAlertCircle } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SubmissionGradeInfo } from './components/SubmissionGradeInfo'
import { SubmissionResponseCard } from './components/SubmissionResponseCard'

type DbResponse = Tables<'responses'>
type DbSubmission = Tables<'submissions'>
type DbQuestion = Tables<'questions'>

interface SubmissionPageProps {
  moduleId: string
  submission: DbSubmission
  responses: DbResponse[]
}

// Remove libraryId from destructuring
export function SubmissionPage({ moduleId, submission, responses }: SubmissionPageProps) {
  const gradeSubmissionMutation = useGradeSubmission()
  const router = useRouter()
  const isGrading = gradeSubmissionMutation.isPending

  const quizQuery = useQuery(quizWithQuestionsQueryOptions(submission.quiz_id))

  const headerActions: HeaderAction[] = ['explorer', 'settings']

  const handleGradeSubmission = async () => {
    if (!quizQuery.data?.questions) {
      console.error('Cannot grade submission: Quiz questions not loaded.')
      return
    }

    gradeSubmissionMutation.mutate(
      {
        submission: { ...submission, responses },
        questions: quizQuery.data.questions,
        // Pass moduleId if needed by AI hook context
        // moduleId: moduleId,
      },
      {
        onSuccess: (gradingResult) => {
          console.log('Grading successful:', gradingResult)
          router.invalidate()
        },
        onError: (error) => {
          console.error('Failed to grade submission:', error)
        },
      }
    )
  }

  const questionsMap = useMemo(() => {
    if (!quizQuery.data?.questions) {
      return new Map<string, DbQuestion>()
    }
    return new Map(quizQuery.data.questions.map((q) => [q.id, q]))
  }, [quizQuery.data?.questions])

  if (quizQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" /> <span>Loading Quiz Details...</span>
      </div>
    )
  }

  if (quizQuery.isError) {
    return (
      <div className="p-4">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          Failed to load quiz details: {quizQuery.error.message}
        </Alert>
      </div>
    )
  }

  const quizTitle = quizQuery.data?.quiz?.title ?? `Quiz ${submission.quiz_id}`
  const pageTitle = `${quizTitle} - Attempt ${submission.attempt_number}`

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={pageTitle} actions={headerActions} />

      <Container size="md" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <Stack gap="md">
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
