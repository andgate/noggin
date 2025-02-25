import { Submission } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../components/layout/NotFound'
import SubmissionPage from '../pages/Submission'

export const Route = createFileRoute('/submission/$libraryId/$moduleId/$quizId/$attempt')({
    component: SubmissionViewRoot,
    loader: async ({
        params,
    }): Promise<{ libraryId: string; moduleId: string; submission: Submission }> => {
        const { libraryId, moduleId, quizId, attempt } = params
        console.log('Route loader: Loading submission', { libraryId, moduleId, quizId, attempt })

        try {
            const submission = await window.api.modules.readModuleSubmission(
                libraryId,
                moduleId,
                quizId,
                Number(attempt)
            )
            console.log('Route loader: Loaded submission:', submission)
            return { libraryId, moduleId, submission }
        } catch (error) {
            console.error('Route loader: Failed to load submission:', error)
            throw error
        }
    },
    notFoundComponent: () => <NotFound>Submission not found</NotFound>,
})

function SubmissionViewRoot() {
    const { libraryId, moduleId, submission } = Route.useLoaderData()
    return <SubmissionPage libraryId={libraryId} moduleId={moduleId} submission={submission} />
}
