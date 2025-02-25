import { Quiz, Submission } from '@noggin/types/quiz-types'
import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/layout/NotFound'
import { QuizPage } from '../../pages/Quiz'

export const Route = createFileRoute('/quiz/view/$libraryId/$moduleId/$quizId')({
    component: QuizViewRoot,
    loader: async ({ params }) => loadQuizData(params),
    notFoundComponent: () => <NotFound>Quiz not found</NotFound>,
})

interface QuizRouteParams {
    libraryId: string
    moduleId: string
    quizId: string
}

interface QuizLoaderData {
    libraryId: string
    moduleId: string
    quiz: Quiz
    submissions: Submission[]
}

async function loadQuizData({
    libraryId,
    moduleId,
    quizId,
}: QuizRouteParams): Promise<QuizLoaderData> {
    console.log('Route loader: Loading quiz data', { libraryId, moduleId, quizId })

    try {
        const [quiz, submissions] = await Promise.all([
            window.api.modules.readModuleQuiz(libraryId, moduleId, quizId),
            window.api.modules.getQuizSubmissions(libraryId, moduleId, quizId),
        ])

        console.log('Route loader: Loaded quiz and submissions:', {
            quiz,
            submissions,
        })
        return { libraryId, moduleId, quiz, submissions }
    } catch (error) {
        console.error('Route loader: Failed to load quiz data:', error)
        throw error
    }
}

function QuizViewRoot() {
    const { libraryId, moduleId, quiz, submissions } = Route.useLoaderData()
    return (
        <QuizPage libraryId={libraryId} moduleId={moduleId} quiz={quiz} submissions={submissions} />
    )
}
