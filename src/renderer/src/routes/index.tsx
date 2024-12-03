import { NotFound } from '@renderer/components/NotFound'
import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'
import DashboardPage from '../pages/Dashboard.page'

export const Route = createFileRoute('/')({
    errorComponent: DashboardErrorComponent,
    component: Index,
    notFoundComponent: () => {
        return <NotFound>Modkit not found</NotFound>
    },

    // Consider the route's data fresh for 10 seconds
    staleTime: 10_000,
})

function DashboardErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function Index() {
    return <DashboardPage />
}
