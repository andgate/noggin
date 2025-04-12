import { LoadingOverlay } from '@mantine/core'
import { useAuth } from '@noggin/app/auth/AuthProvider'
import { NotFound } from '@noggin/components/layout/NotFound'
import { DashboardPage } from '@noggin/pages/Dashboard'
import { SplashPage } from '@noggin/pages/Splash'
import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  errorComponent: DashboardErrorComponent,
  component: Index,
  notFoundComponent: () => {
    return <NotFound>Page not found</NotFound>
  },

  // Consider the route's data fresh for 10 seconds
  staleTime: 10_000,
})

function DashboardErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />
}

function Index() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  return user ? <DashboardPage /> : <SplashPage />
}
