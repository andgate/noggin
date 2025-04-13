import { Loader } from '@mantine/core'
import { NotFound } from '@noggin/components/layout/NotFound'
import { quizWithQuestionsQueryOptions } from '@noggin/hooks/useQuizHooks'
import { QuizSessionPage } from '@noggin/pages/QuizSession'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/session/$moduleId/$quizId')({
  component: QuizSessionRoot,
  loader: async ({ params: { quizId }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    console.log('Route loader: Ensuring quiz data for session', { quizId })
    await context.queryClient.ensureQueryData(quizWithQuestionsQueryOptions(quizId))
    console.log('Route loader: Quiz data ensured', { quizId })
    return {}
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-full">
      <Loader color="blue" size="lg" />
    </div>
  ),
  errorComponent: ({ error }) => {
    console.error('Route Error:', error)
    return <NotFound>Error loading quiz session: {error?.message ?? 'Unknown error'}</NotFound>
  },
  notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

function QuizSessionRoot() {
  const { moduleId, quizId } = Route.useParams()

  const {
    data: quizData,
    isLoading,
    isError,
    error,
  } = useQuery(quizWithQuestionsQueryOptions(quizId))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" />
      </div>
    )
  }

  if (isError) {
    console.error('QuizSessionRoot Query Error:', error)
    return <NotFound>Error loading quiz data: {error?.message ?? 'Unknown error'}</NotFound>
  }

  if (!quizData) {
    console.warn('QuizSessionRoot: Quiz data not found after loading.', { quizId })
    return <NotFound>Quiz data not available.</NotFound>
  }

  const { quiz, questions } = quizData

  return <QuizSessionPage moduleId={moduleId} quiz={quiz} questions={questions} />
}
