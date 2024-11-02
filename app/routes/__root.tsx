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
import { ConfigProvider } from "antd";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";

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
    links: () => [{ rel: "stylesheet", href: "/styles/app.css" }],
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
                <ConfigProvider
                    theme={{
                        token: {
                            // Seed Token
                            colorPrimary: "#00b96b",
                            borderRadius: 2,

                            // Alias Token
                            colorBgContainer: "#f6ffed",
                        },
                    }}
                >
                    <div className="p-2 flex gap-2">
                        <Link to="/" className="[&.active]:font-bold">
                            Home
                        </Link>
                    </div>
                    <hr />
                    {children}
                </ConfigProvider>

                <ScrollRestoration />
                <TanStackRouterDevtools position="bottom-right" />
                <Scripts />
            </Body>
        </Html>
    );
}
