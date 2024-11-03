import * as React from "react";
import {
    createRootRoute,
    Link,
    Outlet,
    ScrollRestoration,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell, Group, Text, Burger, NavLink } from "@mantine/core";

// core styles are required for all packages
import "@mantine/core/styles.css";
import { IconHome } from "@tabler/icons-react";

// other css files are required only if
// you are using components from the corresponding package
// import '@mantine/dates/styles.css';
// import '@mantine/dropzone/styles.css';
// import '@mantine/code-highlight/styles.css';

// Create a client
const queryClient = new QueryClient();

export const Route = createRootRoute({
    meta: () => [
        {
            charSet: "utf-8",
        },
        {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
        },
        {
            title: "Noggin",
        },
    ],
    errorComponent: (props) => {
        return (
            <RootDocument>
                <DefaultCatchBoundary {...props} />
            </RootDocument>
        );
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <Html>
            <Head>
                <Meta />
            </Head>
            <Body>
                <MantineProvider
                    defaultColorScheme="dark"
                    theme={{
                        primaryColor: "green",
                        colors: {
                            green: [
                                "#E3FCEF",
                                "#BAF5D3",
                                "#86E8B3",
                                "#4FDA90",
                                "#22C96C",
                                "#00B96B",
                                "#00934F",
                                "#006D3B",
                                "#004B28",
                                "#002B17",
                            ],
                        },
                    }}
                >
                    <QueryClientProvider client={queryClient}>
                        <AppLayout>{children}</AppLayout>
                    </QueryClientProvider>
                </MantineProvider>

                <ScrollRestoration />
                <TanStackRouterDevtools position="bottom-right" />
                <Scripts />
            </Body>
        </Html>
    );
}

function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
    const [opened, setOpened] = React.useState(false);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
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
    );
}
