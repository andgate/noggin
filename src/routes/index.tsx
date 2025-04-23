import { useAuth } from '@/app/auth/auth.hooks'
import { NotFound } from '@/components/errors/NotFound'
import { DashboardPage } from '@/features/practice-feed/Dashboard'
import { SplashPage } from '@/features/splash/Splash'
import { LoadingOverlay } from '@mantine/core'
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
