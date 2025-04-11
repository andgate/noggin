import { Center, ColorSchemeScript, Loader, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider, useAuth } from '@noggin/app/auth/AuthProvider'
import { AppLayout } from '@noggin/components/layout/AppLayout'
import { DefaultCatchBoundary } from '@noggin/components/layout/DefaultCatchBoundary'
import { NotFound } from '@noggin/components/layout/NotFound'
import { theme } from '@noggin/theme'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { type ReactNode, useEffect } from 'react'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // meta: () => [ ... ], // Meta tags
  errorComponent: (props) => {
    // Error boundary needs to be wrapped in providers if it uses hooks from them
    // Let's keep it simple for now and wrap it in RootDocument which includes providers
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  beforeLoad: ({ location, params }) => {
    console.log('[RootRoute] beforeLoad:', {
      pathname: location.pathname,
      search: location.search,
      params,
    })
  },
  notFoundComponent: () => (
    <RootDocument>
      <NotFound />
    </RootDocument>
  ),
  component: RootComponent,
})

function RootComponent() {
  const { isLoading, session } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  useEffect(() => {
    // Redirect logic: If not loading, not logged in, and not already on login page
    if (!isLoading && !session && currentPath !== '/login') {
      console.log('Redirecting to /login from:', currentPath)
      navigate({ to: '/login', replace: true })
    }
  }, [isLoading, session, currentPath, navigate])

  // Show loader while checking auth status
  if (isLoading) {
    // Render loader within the basic provider structure, but outside AppLayout
    return (
      <RootProvider>
        <Center style={{ height: '100vh' }}>
          <Loader />
        </Center>
      </RootProvider>
    )
  }

  // If loading is finished, render the full document structure.
  // The Outlet will render LoginPage or protected content based on the route and auth state.
  // The redirect effect ensures non-authed users end up on /login.
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  // RootDocument sets up providers, AppLayout, and dev tools
  return (
    <>
      <RootProvider>
        <AppLayout>{children}</AppLayout>
      </RootProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-right" />}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  )
}

const RootProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <AuthProvider>
        <ColorSchemeScript nonce="8IBTHwOdqNKAWeKl7plt8g==" defaultColorScheme="dark" />
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
      </AuthProvider>
    </>
  )
}
