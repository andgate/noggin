// TODO: Add submission history section
// TODO: Implement submission statistics visualization
// TODO: Add filtering/sorting for submissions
// TODO: Consider adding export functionality for submission data
import { Title, Text, Card, Stack, Button } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { Question, Quiz } from "../types/quiz-view-types";

const QuizQuestionPreview: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
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

// TODO: Add loading states for quiz preview
// TODO: Add error boundary for quiz preview
const QuizPreview: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    return (
        <Stack gap="md">
            {quiz.questions.map((question, index) => (
                <QuizQuestionPreview key={index} question={question} index={index} />
            ))}
        </Stack>
    );
};

// TODO: Implement SSR for quiz and submission data
// TODO: Add loading states for dynamic content
// TODO: Add error boundaries for failed quiz loads
// TODO: Implement retry mechanism for failed data fetches
// TODO: Add fallback UI for partial quiz data
// TODO: Implement progressive enhancement for statistics
// TODO: Add error recovery for failed quiz renders
export const ViewQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: "/quiz/view/$quizId" });

    console.log("ViewQuizPage quiz ==>", quiz);

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }} data-testid="quiz-view-page">
            <Card withBorder padding="md">
                <Stack gap="lg" data-testid="quiz-questions-list">
                    <Title order={2}>{quiz.title}</Title>

                    {/* TODO: Add quiz metadata (created date, attempts, avg score) */}
                    {/* TODO: Add quiz description/instructions section */}
                    {/* TODO: Add ability to view sources (new page or as a panel*/}

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

                    {/* TODO: Add SubmissionsList component here */}
                    {/* TODO: Add pagination for submissions */}
                    {/* TODO: Add submission performance trends */}
                </Stack>
            </Card>
        </div>
    );
};
