import { ActionIcon, Button, Card, Grid, Group, Menu, Modal, Stack, Title } from '@mantine/core'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { IconClipboardList, IconEye, IconMenu2 } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AttemptsHistory } from './components/AttemptsHistory'
import { QuestionList } from './components/QuestionList'

export type QuizPageProps = {
    libraryId: string
    moduleId: string
    quiz: Quiz
    submissions: Submission[]
}

export function QuizPage({ libraryId, moduleId, quiz, submissions }: QuizPageProps) {
    const navigate = useNavigate()
    const [attemptsModalOpen, setAttemptsModalOpen] = useState(false)

    // Define which header actions to enable
    const headerActions: HeaderAction[] = ['explorer', 'settings']

    if (!libraryId) {
        throw new Error('Library ID is required')
    }

    return (
        <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
            <AppHeader title={quiz.title} actions={headerActions} />

            <Grid p="md" style={{ flex: 1 }}>
                {/* Main content: Quiz */}
                <Grid.Col span={12}>
                    <Card
                        shadow="md"
                        radius="sm"
                        withBorder
                        style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
                        bg="dark.7"
                    >
                        <Card.Section withBorder inheritPadding py="xs" bg="dark.8">
                            <Group justify="space-between">
                                <Title order={3}>{quiz.title}</Title>

                                <Group gap="xs">
                                    <Button
                                        variant="filled"
                                        color="purple"
                                        leftSection={<IconClipboardList size={16} />}
                                        onClick={() =>
                                            navigate({
                                                to: '/quiz/session/$libraryId/$moduleId/$quizId',
                                                params: { libraryId, moduleId, quizId: quiz.id },
                                            })
                                        }
                                    >
                                        Start Quiz
                                    </Button>

                                    <Menu position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="filled" size="md" color="purple">
                                                <IconMenu2 size={20} />
                                            </ActionIcon>
                                        </Menu.Target>

                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconEye size={16} />}
                                                onClick={() => setAttemptsModalOpen(true)}
                                            >
                                                View Attempts History
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Group>
                        </Card.Section>

                        <Stack gap="md" p="md">
                            <QuestionList questions={quiz.questions} />
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Attempts Modal */}
            <Modal
                opened={attemptsModalOpen}
                onClose={() => setAttemptsModalOpen(false)}
                title="Quiz Attempts"
                size="lg"
            >
                <AttemptsHistory
                    submissions={submissions}
                    libraryId={libraryId}
                    moduleId={moduleId}
                    quizId={quiz.id}
                    onClose={() => setAttemptsModalOpen(false)}
                />
            </Modal>
        </Stack>
    )
}
