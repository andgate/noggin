import { Submission } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../components/layout/NotFound'
import SubmissionPage from '../pages/Submission'

export const Route = createFileRoute('/submission/$moduleId/$quizId/$attempt')({
    component: SubmissionViewRoot,
    loader: async ({ params }): Promise<{ moduleId: string; submission: Submission }> => {
        const { moduleId, quizId, attempt } = params
        console.log('Route loader: Loading submission', { moduleId, quizId, attempt })

        try {
            const submission = await window.api.modules.readModuleSubmission(
                moduleId,
                quizId,
                Number(attempt)
            )
            console.log('Route loader: Loaded submission:', submission)
            return { moduleId, submission }
        } catch (error) {
            console.error('Route loader: Failed to load submission:', error)
            throw error
        }
    },
    notFoundComponent: () => <NotFound>Submission not found</NotFound>,
})

function SubmissionViewRoot() {
    const { moduleId, submission } = Route.useLoaderData()
    return <SubmissionPage moduleId={moduleId} submission={submission} />
}
