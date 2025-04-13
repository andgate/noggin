import { Loader } from '@mantine/core'
import { NotFound } from '@noggin/components/layout/NotFound'
import { quizWithQuestionsQueryOptions } from '@noggin/hooks/useQuizHooks'
import { submissionsByQuizOptions } from '@noggin/hooks/useSubmissionHooks'
import { QuizPage } from '@noggin/pages/Quiz'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/view/$moduleId/$quizId')({
  component: QuizViewRoot,
  loader: async ({ params: { quizId }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    console.log('Route loader: Ensuring quiz and submissions data', { quizId })
    await Promise.all([
      context.queryClient.ensureQueryData(quizWithQuestionsQueryOptions(quizId)),
      context.queryClient.ensureQueryData(submissionsByQuizOptions(quizId)),
    ])
    console.log('Route loader: Data ensured', { quizId })
    return {}
  },
  errorComponent: ({ error }) => {
    console.error('Route Error:', error)
    return <NotFound>Error loading quiz data: {error?.message ?? 'Unknown error'}</NotFound>
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-full">
      <Loader color="blue" size="lg" />
    </div>
  ),
  notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

function QuizViewRoot() {
  const { quizId } = Route.useParams()

  const {
    data: quizData,
    isLoading: isLoadingQuiz,
    isError: isErrorQuiz,
    error: errorQuiz,
  } = useQuery(quizWithQuestionsQueryOptions(quizId))

  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    isError: isErrorSubmissions,
    error: errorSubmissions,
  } = useQuery(submissionsByQuizOptions(quizId))

  if (isLoadingQuiz || isLoadingSubmissions) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" />
      </div>
    )
  }

  if (isErrorQuiz || isErrorSubmissions) {
    console.error('QuizViewRoot Query Error:', errorQuiz || errorSubmissions)
    return (
      <NotFound>
        Error loading quiz details:{' '}
        {errorQuiz?.message || errorSubmissions?.message || 'Unknown error'}
      </NotFound>
    )
  }

  if (!quizData) {
    console.warn('QuizViewRoot: Quiz data not found after loading.', { quizId })
    return <NotFound>Quiz not found.</NotFound>
  }
  if (!submissionsData) {
    console.error(
      'QuizViewRoot Error: Submissions data unexpectedly null/undefined after loading',
      { submissionsData }
    )
    return <NotFound>Error loading submission data.</NotFound>
  }

  const { quiz, questions } = quizData

  return <QuizPage quiz={quiz} questions={questions} submissions={submissionsData} />
}
