// TODO: Add theme switching capability
// TODO: Implement user preferences storage
// TODO: Add loading states for route transitions
// TODO: Consider adding offline support
import {
    AppShell,
    Burger,
    ColorSchemeScript,
    Group,
    MantineProvider,
    NavLink,
    Text,
} from '@mantine/core'
import { ActiveQuizProvider } from '@renderer/hooks/use-active-quiz'
import { IconHome } from '@tabler/icons-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Link, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import type { ReactNode } from 'react'
import * as React from 'react'
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
            <TanStackRouterDevtools position="bottom-left" />
        </>
    )
}

const RootProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <>
            <ActiveQuizProvider>
                <ColorSchemeScript nonce="8IBTHwOdqNKAWeKl7plt8g==" defaultColorScheme="dark" />
                <MantineProvider defaultColorScheme="dark" theme={theme}>
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </MantineProvider>
            </ActiveQuizProvider>
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
                <Group h="100%" px="md">
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
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <NavLink
                    component={Link}
                    to="/"
                    label="Home"
                    leftSection={<IconHome size={16} />}
                />
                {/* Add more NavLinks here as needed */}
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    )
}
