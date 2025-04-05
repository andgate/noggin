import { Button, Container, Group, Stack } from '@mantine/core'
import { Submission } from '@noggin/types/quiz-types'
import { useGradesGenerator } from '@renderer/app/hooks/use-grades-generator'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { SubmissionGradeInfo } from './components/SubmissionGradeInfo'
import { SubmissionResponseCard } from './components/SubmissionResponseCard'

interface SubmissionPageProps {
    libraryId: string
    moduleId: string
    submission: Submission
}

export function SubmissionPage({ libraryId, moduleId, submission }: SubmissionPageProps) {
    const { gradeSubmission } = useGradesGenerator(libraryId, moduleId)
    const router = useRouter()
    const [isGrading, setIsGrading] = useState(false)

    // Define which header actions to enable
    const headerActions: HeaderAction[] = ['explorer', 'settings']

    const handleGradeSubmission = async () => {
        setIsGrading(true)
        try {
            await gradeSubmission(submission)
            router.invalidate()
        } catch (error) {
            console.error('Failed to grade submission:', error)
        } finally {
            setIsGrading(false)
        }
    }

    const pageTitle = `${submission.quizTitle} - Attempt ${submission.attemptNumber}`

    return (
        <Stack h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
            <AppHeader title={pageTitle} actions={headerActions} />

            <Container size="md" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                <Stack gap="md">
                    <Group justify="flex-end">
                        <Button color="blue" onClick={handleGradeSubmission} loading={isGrading}>
                            Grade Submission
                        </Button>
                    </Group>

                    <SubmissionGradeInfo submission={submission} />

                    <Stack gap="md">
                        {submission.responses.map((response, index) => (
                            <SubmissionResponseCard key={index} response={response} index={index} />
                        ))}
                    </Stack>
                </Stack>
            </Container>
        </Stack>
    )
}
