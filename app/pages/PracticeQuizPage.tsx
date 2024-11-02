import { Typography, Card, Space, Button } from "antd";
import { useNavigate } from "@tanstack/react-router";

const { Title, Text } = Typography;

export const PracticeQuizPage = () => {
    const navigate = useNavigate({ from: "/quiz/practice" });

    const handleSubmit = () => {
        navigate({ to: "/quiz/results" });
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Title level={2}>Practice Quiz</Title>

                    <div>
                        <Text strong>Question 1 of 10</Text>
                        <Text>
                            {" "}
                            What is the primary purpose of React hooks?
                        </Text>
                    </div>

                    <Space direction="vertical">
                        <Button style={{ textAlign: "left", width: "100%" }}>
                            A) To manage component lifecycle
                        </Button>
                        <Button style={{ textAlign: "left", width: "100%" }}>
                            B) To handle routing in React applications
                        </Button>
                        <Button style={{ textAlign: "left", width: "100%" }}>
                            C) To style React components
                        </Button>
                        <Button style={{ textAlign: "left", width: "100%" }}>
                            D) To optimize React performance
                        </Button>
                    </Space>

                    <Button type="primary" onClick={handleSubmit}>
                        Submit Quiz
                    </Button>
                </Space>
            </Card>
        </div>
    );
};
