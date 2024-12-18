import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'
import { NotFound } from '../../components/NotFound'
import { SubmissionPage } from '../../pages/Submission.page'
import { getSubmission } from '../../services/submission-service'

export const Route = createFileRoute('/quiz/submission/$submissionId')({
    loader: ({ params: { submissionId } }) => getSubmission(Number(submissionId)),
    errorComponent: SubmissionErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Submission not found</NotFound>
    },
})

export function SubmissionErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function RouteComponent() {
    const submission = Route.useLoaderData()
    return <SubmissionPage submission={submission} />
}
