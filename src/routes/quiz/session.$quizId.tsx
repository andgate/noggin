import { NotFound } from '@/components/errors/NotFound'
import { quizQueryOptions, useQuiz } from '@/core/hooks/useQuizHooks'
import { QuizSessionPage } from '@/features/take-quiz/QuizSessionPage'
import { Loader } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/session/$quizId')({
  component: QuizSessionRoot,
  loader: async ({ params: { quizId }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    console.log('Route loader: Ensuring quiz data for session', { quizId })
    await context.queryClient.ensureQueryData(quizQueryOptions(quizId))
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
  const { quizId } = Route.useParams()
  const { data: quiz, isLoading, isError, error } = useQuiz(quizId)

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

  if (!quiz) {
    console.warn('QuizSessionRoot: Quiz data not found after loading.', { quizId })
    return <NotFound>Quiz data not available.</NotFound>
  }

  return <QuizSessionPage quiz={quiz} />
}
