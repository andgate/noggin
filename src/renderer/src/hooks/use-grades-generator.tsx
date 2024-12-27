import { updateSubmissionWithGrades } from '@noggin/common/submission-utils'
import { Submission } from '@noggin/types/quiz-types'
import { useCallback } from 'react'

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
