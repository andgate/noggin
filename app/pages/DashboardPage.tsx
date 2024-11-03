import React from "react";
import {
    Button,
    Card,
    Group,
    Stack,
    Title,
    Text,
    SimpleGrid,
} from "@mantine/core";
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconPlayerPlay,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuiz } from "~/services/quiz-service";
import { Quiz } from "~/types/quiz-view-types";
import { notifications } from "@mantine/notifications";

const DashboardPage: React.FC<{ quizzes: Quiz[] }> = ({ quizzes }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate({ from: "/" });

    const deleteMutation = useMutation({
        mutationFn: (quizId: number) => deleteQuiz(quizId),
        onSuccess: () => {
            notifications.show({
                title: "Success",
                message: "Quiz deleted successfully",
                color: "green",
            });
            queryClient.invalidateQueries({ queryKey: ["quizzes"] });
        },
        onError: () => {
            notifications.show({
                title: "Error",
                message: "Failed to delete quiz",
                color: "red",
            });
        },
    });

    const handleCreateQuiz = () => {
        navigate({ to: "/quiz/create" });
    };

    const handleViewQuiz = (quizId?: number) => {
        if (!quizId) return;
        navigate({ to: `/quiz/view/${quizId}` });
    };

    const handleStartQuiz = (quizId?: number) => {
        if (!quizId) return;
        navigate({ to: `/quiz/practice/${quizId}` });
    };

    const handleDeleteQuiz = (quizId?: number) => {
        if (!quizId) return;
        deleteMutation.mutate(quizId);
    };

    return (
        <Stack p="md">
            <Group justify="space-between" align="center">
                <Title order={2}>My Quizzes</Title>
                <Button
                    leftSection={<IconPlus size={16} />}
                    size="md"
                    onClick={handleCreateQuiz}
                >
                    Create Quiz
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
                {quizzes.map((quiz: Quiz) => (
                    <Card
                        key={quiz.id}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                    >
                        <Card.Section p="md">
                            <Text fw={500} size="lg">
                                {quiz.title}
                            </Text>
                            <Stack gap="xs" mt="sm">
                                <Text size="sm">
                                    {quiz.questions.length} Questions
                                </Text>
                                <Text size="sm">
                                    Created:{" "}
                                    {new Date(
                                        quiz.createdAt!,
                                    ).toLocaleDateString()}
                                </Text>
                            </Stack>
                        </Card.Section>

                        <Group justify="space-between" mt="md">
                            <Button
                                variant="light"
                                leftSection={<IconPlayerPlay size={16} />}
                                onClick={() => handleStartQuiz(quiz.id)}
                            >
                                Start
                            </Button>
                            <Button
                                variant="light"
                                leftSection={<IconEdit size={16} />}
                                onClick={() => handleViewQuiz(quiz.id)}
                            >
                                View
                            </Button>
                            <Button
                                variant="light"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => {
                                    const confirmed = window.confirm(
                                        "Are you sure you want to delete this quiz? This action cannot be undone.",
                                    );
                                    if (confirmed) {
                                        handleDeleteQuiz(quiz.id);
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </Group>
                    </Card>
                ))}
            </SimpleGrid>
        </Stack>
    );
};

export default DashboardPage;
