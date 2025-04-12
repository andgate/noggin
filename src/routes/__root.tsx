import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from '@noggin/app/auth/AuthProvider'
import { supabase } from '@noggin/app/common/supabase-client'
// import { AppLayout } from '@noggin/components/layout/AppLayout' // disabled for now, until we figoure out what to do about it
import { DefaultCatchBoundary } from '@noggin/components/layout/DefaultCatchBoundary'
import { NotFound } from '@noggin/components/layout/NotFound'
import { theme } from '@noggin/theme'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { type ReactNode } from 'react'

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
  beforeLoad: async ({ location, params }) => {
    console.log('[RootRoute] beforeLoad:', {
      pathname: location.pathname,
      search: location.search,
      params,
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const publicPaths = ['/', '/login', '/signup']
    if (!user && !publicPaths.includes(location.pathname)) {
      throw redirect({ to: '/', search: { redirect: location.pathname } })
    }
  },
  notFoundComponent: () => (
    <RootDocument>
      <NotFound />
    </RootDocument>
  ),
  component: RootComponent,
})

function RootComponent() {
  // Render the full document structure.
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
        {/* <AppLayout>{children}</AppLayout> */}
        {children}
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
