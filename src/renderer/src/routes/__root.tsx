// TODO: Add theme switching capability
// TODO: Add loading states for route transitions via suspense
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { PracticeFeedProvider } from '@renderer/app/hooks/use-practice-feed'
import { UserSettingsProvider } from '@renderer/app/hooks/use-user-settings'
import { AppLayout } from '@renderer/components/layout/AppLayout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import * as React from 'react'
import { type ReactNode } from 'react'
import { DefaultCatchBoundary } from '../components/layout/DefaultCatchBoundary'
import { NotFound } from '../components/layout/NotFound'
import { theme } from '../theme'

// Create a client
const queryClient = new QueryClient()

export const Route = createRootRoute({
    // meta: () => [
    //     {
    //         charSet: 'utf-8',
    //     },
    //     {
    //         name: 'viewport',
    //         content: 'width=device-width, initial-scale=1',
    //     },
    //     {
    //         title: 'Noggin',
    //     },
    // ],
    errorComponent: (props) => {
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
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
})

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <>
            <RootProvider>
                <AppLayout>{children}</AppLayout>
            </RootProvider>
            {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
        </>
    )
}

const RootProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <>
            <UserSettingsProvider>
                <PracticeFeedProvider>
                    <ColorSchemeScript nonce="8IBTHwOdqNKAWeKl7plt8g==" defaultColorScheme="dark" />
                    <MantineProvider defaultColorScheme="dark" theme={theme}>
                        <Notifications />
                        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                    </MantineProvider>
                </PracticeFeedProvider>
            </UserSettingsProvider>
        </>
    )
}
