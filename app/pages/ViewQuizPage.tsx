import { Typography, Card, Space, Button } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { Quiz } from "drizzle/schema";

const { Title, Text } = Typography;

export const ViewQuizPage: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const navigate = useNavigate({ from: `/quiz/view/${quiz.id}` });

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Title level={2}>{quiz.title}</Title>

                    <Button
                        type="primary"
                        onClick={() => navigate({ to: "/quiz/practice" })}
                    >
                        Practice Quiz
                    </Button>

                    {(quiz?.questions || []).map((question, index) => (
                        <div key={question.id}>
                            <div>
                                <Text strong>Question {index + 1}:</Text>
                                <Text> {question.text}</Text>
                            </div>

                            <Space direction="vertical">
                                {question.options.map((option, optIndex) => (
                                    <Text key={option.id}>
                                        {String.fromCharCode(65 + optIndex)}){" "}
                                        {option.text}
                                    </Text>
                                ))}
                            </Space>
                        </div>
                    ))}
                </Space>
            </Card>
        </div>
    );
};
