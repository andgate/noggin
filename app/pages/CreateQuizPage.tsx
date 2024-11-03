import { useNavigate } from "@tanstack/react-router";
import {
    Button,
    Card,
    NumberInput,
    MultiSelect,
    Textarea,
    Title,
    Stack,
    Group,
    Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { createQuiz } from "../services/quiz-service";
import { generateQuiz } from "../services/quiz-generation-service";

interface QuizFormData {
    content: string;
    questionCount: number;
    questionTypes: string[];
}

export const CreateQuizPage: React.FC = () => {
    const navigate = useNavigate({ from: "/quiz/create" });
    const [loading, setLoading] = useState(false);

    const form = useForm<QuizFormData>({
        initialValues: {
            content: "",
            questionCount: 10,
            questionTypes: ["multiple-choice"],
        },
        validate: {
            content: (value) => (!value ? "Please enter study content" : null),
            questionCount: (value) =>
                !value ? "Number of questions is required" : null,
            questionTypes: (value) =>
                !value.length ? "Select at least one question type" : null,
        },
    });

    const handleSubmit = async (values: QuizFormData) => {
        setLoading(true);
        try {
            const generatedQuiz = await generateQuiz({
                questionCount: values.questionCount,
                questionTypes: values.questionTypes,
                source: values.content,
            });
            const newQuizId = await createQuiz({
                generatedQuiz,
                sources: [values.content],
            });
            navigate({ to: `/quiz/view/${newQuizId}` });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maw={800} mx="auto" p="md">
            <Card withBorder>
                <Stack>
                    <Title order={2}>Create New Quiz</Title>

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <Textarea
                                label="Study Content"
                                placeholder="Paste your study material here"
                                minRows={6}
                                {...form.getInputProps("content")}
                            />

                            <Group grow>
                                <NumberInput
                                    label="Number of Questions"
                                    min={1}
                                    max={50}
                                    {...form.getInputProps("questionCount")}
                                />

                                <MultiSelect
                                    label="Question Types"
                                    data={[
                                        {
                                            label: "Multiple Choice",
                                            value: "multiple-choice",
                                        },
                                        {
                                            label: "Written Answer",
                                            value: "written",
                                        },
                                    ]}
                                    {...form.getInputProps("questionTypes")}
                                />
                            </Group>

                            <Button type="submit" loading={loading}>
                                Generate Quiz
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Card>
        </Box>
    );
};

export default CreateQuizPage;
