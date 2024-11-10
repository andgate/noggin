import { NotFound } from '@renderer/components/NotFound'
import {
    createFileRoute,
    ErrorComponent,
    ErrorComponentProps,
    useLoaderData,
} from '@tanstack/react-router'
import DashboardPage from '../pages/Dashboard.page'
import { getAllQuizzes } from '../services/quiz-service'

export const Route = createFileRoute('/')({
    loader: async () => getAllQuizzes(),
    errorComponent: DashboardErrorComponent,
    component: Index,
    notFoundComponent: () => {
        return <NotFound>Quiz not found</NotFound>
    },
})

function DashboardErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function Index() {
    const quizzes = useLoaderData({ from: '/' })
    return <DashboardPage quizzes={quizzes} />
}
