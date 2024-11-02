import { Typography, Card, Space } from "antd";

const { Title, Text } = Typography;

export const QuizResultsPage = () => {
    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Title level={2}>Quiz Results</Title>

                    <div>
                        <Title level={4}>Score: 8/10</Title>
                        <Text>Time taken: 12 minutes</Text>
                    </div>

                    <Space direction="vertical">
                        <Text strong>Question 1: Correct</Text>
                        <Text>What is the capital of France?</Text>
                        <Text type="success">Your answer: Paris</Text>

                        <Text strong>Question 2: Incorrect</Text>
                        <Text>
                            What is the largest planet in our solar system?
                        </Text>
                        <Text type="danger">Your answer: Saturn</Text>
                        <Text type="success">Correct answer: Jupiter</Text>
                    </Space>
                </Space>
            </Card>
        </div>
    );
};
