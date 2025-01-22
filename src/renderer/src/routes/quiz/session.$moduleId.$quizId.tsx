import { Quiz } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/layout/NotFound'
import { QuizSessionPage } from '../../pages/QuizSession'

export const Route = createFileRoute('/quiz/session/$moduleId/$quizId')({
    component: QuizSessionRoot,
    loader: async ({ params }): Promise<{ moduleId: string; quiz: Quiz }> => {
        const { moduleId, quizId } = params
        console.log('Route loader: Loading quiz for session', { moduleId, quizId })

        try {
            const quiz = await window.api.modules.readModuleQuiz(moduleId, quizId)
            console.log('Route loader: Loaded quiz:', quiz)
            return { moduleId, quiz }
        } catch (error) {
            console.error('Route loader: Failed to load quiz:', error)
            throw error
        }
    },
    notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

function QuizSessionRoot() {
    const { moduleId, quiz } = Route.useLoaderData()
    return <QuizSessionPage moduleId={moduleId} quiz={quiz} />
}
