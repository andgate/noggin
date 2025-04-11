import { ActionIcon, Button, Card, Grid, Group, Menu, Modal, Stack, Title } from '@mantine/core'
import { AppHeader, HeaderAction } from '@noggin/components/layout/AppHeader'
import { Route } from '@noggin/routes/quiz/view.$libraryId.$moduleId.$quizId'
import type { Tables } from '@noggin/types/database.types'
import { IconClipboardList, IconEye, IconMenu2 } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AttemptsHistory } from './components/AttemptsHistory'
import { QuestionList } from './components/QuestionList'

// Define types using Tables utility
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>

export type QuizPageProps = {
  // libraryId: string // Removed, get from params
  // moduleId: string // Removed, get from params
  quiz: DbQuiz
  questions: DbQuestion[]
  submissions: DbSubmission[]
}

export function QuizPage({ quiz, questions, submissions }: QuizPageProps) {
  const navigate = useNavigate()
  // Get params from the route context
  const { libraryId, moduleId } = Route.useParams()
  const [attemptsModalOpen, setAttemptsModalOpen] = useState(false)

  // Define which header actions to enable
  const headerActions: HeaderAction[] = ['explorer', 'settings']

  // Params are guaranteed by the route structure, but good practice to check if needed elsewhere
  // if (!libraryId || !moduleId) {
  //     throw new Error('Library ID and Module ID are required from route params');
  // }

  return (
    <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Use quiz.title from the new prop */}
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
                {/* Use quiz.title */}
                <Title order={3}>{quiz.title}</Title>

                <Group gap="xs">
                  <Button
                    variant="filled"
                    color="purple"
                    leftSection={<IconClipboardList size={16} />}
                    onClick={() =>
                      navigate({
                        to: '/quiz/session/$libraryId/$moduleId/$quizId',
                        // Use params and quiz.id
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
              {/* Pass questions prop */}
              <QuestionList questions={questions} />
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
        {/* Pass submissions and libraryId */}
        <AttemptsHistory
          submissions={submissions}
          libraryId={libraryId}
          // moduleId={moduleId} // Not needed by AttemptsHistory anymore
          // quizId={quiz.id} // Not needed by AttemptsHistory anymore
          onClose={() => setAttemptsModalOpen(false)}
        />
      </Modal>
    </Stack>
  )
}
