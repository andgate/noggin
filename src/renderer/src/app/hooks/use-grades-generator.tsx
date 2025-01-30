import { Submission } from '@noggin/types/quiz-types'
import { useCallback } from 'react'
import { updateSubmissionWithGrades } from 'src/shared/submission-utils'

export function useGradesGenerator(moduleSlug: string) {
    const gradeSubmission = useCallback(
        async (submission: Submission) => {
            const gradedSubmission = await window.api.generate.gradeSubmission(submission)
            const updatedSubmission = updateSubmissionWithGrades(submission, gradedSubmission)
            await window.api.modules.saveModuleSubmission(moduleSlug, updatedSubmission)
            return updatedSubmission
        },
        [moduleSlug]
    )

    return { gradeSubmission }
}
