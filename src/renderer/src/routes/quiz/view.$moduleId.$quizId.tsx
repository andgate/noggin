import { Quiz } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/NotFound'
import { QuizPage } from '../../pages/QuizPage'

export const Route = createFileRoute('/quiz/view/$moduleId/$quizId')({
    component: QuizViewRoot,
    loader: async ({ params }): Promise<{ moduleId: string; quiz: Quiz }> => {
        const { moduleId, quizId } = params
        console.log('Route loader: Loading quiz', { moduleId, quizId })

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

function QuizViewRoot() {
    const { moduleId, quiz } = Route.useLoaderData()
    return <QuizPage moduleId={moduleId} quiz={quiz} />
}
