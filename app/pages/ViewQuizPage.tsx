import { Typography, Card, Space, Button } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { Question, Quiz } from "~/types/quiz-view-types";

const { Title, Text } = Typography;

const QuizQuestionPreview: React.FC<{ question: Question; index: number }> = ({
    question,
    index,
}) => {
    const isMultipleChoice = question.questionType === "multiple_choice";
    let choiceList = <></>;
    if (isMultipleChoice && question.choices) {
        choiceList = (
            <>
                {question.choices.map((choice) => (
                    <div key={choice.id}>
                        <Text type={choice.isCorrect ? "success" : undefined}>
                            • {choice.text}
                            {choice.isCorrect && " (Correct)"}
                        </Text>
                    </div>
                ))}
            </>
        );
    }

    return (
        <div key={question.id}>
            <div>
                <Text strong>Question {index + 1}:</Text>
                <Text> {question.question}</Text>
            </div>

            {choiceList}
        </div>
    );
};

const QuizPreview: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    return (
        <>
            {quiz.questions.map((question, index) => (
                <QuizQuestionPreview
                    key={index}
                    question={question}
                    index={index}
                />
            ))}
        </>
    );
};

export const ViewQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: `/quiz/view/${quiz.id}` });

    console.log("ViewQuizPage quiz ==>", quiz);

    return (
        <div
            style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}
            data-testid="quiz-view-page"
        >
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                    data-testid="quiz-questions-list"
                >
                    <Title level={2}>{quiz.title}</Title>

                    <Button
                        type="primary"
                        onClick={() => navigate({ to: "/quiz/practice" })}
                    >
                        Practice Quiz
                    </Button>

                    <QuizPreview quiz={quiz} />
                </Space>
            </Card>
        </div>
    );
};
