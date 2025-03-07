// TODO: Add theme switching capability
// TODO: Add loading states for route transitions via suspense
import { AppShell, ColorSchemeScript, Divider, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { UserSettingsProvider } from '@renderer/app/hooks/use-user-settings'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { ModuleExplorer } from '@renderer/components/ModuleExplorer'
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
                <ColorSchemeScript nonce="8IBTHwOdqNKAWeKl7plt8g==" defaultColorScheme="dark" />
                <MantineProvider defaultColorScheme="dark" theme={theme}>
                    <Notifications />
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </MantineProvider>
            </UserSettingsProvider>
        </>
    )
}

function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
    const collapsed = useUiStore((s) => s.explorerCollapsed)

    return (
        <AppShell
            data-testid="app-shell"
            header={{ height: 0 }}
            navbar={{
                width: { base: 280 },
                breakpoint: 'sm',
                collapsed: { desktop: collapsed, mobile: true },
            }}
            padding={0}
        >
            <AppShell.Navbar p={0}>
                <ModuleExplorer />
            </AppShell.Navbar>

            <AppShell.Main>
                <Divider orientation="vertical" />
                {React.cloneElement(children as React.ReactElement, {
                    collapsed,
                })}
            </AppShell.Main>
        </AppShell>
    )
}
