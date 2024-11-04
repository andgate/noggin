import { Title, Text, Card, Stack, Button } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { Question, Quiz } from "~/types/quiz-view-types";

const QuizQuestionPreview: React.FC<{ question: Question; index: number }> = ({
    question,
    index,
}) => {
    const isMultipleChoice = question.questionType === "multiple_choice";
    let choiceList = <Text fs="italic">Written response.</Text>;
    if (isMultipleChoice && question.choices) {
        choiceList = (
            <Stack gap="xs">
                {question.choices.map((choice) => (
                    <Text key={choice.id}>• {choice.optionText}</Text>
                ))}
            </Stack>
        );
    }

    return (
        <div key={question.id}>
            <div>
                <Text fw={700}>Question {index + 1}:</Text>
                <Text> {question.question}</Text>
            </div>

            {choiceList}
        </div>
    );
};

const QuizPreview: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    return (
        <Stack gap="md">
            {quiz.questions.map((question, index) => (
                <QuizQuestionPreview
                    key={index}
                    question={question}
                    index={index}
                />
            ))}
        </Stack>
    );
};

export const ViewQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: "/quiz/view/$quizId" });

    console.log("ViewQuizPage quiz ==>", quiz);

    return (
        <div
            style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}
            data-testid="quiz-view-page"
        >
            <Card withBorder padding="md">
                <Stack gap="lg" data-testid="quiz-questions-list">
                    <Title order={2}>{quiz.title}</Title>

                    <Button
                        onClick={() =>
                            navigate({
                                to: "/quiz/practice/$quizId",
                                params: { quizId: `${quiz.id}` },
                            })
                        }
                    >
                        Practice Quiz
                    </Button>

                    <QuizPreview quiz={quiz} />
                </Stack>
            </Card>
        </div>
    );
};
