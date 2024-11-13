import type { ErrorComponentProps } from '@tanstack/react-router'
import { ErrorComponent, createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../../components/NotFound'
import { ViewQuizPage } from '../../pages/ViewQuiz.page'
import { getQuiz } from '../../services/quiz-service'
import { getSubmissionsForQuiz } from '../../services/submission-service'

export const Route = createFileRoute('/quiz/view/$quizId')({
    loader: async ({ params: { quizId } }) => {
        const id = Number(quizId)
        const [quiz, submissions] = await Promise.all([getQuiz(id), getSubmissionsForQuiz(id)])
        return { quiz, submissions }
    },
    errorComponent: ViewQuizErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Quiz not found</NotFound>
    },
})

export function ViewQuizErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function RouteComponent() {
    const { quiz, submissions } = Route.useLoaderData()
    return <ViewQuizPage quiz={quiz} submissions={submissions} />
}
