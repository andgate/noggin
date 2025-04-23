import { useQuiz } from '@/core/hooks/useQuizHooks'
import { useUpdateResponse, useUpdateSubmission } from '@/core/hooks/useSubmissionHooks'
import { Submission } from '@/core/types/submission.types'
import { Alert, Button } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'

interface GradeSubmissionButtonProps {
  submission: Submission // Use Submission View Type
}

export const GradeSubmissionButton = ({ submission }: GradeSubmissionButtonProps) => {
  const [isGrading, setIsGrading] = useState(false) // Local loading state
  const [gradingError, setGradingError] = useState<string | null>(null) // Local error state

  const quizQuery = useQuiz(submission.quizId)

  // Get mutation hooks for updating DB
  const updateSubmissionMutation = useUpdateSubmission()
  const updateResponseMutation = useUpdateResponse()

  const handleGradeSubmission = async () => {
    if (!quizQuery.data?.questions) {
      notifications.show({ title: 'Error', message: 'Quiz questions not loaded.', color: 'red' })
      return
    }
    if (!submission.responses) {
      notifications.show({
        title: 'Error',
        message: 'Submission responses not loaded.',
        color: 'red',
      })
      return
    }

    setIsGrading(true)
    setGradingError(null)

    try {
      // 1. Call AI Service to get grading results
      const aiGradingResult: GeneratedGrades = await gradeSubmission({
        apiKey: '',
        // Pass the Submission View Type (which includes responses)
        submission: submission,
      })

      console.log('AI Grading successful:', aiGradingResult)

      // 2. Prepare updates for database based on AI results
      const submissionUpdatePayload: UpdateSubmissionHookInput['updates'] = {
        status: 'graded', // Mark as graded
        grade_percent:
          aiGradingResult.totalScore !== undefined && quizQuery.data.questions.length > 0
            ? Math.round((aiGradingResult.totalScore / quizQuery.data.questions.length) * 100)
            : null, // Calculate percentage
        // letter_grade: calculateLetterGrade(gradePercent), // Calculate letter grade if needed
      }

      // Map AI responses to DB update payloads
      const responseUpdatePromises = aiGradingResult.responses.map((aiResponse) => {
        // Find the original response ID using the question text match (or ideally questionId if AI provided it)
        const originalQuestion = quizQuery.data?.questions.find(
          (q) => q.questionText === aiResponse.question
        )
        const originalResponse = submission.responses.find(
          (r) => r.questionId === originalQuestion?.id
        )

        if (!originalResponse) {
          console.warn(
            `Could not find original response matching AI graded question: "${aiResponse.question}". Skipping update for this response.`
          )
          return Promise.resolve() // Skip update if no match found
        }

        const responseUpdatePayload: UpdateResponseHookInput['updates'] = {
          feedback: aiResponse.feedback,
          is_correct: aiResponse.isCorrect,
          // graded_at will be set by the API/hook
        }
        // Call the update mutation for each response
        return updateResponseMutation.mutateAsync({
          responseId: originalResponse.id,
          submissionId: submission.id, // Pass submissionId for context if needed by hook
          updates: responseUpdatePayload,
        })
      })

      // 3. Execute DB Updates
      // Update all responses first, then the overall submission
      await Promise.all(responseUpdatePromises)

      // Update the main submission record
      await updateSubmissionMutation.mutateAsync({
        submissionId: submission.id,
        updates: submissionUpdatePayload,
      })

      notifications.show({
        title: 'Success',
        message: 'Submission graded and updated.',
        color: 'green',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred during grading.'
      console.error('Failed to grade submission:', error)
      setGradingError(message)
      notifications.show({ title: 'Grading Failed', message, color: 'red' })
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <>
      {/* Use local error state */}
      {gradingError && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Grading Error"
          color="red"
          withCloseButton
          onClose={() => setGradingError(null)} // Clear local error
        >
          {gradingError}
        </Alert>
      )}

      <Button
        color="blue"
        onClick={handleGradeSubmission}
        loading={isGrading} // Use local loading state
        disabled={!quizQuery.data?.questions || isGrading || submission.status === 'graded'} // Disable if already graded
      >
        {isGrading
          ? 'Grading...'
          : submission.status === 'graded'
            ? 'Already Graded'
            : 'Grade with AI'}
      </Button>
    </>
  )
}
