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
import { submitQuiz } from "~/services/submission-service";
import { Quiz, Question } from "~/types/quiz-view-types";

// Component for multiple choice questions
const MultiChoiceQuestionItem: React.FC<{
    question: Extract<Question, { questionType: "multiple_choice" }>;
    questionLabel: string;
}> = ({ question, questionLabel }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Radio.Group name={`question_${question.id}`}>
            <Stack>
                {question.choices.map((choice) => (
                    <Radio
                        key={choice.id}
                        value={choice.id.toString()}
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
}> = ({ question, questionLabel }) => (
    <Box mb="md">
        <Title order={4} mb="xs">
            {questionLabel}
        </Title>
        <Textarea name={`question_${question.id}`} minRows={4} />
    </Box>
);

// Main QuestionItem component that delegates to specific question type components
const QuestionItem: React.FC<{ question: Question; index: number }> = ({
    question,
    index,
}) => {
    const questionLabel = `${index + 1}. ${question.question}`;

    if (question.questionType === "multiple_choice") {
        return (
            <MultiChoiceQuestionItem
                question={question}
                questionLabel={questionLabel}
            />
        );
    }

    return (
        <WrittenQuestionItem
            question={question}
            questionLabel={questionLabel}
        />
    );
};

export const PracticeQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: `/quiz/practice/$quizId` });
    const form = useForm({
        initialValues: {},
    });

    const handleSubmit = async (values: Record<string, string>) => {
        console.log("Submitting quiz", values);
        const responses = [""];
        const submissionId = await submitQuiz({ quiz, responses });
        navigate({ to: `/quiz/results/${submissionId}` });
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
                            <QuestionItem question={question} index={index} />
                        </Card>
                    ))}
                    <Button type="submit" size="lg">
                        Submit Quiz
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
