import { AppHeader, HeaderAction } from '@/components/layouts/AppHeader'
import { useQuiz } from '@/core/hooks/useQuizHooks' // Use updated query options
import type { Question } from '@/core/types/question.types' // Use Question View Type
import type { Submission } from '@/core/types/submission.types' // Use Submission View Type
import { Alert, Container, Group, Loader, Stack } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useMemo } from 'react' // Import useState
import { GradeSubmissionButton } from '../grade-submission/components/GradeSubmissionButton'
import { SubmissionGradeInfo } from './components/SubmissionGradeInfo'
import { SubmissionResponseCard } from './components/SubmissionResponseCard'

interface SubmissionPageProps {
  submission: Submission // Use Submission View Type
}

export function SubmissionPage({ submission }: SubmissionPageProps) {
  const headerActions: HeaderAction[] = ['explorer', 'settings']
  const {
    data: quiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
    error: quizError,
  } = useQuiz(submission.quizId)

  if (isQuizLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" /> <span>Loading Quiz Details...</span>
      </div>
    )
  }

  if (!quiz || isQuizError) {
    return (
      <div className="p-4">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          Failed to load quiz details: {quizError?.message}
        </Alert>
      </div>
    )
  }

  // Use Quiz View Type title
  const quizTitle = quiz.title ?? `Quiz ${submission.quizId}`
  const pageTitle = `${quizTitle} - Attempt ${submission.attemptNumber}`

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={pageTitle} actions={headerActions} />

      <Container size="md" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <Stack gap="md">
          <Group justify="flex-end">
            <GradeSubmissionButton submission={submission}></GradeSubmissionButton>
          </Group>

          {/* Pass Submission View Type */}
          <SubmissionGradeInfo submission={submission} />

          <Stack gap="md">
            {/* Use Response View Type */}
            {submission.responses.map((response, index) => {
              const question = questionsMap.get(response.questionId)
              return (
                <SubmissionResponseCard
                  key={response.id}
                  response={response} // Pass Response View Type
                  index={index}
                  // Pass Question View Type properties
                  questionText={question.questionText ?? 'Question text not found.'}
                  // Correct answer text needs to come from the DbQuestion fetched for context
                  correctAnswerText={
                    quizQuery.data?.questions.find((q) => q.id === response.questionId)
                      ?.correctAnswerText ?? null
                  }
                />
              )
            })}
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}
