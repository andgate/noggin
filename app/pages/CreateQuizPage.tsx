import { useNavigate } from "@tanstack/react-router";
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Typography,
} from "antd";
import { useState } from "react";
import { createQuiz } from "../services/quiz-service";
import { generateQuiz } from "../services/quiz-generation-service";

const { TextArea } = Input;
const { Title } = Typography;

interface QuizFormData {
    content: string;
    questionCount: number;
    questionTypes: string[];
}

export const CreateQuizPage: React.FC = () => {
    const navigate = useNavigate({ from: "/quiz/create" });
    const [form] = Form.useForm<QuizFormData>();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: QuizFormData) => {
        setLoading(true);
        try {
            const generatedQuiz = await generateQuiz({
                questionCount: values.questionCount,
                questionTypes: values.questionTypes,
                source: values.content,
            });
            const newQuizId = await createQuiz(generatedQuiz);
            navigate({ to: `/quiz/view/${newQuizId}` });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
            <Card>
                <Title level={2}>Create New Quiz</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        questionCount: 10,
                        questionTypes: ["multiple-choice"],
                    }}
                >
                    <Form.Item
                        name="content"
                        label="Study Content"
                        rules={[
                            {
                                required: true,
                                message: "Please enter study content",
                            },
                        ]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="Paste your study material here"
                        />
                    </Form.Item>

                    <Space size="large">
                        <Form.Item
                            name="questionCount"
                            label="Number of Questions"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={1} max={50} />
                        </Form.Item>

                        <Form.Item
                            name="questionTypes"
                            label="Question Types"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="multiple"
                                style={{ width: 250 }}
                                options={[
                                    {
                                        label: "Multiple Choice",
                                        value: "multiple-choice",
                                    },
                                    {
                                        label: "Written Answer",
                                        value: "written",
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Generate Quiz
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateQuizPage;
