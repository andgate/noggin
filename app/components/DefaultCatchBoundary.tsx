import {
    ErrorComponent,
    ErrorComponentProps,
    Link,
    rootRouteId,
    useMatch,
    useRouter,
} from "@tanstack/react-router";
import { Button, Group, Container } from "@mantine/core";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    const router = useRouter();
    const isRoot = useMatch({
        strict: false,
        select: (state) => state.id === rootRouteId,
    });

    console.error(error);

    return (
        <Container
            style={{
                padding: "var(--mantine-spacing-md)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
            }}
        >
            <ErrorComponent error={error} />
            <Group gap="sm" mt="md">
                <Button onClick={() => router.invalidate()}>Try Again</Button>

                {isRoot ? (
                    <Button component={Link} to="/">
                        Home
                    </Button>
                ) : (
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}
                        component={Link}
                        to="/"
                    >
                        Go Back
                    </Button>
                )}
            </Group>
        </Container>
    );
}
