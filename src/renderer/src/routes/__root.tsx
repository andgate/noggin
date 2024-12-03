// TODO: Add theme switching capability
// TODO: Add loading states for route transitions via suspense
import {
    AppShell,
    Burger,
    ColorSchemeScript,
    Group,
    MantineProvider,
    NavLink,
    Text,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { UserSettingsProvider } from '@renderer/hooks/use-user-settings'
import { IconHome, IconSettings } from '@tabler/icons-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Link, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import * as React from 'react'
import { type ReactNode } from 'react'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import { theme } from '../theme'

// Create a client
const queryClient = new QueryClient()

export const Route = createRootRoute({
    meta: () => [
        {
            charSet: 'utf-8',
        },
        {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
        },
        {
            title: 'Noggin',
        },
    ],
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
            <ScrollRestoration />
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
    const [opened, setOpened] = React.useState(false)

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger
                            opened={opened}
                            onClick={() => setOpened(!opened)}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Text size="lg" fw={700}>
                            Noggin
                        </Text>
                    </Group>
                    {/* <QuizStatusHeader /> */}
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <NavLink
                    component={Link}
                    to="/"
                    label="Home"
                    leftSection={<IconHome size={16} />}
                />
                <NavLink
                    component={Link}
                    to="/settings"
                    label="Settings"
                    leftSection={<IconSettings size={16} />}
                />
                {/* Add more NavLinks here as needed */}
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    )
}
