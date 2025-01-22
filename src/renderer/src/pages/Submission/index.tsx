import { Button, Container, Group, Stack, Title } from '@mantine/core'
import { Submission } from '@noggin/types/quiz-types'
import { useGradesGenerator } from '@renderer/app/hooks/use-grades-generator'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { SubmissionGradeInfo } from './components/SubmissionGradeInfo'
import { SubmissionResponseCard } from './components/SubmissionResponseCard'

interface SubmissionPageProps {
    moduleId: string
    submission: Submission
}

function SubmissionPage({ moduleId, submission }: SubmissionPageProps) {
    const { gradeSubmission } = useGradesGenerator(moduleId)
    const router = useRouter()
    const navigate = useNavigate()
    const [isGrading, setIsGrading] = useState(false)

    const handleGradeSubmission = async () => {
        setIsGrading(true)
        try {
            await gradeSubmission(submission)
            await router.invalidate()
        } catch (error) {
            console.error('Failed to grade submission:', error)
        } finally {
            setIsGrading(false)
        }
    }

    return (
        <Container size="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Button
                        onClick={() =>
                            navigate({ to: '/module/view/$moduleId', params: { moduleId } })
                        }
                        leftSection={<IconArrowLeft />}
                        variant="subtle"
                    >
                        Back to Module
                    </Button>

                    <Button color="blue" onClick={handleGradeSubmission} loading={isGrading}>
                        Grade Submission
                    </Button>
                </Group>

                <Title order={2}>{submission.quizTitle}</Title>

                <SubmissionGradeInfo submission={submission} />

                <Stack gap="md">
                    {submission.responses.map((response, index) => (
                        <SubmissionResponseCard key={index} response={response} index={index} />
                    ))}
                </Stack>
            </Stack>
        </Container>
    )
}

export default SubmissionPage
