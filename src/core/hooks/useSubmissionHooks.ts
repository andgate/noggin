import {
  createResponses,
  createSubmission,
  deleteResponse,
  deleteSubmission,
  getSubmission,
  getSubmissionsByModule,
  getSubmissionsByQuiz,
  updateResponse,
  updateSubmission,
  type CreateResponseInput,
  type CreateSubmissionInput,
  type UpdateResponseInput,
  type UpdateSubmissionInput,
} from '@/core/api/submissionApi'
import { GradedResponse, Response } from '@/core/types/response.types'
import { Submission } from '@/core/types/submission.types'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionKeys } from './query-keys'

// --- Exported Hook Input/Context Types ---

export type CreateSubmissionHookInput = {
  submissionData: CreateSubmissionInput
}

export type CreateResponsesHookInput = {
  submissionId: string
  responsesData: CreateResponseInput[]
}

export type UpdateSubmissionHookInput = {
  submissionId: string
  updates: UpdateSubmissionInput
}

export type UpdateSubmissionHookContext = {
  previousSubmission: Submission | undefined
  submissionId: string
}

export type UpdateResponseHookInput = {
  responseId: string
  submissionId: string
  updates: UpdateResponseInput
}

export type UpdateResponseContext = {
  previousSubmission: Submission | undefined
  submissionId: string
  responseId: string
}

export type DeleteSubmissionHookInput = {
  submissionId: string
  moduleId?: string // Optional for invalidation
  quizId?: string // Optional for invalidation
  attemptNumber?: number // Optional for invalidation
}

export type DeleteResponseHookInput = {
  responseId: string
  submissionId: string
}

export type DeleteResponseHookContext = {
  previousSubmission: Submission | undefined
  submissionId: string
  responseId: string
}

// --- Query Options ---

/**
 * Query options for fetching a specific submission attempt for a quiz.
 * NOTE: This currently fetches *all* submissions for the quiz and filters.
 * Consider optimizing with a dedicated API function if performance becomes an issue.
 * @param quizId - The ID of the quiz.
 * @param attempt - The attempt number.
 */
export const submissionByIdQueryOptions = (submissionId: string) =>
  queryOptions<Submission | null, Error>({
    queryKey: submissionKeys.byId(submissionId),
    queryFn: () => getSubmission(submissionId),
    staleTime: 1000 * 60 * 5,
    enabled: !!submissionId,
  })

/**
 * Query options for fetching submissions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const submissionsByQuizOptions = (quizId: string) =>
  queryOptions<Submission[], Error>({
    queryKey: submissionKeys.listByQuiz(quizId),
    queryFn: () => getSubmissionsByQuiz(quizId),
    staleTime: 1000 * 60 * 5,
    enabled: !!quizId,
  })

/**
 * Query options for fetching submissions by module ID.
 * @param moduleId The ID of the module.
 */
export const submissionsByModuleQueryOptions = (moduleId: string) =>
  queryOptions<Submission[], Error>({
    queryKey: submissionKeys.listByModule(moduleId),
    queryFn: () => getSubmissionsByModule(moduleId),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })

// --- Hooks ---

/**
 * Hook to fetch submissions by module ID.
 * @param moduleId The ID of the module.
 */
export const useGetSubmissionsByModule = (moduleId: string | null | undefined) => {
  return useQuery(submissionsByModuleQueryOptions(moduleId!))
}

/**
 * Hook to fetch submissions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const useGetSubmissionsByQuiz = (quizId: string | null | undefined) => {
  return useQuery(submissionsByQuizOptions(quizId!))
}

/**
 * Hook to fetch a single submission with its responses by submission ID.
 * @param submissionId The ID of the submission.
 */
export const useSubmission = (submissionId: string | null | undefined) => {
  return useQuery(submissionByIdQueryOptions(submissionId!))
}

/**
 * Hook to create a new submission.
 */
export const useCreateSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation<Submission | null, Error, CreateSubmissionHookInput>({
    mutationFn: (vars) => createSubmission(vars.submissionData),
    onSuccess: (newSubmission) => {
      if (newSubmission) {
        queryClient.invalidateQueries({
          queryKey: submissionKeys.listByModule(newSubmission.moduleId),
        })
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(newSubmission.quizId) })
        queryClient.invalidateQueries({
          queryKey: submissionKeys.byQuizAttempt(newSubmission.quizId, newSubmission.attemptNumber),
        })
        queryClient.setQueryData(submissionKeys.detail(newSubmission.id), newSubmission)
      }
    },
    onError: (error) => {
      console.error('Error creating submission:', error)
    },
  })
}

/**
 * Hook to create multiple responses for a submission.
 */
export const useCreateResponses = () => {
  const queryClient = useQueryClient()

  return useMutation<Response[] | null, Error, CreateResponsesHookInput>({
    mutationFn: (vars) => createResponses(vars.submissionId, vars.responsesData),
    onSuccess: (newResponses, variables) => {
      if (newResponses && newResponses.length > 0) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
      }
    },
    onError: (error, variables) => {
      console.error(`Error creating responses for submission ${variables.submissionId}:`, error)
    },
  })
}

/**
 * Hook to update an existing submission (e.g., grading). Includes optimistic updates.
 */
export const useUpdateSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation<
    Submission | null,
    Error,
    UpdateSubmissionHookInput,
    UpdateSubmissionHookContext
  >({
    mutationFn: (vars) => updateSubmission(vars.submissionId, vars.updates),
    onMutate: async ({ submissionId, updates }) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.detail(submissionId) })
      const previousSubmission = queryClient.getQueryData<Submission>(
        submissionKeys.detail(submissionId)
      )
      if (previousSubmission) {
        const newStatus = updates.status
          ? (updates.status as 'pending' | 'graded')
          : previousSubmission.status
        queryClient.setQueryData<Submission>(submissionKeys.detail(submissionId), {
          ...previousSubmission,
          gradePercent: updates.grade_percent ?? previousSubmission.gradePercent,
          letterGrade: updates.letter_grade ?? previousSubmission.letterGrade,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        })
      }
      return { previousSubmission, submissionId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating submission ${variables.submissionId}:`, err)
      if (context?.previousSubmission) {
        queryClient.setQueryData(
          submissionKeys.detail(context.submissionId),
          context.previousSubmission
        )
      }
    },
    onSettled: (_data, _error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
      if (context?.previousSubmission) {
        queryClient.invalidateQueries({
          queryKey: submissionKeys.listByModule(context.previousSubmission.moduleId),
        })
        queryClient.invalidateQueries({
          queryKey: submissionKeys.listByQuiz(context.previousSubmission.quizId),
        })
        queryClient.invalidateQueries({
          queryKey: submissionKeys.byQuizAttempt(
            context.previousSubmission.quizId,
            context.previousSubmission.attemptNumber
          ),
        })
      }
    },
  })
}

/**
 * Hook to update an existing response (e.g., grading). Includes optimistic updates.
 */
export const useUpdateResponse = () => {
  const queryClient = useQueryClient()

  return useMutation<Response | null, Error, UpdateResponseHookInput, UpdateResponseContext>({
    mutationFn: (vars) => updateResponse(vars.responseId, vars.updates),
    onMutate: async ({ responseId, submissionId, updates }) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.detail(submissionId) })
      const previousSubmission = queryClient.getQueryData<Submission>(
        submissionKeys.detail(submissionId)
      )
      if (previousSubmission) {
        queryClient.setQueryData<Submission>(submissionKeys.detail(submissionId), {
          ...previousSubmission,
          responses: previousSubmission.responses.map((r): Response => {
            if (r.id !== responseId) return r
            const updatedGradedResponse: GradedResponse = {
              ...r,
              status: 'graded',
              feedback: updates.feedback ?? (r.status === 'graded' ? r.feedback : null),
              isCorrect: updates.is_correct ?? (r.status === 'graded' ? r.isCorrect : null),
              gradedAt: new Date().toISOString(),
              id: r.id,
              submissionId: r.submissionId,
              questionId: r.questionId,
              userId: r.userId,
              studentAnswerText: r.studentAnswerText,
            }
            return updatedGradedResponse
          }),
        })
      }
      return { previousSubmission, submissionId, responseId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating response ${variables.responseId}:`, err)
      if (context?.previousSubmission) {
        queryClient.setQueryData(
          submissionKeys.detail(context.submissionId),
          context.previousSubmission
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
    },
  })
}

/**
 * Hook to delete a submission.
 */
export const useDeleteSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, DeleteSubmissionHookInput>({
    mutationFn: (vars) => deleteSubmission(vars.submissionId),
    onSuccess: (success, variables) => {
      if (success) {
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
          if (variables.attemptNumber) {
            queryClient.invalidateQueries({
              queryKey: submissionKeys.byQuizAttempt(variables.quizId, variables.attemptNumber),
            })
          }
        }
        queryClient.removeQueries({
          queryKey: submissionKeys.detail(variables.submissionId),
          exact: true,
        })
      } else {
        console.error(`Failed to delete submission ${variables.submissionId}, API returned false.`)
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
          if (variables.attemptNumber) {
            queryClient.invalidateQueries({
              queryKey: submissionKeys.byQuizAttempt(variables.quizId, variables.attemptNumber),
            })
          }
        }
        queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting submission ${variables.submissionId}:`, error)
      if (variables.moduleId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByModule(variables.moduleId) })
      }
      if (variables.quizId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
        if (variables.attemptNumber) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.byQuizAttempt(variables.quizId, variables.attemptNumber),
          })
        }
      }
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
    },
  })
}

/**
 * Hook to delete a response. Includes optimistic update.
 */
export const useDeleteResponse = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, DeleteResponseHookInput, DeleteResponseHookContext>({
    mutationFn: (vars) => deleteResponse(vars.responseId),
    onMutate: async ({ responseId, submissionId }) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.detail(submissionId) })
      const previousSubmission = queryClient.getQueryData<Submission>(
        submissionKeys.detail(submissionId)
      )
      if (previousSubmission) {
        queryClient.setQueryData<Submission>(submissionKeys.detail(submissionId), {
          ...previousSubmission,
          responses: previousSubmission.responses.filter((r) => r.id !== responseId),
        })
      }
      return { previousSubmission, submissionId, responseId }
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting response ${variables.responseId}:`, err)
      if (context?.previousSubmission) {
        queryClient.setQueryData(
          submissionKeys.detail(context.submissionId),
          context.previousSubmission
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
    },
  })
}
