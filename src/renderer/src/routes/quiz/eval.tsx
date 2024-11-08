import { NotFound } from '@renderer/components/NotFound'
import { GradingPage } from '@renderer/pages/GradingPage'
import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/eval')({
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
    return <GradingPage />
}
