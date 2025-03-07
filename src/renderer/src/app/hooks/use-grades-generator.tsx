import { updateSubmissionWithGrades } from '@noggin/shared/submission-utils'
import { Submission } from '@noggin/types/quiz-types'
import { useCallback } from 'react'

export function useGradesGenerator(libraryId: string, moduleSlug: string) {
    const gradeSubmission = useCallback(
        async (submission: Submission) => {
            const gradedSubmission = await window.api.generate.gradeSubmission(submission)
            const updatedSubmission = updateSubmissionWithGrades(submission, gradedSubmission)
            await window.api.modules.saveModuleSubmission(libraryId, moduleSlug, updatedSubmission)
            await window.api.practiceFeed.updateReviewSchedule(
                libraryId,
                moduleSlug,
                updatedSubmission
            )
            return updatedSubmission
        },
        [libraryId, moduleSlug]
    )

    return { gradeSubmission }
}
