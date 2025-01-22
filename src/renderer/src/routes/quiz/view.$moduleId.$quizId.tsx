import { Quiz, Submission } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/layout/NotFound'
import { QuizPage } from '../../pages/Quiz'

export const Route = createFileRoute('/quiz/view/$moduleId/$quizId')({
    component: QuizViewRoot,
    loader: async ({ params }) => loadQuizData(params),
    notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

interface QuizRouteParams {
    moduleId: string
    quizId: string
}

interface QuizLoaderData {
    moduleId: string
    quiz: Quiz
    submissions: Submission[]
}

async function loadQuizData({ moduleId, quizId }: QuizRouteParams): Promise<QuizLoaderData> {
    console.log('Route loader: Loading quiz data', { moduleId, quizId })

    try {
        const [quiz, submissions] = await Promise.all([
            window.api.modules.readModuleQuiz(moduleId, quizId),
            window.api.modules.getQuizSubmissions(moduleId, quizId),
        ])

        console.log('Route loader: Loaded quiz and submissions:', { quiz, submissions })
        return { moduleId, quiz, submissions }
    } catch (error) {
        console.error('Route loader: Failed to load quiz data:', error)
        throw error
    }
}

function QuizViewRoot() {
    const { moduleId, quiz, submissions } = Route.useLoaderData()
    return <QuizPage moduleId={moduleId} quiz={quiz} submissions={submissions} />
}
