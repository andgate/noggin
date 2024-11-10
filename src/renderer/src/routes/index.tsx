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

    // Consider the route's data fresh for 10 seconds
    staleTime: 10_000,
})

function DashboardErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function Index() {
    const quizzes = useLoaderData({ from: '/' })
    return <DashboardPage quizzes={quizzes} />
}
