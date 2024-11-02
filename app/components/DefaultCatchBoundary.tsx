import {
    ErrorComponent,
    ErrorComponentProps,
    Link,
    rootRouteId,
    useMatch,
    useRouter,
} from "@tanstack/react-router";
import { Button, Space, Layout } from "antd";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    const router = useRouter();
    const isRoot = useMatch({
        strict: false,
        select: (state) => state.id === rootRouteId,
    });

    console.error(error);

    return (
        <Layout.Content
            style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
            }}
        >
            <ErrorComponent error={error} />
            <Space size="small" style={{ marginTop: 24 }}>
                <Button type="primary" onClick={() => router.invalidate()}>
                    Try Again
                </Button>

                {isRoot ? (
                    <Button type="primary">
                        <Link to="/">Home</Link>
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}
                    >
                        <Link to="/">Go Back</Link>
                    </Button>
                )}
            </Space>
        </Layout.Content>
    );
}
