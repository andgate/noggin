import { useNavigate } from "@tanstack/react-router";
import {
    Radio,
    Textarea,
    Card,
    Stack,
    Title,
    Button,
    Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Quiz, Question } from "~/types/quiz-view-types";
import { submitQuiz } from "~/services/submission-service";
import { gradeQuiz } from "~/services/grading-service";
import { useState } from "react";

// Component for multiple choice questions
const MultiChoiceQuestionItem: React.FC<{
    question: Extract<Question, { questionType: "multiple_choice" }>;
    questionLabel: string;
    form: ReturnType<typeof useForm>;
}> = ({ question, questionLabel, form }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Radio.Group {...form.getInputProps(`question_${question.id}`)}>
            <Stack>
                {question.choices.map((choice) => (
                    <Radio
                        key={choice.id}
                        value={choice.optionText}
                        label={choice.optionText}
                    />
                ))}
            </Stack>
        </Radio.Group>
    </Box>
);

// Component for written questions
const WrittenQuestionItem: React.FC<{
    question: Extract<Question, { questionType: "written" }>;
    questionLabel: string;
    form: ReturnType<typeof useForm>;
}> = ({ question, questionLabel, form }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Textarea
            {...form.getInputProps(`question_${question.id}`)}
            minRows={4}
        />
    </Box>
);

// Main QuestionItem component that delegates to specific question type components
const QuestionItem: React.FC<{
    question: Question;
    index: number;
    form: ReturnType<typeof useForm>;
}> = ({ question, index, form }) => {
    const questionLabel = `${index + 1}. ${question.question}`;

    if (question.questionType === "multiple_choice") {
        return (
            <MultiChoiceQuestionItem
                question={question}
                questionLabel={questionLabel}
                form={form}
            />
        );
    }

    return (
        <WrittenQuestionItem
            question={question}
            questionLabel={questionLabel}
            form={form}
        />
    );
};

export const PracticeQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: "/quiz/practice/$quizId" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        initialValues: quiz.questions.reduce(
            (acc, question) => ({
                ...acc,
                [`question_${question.id}`]: "",
            }),
            {},
        ),
    });

    const handleSubmit = async (values: Record<string, string>) => {
        if (isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("Submitting quiz", values);
            const responses = Object.values(values);
            const gradedSubmission = await gradeQuiz({ quiz, responses });
            const submissionId = await submitQuiz({ quiz, gradedSubmission });
            navigate({
                to: "/quiz/submission/$submissionId",
                params: { submissionId: `${submissionId}` },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box maw={800} mx="auto" p="xl">
            <Title order={2} mb="lg">
                {quiz.title}
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {quiz.questions.map((question, index) => (
                        <Card key={question.id} withBorder padding="md">
                            <QuestionItem
                                question={question}
                                index={index}
                                form={form}
                            />
                        </Card>
                    ))}
                    <Button type="submit" size="lg" loading={isSubmitting}>
                        Submit Quiz
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
