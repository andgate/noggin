import { Loader } from '@mantine/core'
import { getSubmissionDetailsByAttempt } from '@noggin/api/submissionApi'
import { NotFound } from '@noggin/components/layout/NotFound'
import { submissionKeys } from '@noggin/hooks/query-keys'
import { SubmissionPage } from '@noggin/pages/Submission'
import type { Tables } from '@noggin/types/database.types'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// --- Define DB types locally ---
type DbSubmission = Tables<'submissions'>
type DbResponse = Tables<'responses'>
// Type returned by the getSubmissionDetailsByAttempt function
type SubmissionWithResponses = { submission: DbSubmission; responses: DbResponse[] } | null
// --- ---

// Define query options using the new key and API function
const submissionByAttemptQueryOptions = (quizId: string, attempt: number) =>
  queryOptions<SubmissionWithResponses, Error>({
    queryKey: submissionKeys.byQuizAttempt(quizId, attempt), // Use the new key
    queryFn: () => getSubmissionDetailsByAttempt(quizId, attempt), // Use the new API function
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const Route = createFileRoute('/submission/$libraryId/$moduleId/$quizId/$attempt')({
  component: SubmissionViewRoot,
  loader: async ({ params: { quizId, attempt }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    const attemptNumber = Number(attempt)
    if (isNaN(attemptNumber)) {
      throw new Error('Invalid attempt number provided.')
    }
    console.log('Route loader: Ensuring submission data by attempt', {
      quizId,
      attempt: attemptNumber,
    })
    await context.queryClient.ensureQueryData(
      submissionByAttemptQueryOptions(quizId, attemptNumber) // Use the new options
    )
    console.log('Route loader: Submission data ensured', { quizId, attempt: attemptNumber })
    return {}
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-full">
      <Loader color="blue" size="lg" />
    </div>
  ),
  errorComponent: ({ error }) => {
    console.error('Route Error:', error)
    return <NotFound>Error loading submission: {error?.message ?? 'Unknown error'}</NotFound>
  },
  notFoundComponent: () => <NotFound>Submission not found</NotFound>,
})

function SubmissionViewRoot() {
  const { libraryId, moduleId, quizId, attempt } = Route.useParams()
  const attemptNumber = Number(attempt)

  // Move hook call to the top level before the conditional return
  const {
    data: submissionData,
    isLoading,
    isError,
    error,
  } = useQuery(submissionByAttemptQueryOptions(quizId, attemptNumber)) // Use the new options

  // Validate attemptNumber *after* calling hooks
  if (isNaN(attemptNumber)) {
    // Consider throwing an error or navigating away if validation fails post-hook call
    // For now, returning NotFound, but be aware hooks were already called.
    return <NotFound>Invalid attempt number.</NotFound>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader color="blue" size="lg" />
      </div>
    )
  }

  if (isError) {
    console.error('SubmissionViewRoot Query Error:', error)
    return <NotFound>Error loading submission data: {error?.message ?? 'Unknown error'}</NotFound>
  }

  if (!submissionData) {
    console.warn('SubmissionViewRoot: Submission data not found after loading.', {
      quizId,
      attempt: attemptNumber,
    })
    return <NotFound>Submission not found.</NotFound>
  }

  const { submission, responses } = submissionData // Destructure data, including responses

  // TODO: Verify/Update SubmissionPage props. It likely needs DbSubmission and DbResponse[].
  return (
    <SubmissionPage
      libraryId={libraryId}
      moduleId={moduleId}
      submission={submission} // Pass DbSubmission
      responses={responses} // Pass DbResponse[]
    />
  )
}
