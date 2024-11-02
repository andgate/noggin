import { UploadOutlined } from "@ant-design/icons";
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
    Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState } from "react";
import { createQuiz } from "../services/quizzes-service";
import { NewQuiz } from "drizzle/schema";
import { generateQuiz } from "../services/generate-quiz";

const { TextArea } = Input;
const { Title } = Typography;

interface QuizFormData {
    title: string;
    source: string;
    questionCount: number;
    questionTypes: string[];
    url?: string;
}

export const CreateQuizPage: React.FC = () => {
    const navigate = useNavigate({ from: "/quiz/create" });
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: QuizFormData) => {
        setLoading(true);
        try {
            const newQuiz: NewQuiz = {
                ...values,
            };
            const generatedQuiz = await generateQuiz(newQuiz);
            const createdQuiz = await createQuiz(generatedQuiz);
            const createQuizId = createdQuiz?.id;
            navigate({ to: `/quiz/view/${createQuizId}` });
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
                        name="title"
                        label="Quiz Title"
                        rules={[
                            {
                                required: true,
                                message: "Please enter a quiz title",
                            },
                        ]}
                    >
                        <Input placeholder="Enter quiz title" />
                    </Form.Item>

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

                    <Form.Item label="Upload Files">
                        <Upload
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>
                                Select File
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="url" label="URL (Optional)">
                        <Input placeholder="Enter webpage URL to extract content" />
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
