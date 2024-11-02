import React from "react";
import { Button, List, Card, Space, Typography, Popconfirm, Tag } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Quiz } from "drizzle/schema";

const { Title } = Typography;

const DashboardPage: React.FC<{ quizzes: Quiz[] }> = ({ quizzes }) => {
    const navigate = useNavigate({ from: "/" });

    const handleCreateQuiz = () => {
        navigate({ to: "/quiz/create" });
    };

    const handleEditQuiz = (quizId?: string) => {
        if (!quizId) return;
        navigate({ to: `/quiz/edit/${quizId}` });
    };

    const handleStartQuiz = (quizId?: string) => {
        if (!quizId) return;
        navigate({ to: `/quiz/practice/${quizId}` });
    };

    const handleDeleteQuiz = (quizId?: string) => {
        if (!quizId) return;
        console.log("Deleting quiz:", quizId);
    };

    const getStatusColor = (status: Quiz["status"]) => {
        const colors = {
            Completed: "success",
            "In Progress": "processing",
            Draft: "default",
        };
        return colors[status];
    };

    return (
        <div style={{ padding: "24px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <Title level={2}>My Quizzes</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleCreateQuiz}
                >
                    Create Quiz
                </Button>
            </div>

            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={[...quizzes]}
                renderItem={(quiz) => (
                    <List.Item>
                        <Card
                            hoverable
                            actions={[
                                <Button
                                    key="start"
                                    type="link"
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => handleStartQuiz(quiz.id)}
                                >
                                    Start
                                </Button>,
                                <Button
                                    key="edit"
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditQuiz(quiz.id)}
                                >
                                    Edit
                                </Button>,
                                <Popconfirm
                                    key="delete"
                                    title="Delete this quiz?"
                                    description="This action cannot be undone."
                                    onConfirm={() => handleDeleteQuiz(quiz.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                    >
                                        Delete
                                    </Button>
                                </Popconfirm>,
                            ]}
                        >
                            <Card.Meta
                                title={quiz.title}
                                description={
                                    <Space direction="vertical">
                                        <div>
                                            {quiz.questionCount} Questions
                                        </div>
                                        <div>
                                            Created:{" "}
                                            {new Date(
                                                quiz.dateCreated,
                                            ).toLocaleDateString()}
                                        </div>
                                        <Tag
                                            color={getStatusColor(quiz.status)}
                                        >
                                            {quiz.status}
                                        </Tag>
                                    </Space>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default DashboardPage;
