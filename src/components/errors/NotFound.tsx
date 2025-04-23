import { Link } from "@tanstack/react-router";
import { Stack, Text, Group, Button } from "@mantine/core";

export function NotFound({ children }: { children?: React.ReactNode }) {
    return (
        <Stack p="md">
            <Text c="dimmed">
                {children || (
                    <p>The page you are looking for does not exist.</p>
                )}
            </Text>
            <Group gap="sm">
                <Button onClick={() => window.history.back()}>Go back</Button>
                <Link to="/">
                    <Button>Start Over</Button>
                </Link>
            </Group>
        </Stack>
    );
}
