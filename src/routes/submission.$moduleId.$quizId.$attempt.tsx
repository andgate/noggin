import { Loader } from '@mantine/core'
import { NotFound } from '@noggin/components/layout/NotFound'
import { submissionByAttemptQueryOptions } from '@noggin/hooks/useSubmissionHooks'
import { SubmissionPage } from '@noggin/pages/Submission'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/submission/$moduleId/$quizId/$attempt')({
  component: SubmissionViewRoot,
  loader: async ({ params: { quizId, attempt }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    const attemptNumber = Number(attempt)
    if (isNaN(attemptNumber)) {
      throw new Error('Invalid attempt number provided.')
    }
    await context.queryClient.ensureQueryData(
      submissionByAttemptQueryOptions(quizId, attemptNumber)
    )
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
  const { moduleId, quizId, attempt } = Route.useParams()
  const attemptNumber = Number(attempt)

  const {
    data: submissionData,
    isLoading,
    isError,
    error,
  } = useQuery(submissionByAttemptQueryOptions(quizId, attemptNumber))

  if (isNaN(attemptNumber)) {
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

  const { submission, responses } = submissionData

  return <SubmissionPage moduleId={moduleId} submission={submission} responses={responses} />
}
