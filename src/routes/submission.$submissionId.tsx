import { NotFound } from '@/components/errors/NotFound'
import { submissionByIdQueryOptions, useSubmission } from '@/core/hooks/useSubmissionHooks'
import { SubmissionPage } from '@/features/view-submission/SubmissionPage'
import { Loader } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/submission/$submissionId')({
  component: SubmissionViewRoot,
  loader: async ({ params: { submissionId }, context }) => {
    if (!context.queryClient) {
      throw new Error('QueryClient not found in route context!')
    }
    await context.queryClient.ensureQueryData(submissionByIdQueryOptions(submissionId))
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
  const { submissionId } = Route.useParams()

  const { data: submissionData, isLoading, isError, error } = useSubmission(submissionId)

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
    console.warn('SubmissionViewRoot: Submission data not found after loading.')
    return <NotFound>Submission not found.</NotFound>
  }

  return <SubmissionPage submission={submissionData} />
}
