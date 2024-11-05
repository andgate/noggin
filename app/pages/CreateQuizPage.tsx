import { Box, Button, Card, Group, MultiSelect, NumberInput, Stack, Textarea, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useRef, useState } from "react";
import { z } from "zod";
import { QuestionType } from "~/types/quiz-view-types";
import { QuizGenerator, QuizGeneratorHandle } from "../components/QuizGenerator";

export const QuizFormSchema = z.object({
    content: z.string().min(1, "Please enter study content"),
    questionCount: z.number().min(1, "Must have at least 1 question").max(50, "Maximum 50 questions allowed"),
    questionTypes: z.array(z.enum(["multiple-choice", "written"])).min(1, "Select at least one question type"),
});

// TODO: Add progressive enhancement for non-JS environments
// TODO: Implement partial form saving to prevent data loss
// TODO: Add detailed error states for API/generation failures
// TODO: Add fallback UI for when OpenAI is unavailable
export const CreateQuizPage: React.FC = () => {
    const [showGenerator, setShowGenerator] = useState(false);
    const quizGeneratorRef = useRef<QuizGeneratorHandle>(null);

    // TODO consider using zod to validate form data
    const form = useForm({
        initialValues: {
            content: "",
            questionCount: 4,
            questionTypes: ["multiple-choice", "written"],
        },
        validate: zodResolver(QuizFormSchema),
    });

    const handleSubmit = () => {
        if (!showGenerator) {
            setShowGenerator(true);
        }
        quizGeneratorRef.current?.run();
    };

    return (
        <Box maw={1200} mx="auto" p="md">
            <Card withBorder>
                <Stack>
                    <Title order={2}>Create New Quiz</Title>

                    <Group align="flex-start" gap="xl">
                        <Box style={{ flex: 1 }}>
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

                                    <Button type="submit">Generate Quiz</Button>
                                </Stack>
                            </form>
                        </Box>

                        <Box style={{ flex: 1 }}>
                            <QuizGenerator
                                ref={quizGeneratorRef}
                                show={showGenerator}
                                questionCount={form.values.questionCount}
                                questionTypes={form.values.questionTypes as QuestionType[]}
                                sources={[form.values.content]}
                            />
                        </Box>
                    </Group>
                </Stack>
            </Card>
        </Box>
    );
};

export default CreateQuizPage;
