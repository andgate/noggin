import { Title, Text, Card, Stack, Container } from "@mantine/core";

export const QuizResultsPage = () => {
    return (
        <Container size="md" p="md">
            <Card withBorder padding="lg">
                <Stack gap="lg">
                    <Title order={2}>Quiz Results</Title>

                    <div>
                        <Title order={4}>Score: 8/10</Title>
                        <Text>Time taken: 12 minutes</Text>
                    </div>

                    <Stack gap="md">
                        <div>
                            <Text fw={700}>Question 1: Correct</Text>
                            <Text>What is the capital of France?</Text>
                            <Text c="green">Your answer: Paris</Text>
                        </div>

                        <div>
                            <Text fw={700}>Question 2: Incorrect</Text>
                            <Text>
                                What is the largest planet in our solar system?
                            </Text>
                            <Text c="red">Your answer: Saturn</Text>
                            <Text c="green">Correct answer: Jupiter</Text>
                        </div>
                    </Stack>
                </Stack>
            </Card>
        </Container>
    );
};
