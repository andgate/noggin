import { Link } from "@tanstack/react-router";
import { Button, Space, Typography } from "antd";

export function NotFound({ children }: { children?: any }) {
    return (
        <Space direction="vertical" style={{ padding: 16 }}>
            <Typography.Text type="secondary">
                {children || (
                    <p>The page you are looking for does not exist.</p>
                )}
            </Typography.Text>
            <Space wrap>
                <Button type="primary" onClick={() => window.history.back()}>
                    Go back
                </Button>
                <Link to="/">
                    <Button type="primary">Start Over</Button>
                </Link>
            </Space>
        </Space>
    );
}
