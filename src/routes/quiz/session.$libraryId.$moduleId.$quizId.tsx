import { Loader } from '@mantine/core' // Use Mantine Loader for consistency
import { getQuizWithQuestions } from '@noggin/api/quizApi' // Import API function
import { NotFound } from '@noggin/components/layout/NotFound'
import { quizKeys } from '@noggin/hooks/query-keys' // Import query keys
import { QuizSessionPage } from '@noggin/pages/QuizSession'
import type { Tables } from '@noggin/types/database.types' // Correct path for Tables
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// Define types locally using Tables utility
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type QuizWithQuestions = { quiz: DbQuiz; questions: DbQuestion[] } | null

// Define query options using queryOptions helper for quiz + questions
// Similar to quizWithOptions in the view route, but specific for session loading
const quizSessionQueryOptions = (quizId: string) =>
  queryOptions<QuizWithQuestions, Error>({
    queryKey: quizKeys.detailWithQuestions(quizId), // Use the same key as view for caching
    queryFn: () => getQuizWithQuestions(quizId),
    staleTime: 1000 * 60 * 5, // 5 minutes, consistent stale time
  })

export const Route = createFileRoute('/quiz/session/$libraryId/$moduleId/$quizId')({
  component: QuizSessionRoot,
  // Use loader to ensure data is fetched/cached
  loader: async ({ params: { quizId }, context }) => {
    // Access queryClient from context
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    console.log('Route loader: Ensuring quiz data for session', { quizId })
    // Ensure the query is fetched/cached using the correct options
    await context.queryClient.ensureQueryData(quizSessionQueryOptions(quizId))
    console.log('Route loader: Quiz data ensured', { quizId })
    // Loader doesn't need to return data when using ensureQueryData + useQuery in component
    // Return params needed by the component if not using Route.useParams() directly, but we are.
    return {}
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-full">
      <Loader color="blue" size="lg" /> {/* Use Mantine Loader */}
    </div>
  ),
  errorComponent: ({ error }) => {
    console.error('Route Error:', error)
    return <NotFound>Error loading quiz session: {error?.message ?? 'Unknown error'}</NotFound>
  },
  notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

// Component reads data from cache using useQuery
function QuizSessionRoot() {
  // Get params directly using the hook provided by the route definition
  const { libraryId, moduleId, quizId } = Route.useParams()

  // Use useQuery with the same options as the loader
  const {
    data: quizData, // This will be of type QuizWithQuestions | null
    isLoading, // Reflects query loading state
    isError,
    error,
  } = useQuery(quizSessionQueryOptions(quizId))

  // Handle loading state (might be brief due to pre-fetching)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" />
      </div>
    )
  }

  // Handle error state
  if (isError) {
    console.error('QuizSessionRoot Query Error:', error)
    return <NotFound>Error loading quiz data: {error?.message ?? 'Unknown error'}</NotFound>
  }

  // Handle case where data is successfully fetched but is null/empty
  if (!quizData) {
    console.warn('QuizSessionRoot: Quiz data not found after loading.', { quizId })
    return <NotFound>Quiz data not available.</NotFound>
  }

  // Destructure quiz and questions from quizData
  const { quiz, questions } = quizData

  // Pass the fetched data and necessary IDs to the page component
  return (
    <QuizSessionPage libraryId={libraryId} moduleId={moduleId} quiz={quiz} questions={questions} />
  )
}
