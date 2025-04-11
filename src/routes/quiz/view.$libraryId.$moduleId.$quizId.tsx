import { Loader } from '@mantine/core'
import { getQuizWithQuestions } from '@noggin/api/quizApi'
import { getSubmissionsByQuiz } from '@noggin/api/submissionApi'
import { NotFound } from '@noggin/components/layout/NotFound'
import { quizKeys, submissionKeys } from '@noggin/hooks/query-keys'
import { QuizPage } from '@noggin/pages/Quiz'
import type { Tables } from '@noggin/types/database.types'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// Define types using Tables utility
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>
type QuizWithQuestions = { quiz: DbQuiz; questions: DbQuestion[] } | null

// Define query options using queryOptions helper for quiz + questions
const quizWithOptions = (quizId: string) =>
  queryOptions<QuizWithQuestions, Error>({
    // Add explicit types for clarity
    queryKey: quizKeys.detailWithQuestions(quizId),
    queryFn: () => getQuizWithQuestions(quizId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

// Define query options using queryOptions helper for submissions
const submissionsByQuizOptions = (quizId: string) =>
  queryOptions<DbSubmission[], Error>({
    // Add explicit types for clarity
    queryKey: submissionKeys.listByQuiz(quizId),
    queryFn: () => getSubmissionsByQuiz(quizId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const Route = createFileRoute('/quiz/view/$libraryId/$moduleId/$quizId')({
  component: QuizViewRoot,
  // Use loader to ensure data is fetched/cached
  loader: async ({ params: { quizId }, context }) => {
    // Access queryClient from context
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    console.log('Route loader: Ensuring quiz and submissions data', { quizId })
    // Ensure both queries are fetched/cached using the correct options
    await Promise.all([
      context.queryClient.ensureQueryData(quizWithOptions(quizId)),
      context.queryClient.ensureQueryData(submissionsByQuizOptions(quizId)),
    ])
    console.log('Route loader: Data ensured', { quizId })
    // Loader doesn't return data when using ensureQueryData + useQuery in component
    return {}
  },
  errorComponent: ({ error }) => {
    console.error('Route Error:', error)
    // Basic error display, can be enhanced
    return <NotFound>Error loading quiz data: {error?.message ?? 'Unknown error'}</NotFound>
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-full">
      <Loader color="blue" size="lg" /> {/* Use Mantine Loader */}
    </div>
  ),
  notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

// Component reads data from cache using useQuery
function QuizViewRoot() {
  const { quizId } = Route.useParams()

  // Use useQuery with the same options as the loader
  const {
    data: quizData, // This will be of type QuizWithQuestions | null
    isLoading: isLoadingQuiz,
    isError: isErrorQuiz,
    error: errorQuiz,
  } = useQuery(quizWithOptions(quizId))

  const {
    data: submissionsData, // This will be of type DbSubmission[]
    isLoading: isLoadingSubmissions,
    isError: isErrorSubmissions,
    error: errorSubmissions,
  } = useQuery(submissionsByQuizOptions(quizId))

  // Handle loading state
  if (isLoadingQuiz || isLoadingSubmissions) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" />
      </div>
    )
  }

  // Handle error state
  if (isErrorQuiz || isErrorSubmissions) {
    console.error('QuizViewRoot Query Error:', errorQuiz || errorSubmissions)
    return (
      <NotFound>
        Error loading quiz details:{' '}
        {errorQuiz?.message || errorSubmissions?.message || 'Unknown error'}
      </NotFound>
    )
  }

  // Handle case where data is successfully fetched but is null/empty
  if (!quizData) {
    console.warn('QuizViewRoot: Quiz data not found after loading.', { quizId })
    return <NotFound>Quiz not found.</NotFound>
  }
  if (!submissionsData) {
    // Should not happen if query succeeds, but good practice
    console.error(
      'QuizViewRoot Error: Submissions data unexpectedly null/undefined after loading',
      { submissionsData }
    )
    return <NotFound>Error loading submission data.</NotFound>
  }

  // Destructure quiz and questions from quizData (which is QuizWithQuestions)
  const { quiz, questions } = quizData

  return (
    <QuizPage
      quiz={quiz} // Pass DbQuiz
      questions={questions} // Pass DbQuestion[]
      submissions={submissionsData} // Pass DbSubmission[]
    />
  )
}
