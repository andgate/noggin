import { Quiz } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/layout/NotFound'
import { QuizSessionPage } from '../../pages/QuizSession'

export const Route = createFileRoute('/quiz/session/$libraryId/$moduleId/$quizId')({
    component: QuizSessionRoot,
    loader: async ({ params }): Promise<{ libraryId: string; moduleId: string; quiz: Quiz }> => {
        const { libraryId, moduleId, quizId } = params
        console.log('Route loader: Loading quiz for session', { libraryId, moduleId, quizId })

        try {
            const quiz = await window.api.modules.readModuleQuiz(libraryId, moduleId, quizId)
            console.log('Route loader: Loaded quiz:', quiz)
            return { libraryId, moduleId, quiz }
        } catch (error) {
            console.error('Route loader: Failed to load quiz:', error)
            throw error
        }
    },
    notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

function QuizSessionRoot() {
    const { libraryId, moduleId, quiz } = Route.useLoaderData()
    return <QuizSessionPage libraryId={libraryId} moduleId={moduleId} quiz={quiz} />
}
