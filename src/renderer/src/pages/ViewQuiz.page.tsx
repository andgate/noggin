// TODO: Add submission history section
// TODO: Implement submission statistics visualization
// TODO: Add filtering/sorting for submissions
// TODO: Consider adding export functionality for submission data
// TODO: Implement SSR for quiz and submission data
// TODO: Add loading states for dynamic content
// TODO: Add error boundaries for failed quiz loads
// TODO: Implement retry mechanism for failed data fetches
// TODO: Add fallback UI for partial quiz data
// TODO: Implement progressive enhancement for statistics
// TODO: Add error recovery for failed quiz renders
// TODO: Add quiz metadata (created date, attempts, avg score)
// TODO: Add quiz description/instructions section
// TODO: Add ability to view sources (new page or as a panel
// TODO: Add pagination for submissions
// TODO: Add submission performance trends

import { Button, Card, Grid, Stack, Text, Title } from '@mantine/core'
import { Question, Quiz, Submission } from '@noggin/types/quiz-types'
import { useNavigate } from '@tanstack/react-router'

const QuizQuestionPreview: React.FC<{ question: Question; index: number }> = ({
    question,
    index,
}) => {
    const isMultipleChoice = question.questionType === 'multiple_choice'
    let choiceList = <Text fs="italic">Written response.</Text>
    if (isMultipleChoice && question.choices) {
        choiceList = (
            <Stack gap="xs">
                {question.choices.map((choice) => (
                    <Text key={choice.id}>• {choice.optionText}</Text>
                ))}
            </Stack>
        )
    }

    return (
        <div key={question.id}>
            <div>
                <Text fw={700}>Question {index + 1}:</Text>
                <Text> {question.question}</Text>
            </div>

            {choiceList}
        </div>
    )
}

// TODO: Add loading states for quiz preview
// TODO: Add error boundary for quiz preview
const QuizPreview: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    return (
        <Stack gap="md">
            {quiz.questions.map((question, index) => (
                <QuizQuestionPreview key={index} question={question} index={index} />
            ))}
        </Stack>
    )
}

const SubmissionsList: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
    return (
        <Stack gap="md">
            <Title order={3}>Recent Submissions</Title>
            {submissions.map((submission) => (
                <Card key={submission.id} withBorder padding="sm">
                    <Stack gap="xs">
                        <Text size="sm">
                            Grade: {submission.grade ?? 'Pending'}
                            {submission.letterGrade && ` (${submission.letterGrade})`}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Completed: {new Date(submission.completedAt).toLocaleDateString()}
                        </Text>
                        <Text size="sm">Time: {Math.round(submission.timeElapsed / 1000)}s</Text>
                    </Stack>
                </Card>
            ))}
        </Stack>
    )
}

export const ViewQuizPage: React.FC<{ quiz: Quiz; submissions: Submission[] }> = ({
    quiz,
    submissions,
}) => {
    const navigate = useNavigate({ from: '/quiz/view/$quizId' })

    return (
        <div style={{ padding: '24px' }} data-testid="quiz-view-page">
            <Grid gutter="md">
                <Grid.Col span={8}>
                    <Card withBorder padding="md">
                        <Stack gap="lg" data-testid="quiz-questions-list">
                            <Title order={2}>{quiz.title}</Title>

                            <Button
                                onClick={() =>
                                    navigate({
                                        to: '/quiz/practice/$quizId',
                                        params: { quizId: `${quiz.id}` },
                                    })
                                }
                            >
                                Practice Quiz
                            </Button>

                            <QuizPreview quiz={quiz} />
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={4}>
                    <Card withBorder padding="md" style={{ position: 'sticky', top: 24 }}>
                        <SubmissionsList submissions={submissions} />
                    </Card>
                </Grid.Col>
            </Grid>
        </div>
    )
}
