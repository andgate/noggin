import {
  createResponses,
  createSubmission,
  deleteResponse,
  deleteSubmission,
  getSubmissionDetailsByAttempt,
  getSubmissionWithResponses,
  getSubmissionsByModule,
  getSubmissionsByQuiz,
  updateResponse,
  updateSubmission,
  type DbResponse,
  type DbSubmission,
  type DbSubmissionWithQuizTitle,
} from '@noggin/api/submissionApi'
import type { TablesInsert, TablesUpdate } from '@noggin/types/database.types'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionKeys } from './query-keys'

type SubmissionWithResponses = {
  submission: DbSubmission
  responses: DbResponse[]
} | null

/**
 * Query options for fetching a specific submission attempt for a quiz.
 * @param quizId - The ID of the quiz.
 * @param attempt - The attempt number.
 */
export const submissionByAttemptQueryOptions = (quizId: string, attempt: number) =>
  queryOptions<SubmissionWithResponses, Error>({
    queryKey: submissionKeys.byQuizAttempt(quizId, attempt),
    queryFn: () => getSubmissionDetailsByAttempt(quizId, attempt),
    staleTime: 1000 * 60 * 5,
    enabled: !!quizId && !isNaN(attempt) && attempt > 0,
  })

/**
 * Query options for fetching submissions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const submissionsByQuizOptions = (quizId: string) =>
  queryOptions<DbSubmission[], Error>({
    queryKey: submissionKeys.listByQuiz(quizId),
    queryFn: () => getSubmissionsByQuiz(quizId),
    staleTime: 1000 * 60 * 5,
    enabled: !!quizId,
  })

/**
 * Hook to fetch submissions by module ID, including quiz titles.
 * @param moduleId The ID of the module.
 */
export const useGetSubmissionsByModule = (moduleId: string | null | undefined) => {
  return useQuery<DbSubmissionWithQuizTitle[], Error>({
    queryKey: submissionKeys.listByModule(moduleId!),
    queryFn: () => getSubmissionsByModule(moduleId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })
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
export const useGetSubmissionWithResponses = (submissionId: string | null | undefined) => {
  return useQuery<SubmissionWithResponses | null, Error>({
    queryKey: submissionKeys.detailWithResponses(submissionId!),
    queryFn: () => getSubmissionWithResponses(submissionId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!submissionId,
  })
}

/**
 * Hook to create a new submission.
 */
export const useCreateSubmission = () => {
  const queryClient = useQueryClient()
  type CreateSubmissionInput = {
    moduleId?: string
    quizId?: string
    submissionData: Omit<
      TablesInsert<'submissions'>,
      'user_id' | 'id' | 'created_at' | 'updated_at'
    >
  }

  return useMutation<DbSubmission | null, Error, CreateSubmissionInput>({
    mutationFn: (vars) => createSubmission(vars.submissionData),
    onSuccess: (newSubmission, variables) => {
      if (newSubmission) {
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
          queryClient.invalidateQueries({
            queryKey: submissionKeys.byQuizAttempt(variables.quizId, newSubmission.attempt_number),
          })
        }
        queryClient.setQueryData(submissionKeys.detail(newSubmission.id), newSubmission)
        queryClient.setQueryData(submissionKeys.detailWithResponses(newSubmission.id), {
          submission: newSubmission,
          responses: [],
        })
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
  type CreateResponsesInput = {
    submissionId: string
    responsesData: Omit<
      TablesInsert<'responses'>,
      'user_id' | 'id' | 'submission_id' | 'updated_at'
    >[]
  }

  return useMutation<DbResponse[] | null, Error, CreateResponsesInput>({
    mutationFn: (vars) => createResponses(vars.submissionId, vars.responsesData),
    onSuccess: (newResponses, variables) => {
      if (newResponses && newResponses.length > 0) {
        queryClient.invalidateQueries({
          queryKey: submissionKeys.detailWithResponses(variables.submissionId),
        })
      }
    },
    onError: (error, variables) => {
      console.error(`Error creating responses for submission ${variables.submissionId}:`, error)
    },
  })
}

/**
 * Hook to update an existing submission. Includes optimistic updates.
 */
export const useUpdateSubmission = () => {
  const queryClient = useQueryClient()
  type UpdateSubmissionInput = {
    submissionId: string
    moduleId?: string
    quizId?: string
    updates: TablesUpdate<'submissions'>
  }
  type UpdateSubmissionContext = {
    previousSubmission: DbSubmission | undefined
    previousSubmissionWithResponses: SubmissionWithResponses | undefined
    submissionId: string
    moduleId?: string
    quizId?: string
  }

  return useMutation<DbSubmission | null, Error, UpdateSubmissionInput, UpdateSubmissionContext>({
    mutationFn: (vars) => updateSubmission(vars.submissionId, vars.updates),
    onMutate: async ({ submissionId, moduleId, quizId, updates }) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.detail(submissionId) })
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      const previousSubmission = queryClient.getQueryData<DbSubmission>(
        submissionKeys.detail(submissionId)
      )
      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      if (previousSubmission) {
        queryClient.setQueryData<DbSubmission>(submissionKeys.detail(submissionId), {
          ...previousSubmission,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }
      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            submission: {
              ...previousSubmissionWithResponses.submission,
              ...updates,
              updated_at: new Date().toISOString(),
            },
          }
        )
      }

      return { previousSubmission, previousSubmissionWithResponses, submissionId, moduleId, quizId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating submission ${variables.submissionId}:`, err)
      if (context?.previousSubmission) {
        queryClient.setQueryData(
          submissionKeys.detail(context.submissionId),
          context.previousSubmission
        )
      }
      if (context?.previousSubmissionWithResponses) {
        queryClient.setQueryData(
          submissionKeys.detailWithResponses(context.submissionId),
          context.previousSubmissionWithResponses
        )
      }
    },
    onSettled: (_data, _error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByModule(context.moduleId) })
      }
      if (context?.quizId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(context.quizId) })
        if (context.previousSubmission) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.byQuizAttempt(
              context.quizId,
              context.previousSubmission.attempt_number
            ),
          })
        }
      }
    },
  })
}

/**
 * Hook to update an existing response. Includes optimistic updates.
 */
export const useUpdateResponse = () => {
  const queryClient = useQueryClient()
  type UpdateResponseInput = {
    responseId: string
    submissionId: string
    updates: TablesUpdate<'responses'>
  }
  type UpdateResponseContext = {
    previousSubmissionWithResponses: SubmissionWithResponses | undefined
    submissionId: string
    responseId: string
  }

  return useMutation<DbResponse | null, Error, UpdateResponseInput, UpdateResponseContext>({
    mutationFn: (vars) => updateResponse(vars.responseId, vars.updates),
    onMutate: async ({ responseId, submissionId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            responses: previousSubmissionWithResponses.responses.map((r) =>
              r.id === responseId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
            ),
          }
        )
      }

      return { previousSubmissionWithResponses, submissionId, responseId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating response ${variables.responseId}:`, err)
      if (context?.previousSubmissionWithResponses) {
        queryClient.setQueryData(
          submissionKeys.detailWithResponses(context.submissionId),
          context.previousSubmissionWithResponses
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
    },
  })
}

/**
 * Hook to delete a submission.
 */
export const useDeleteSubmission = () => {
  const queryClient = useQueryClient()
  type DeleteSubmissionInput = {
    submissionId: string
    moduleId?: string
    quizId?: string
    attemptNumber?: number
  }

  return useMutation<boolean, Error, DeleteSubmissionInput>({
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
        queryClient.removeQueries({
          queryKey: submissionKeys.detailWithResponses(variables.submissionId),
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
        queryClient.invalidateQueries({
          queryKey: submissionKeys.detailWithResponses(variables.submissionId),
        })
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
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
    },
  })
}

/**
 * Hook to delete a response. Includes optimistic update.
 */
export const useDeleteResponse = () => {
  const queryClient = useQueryClient()
  type DeleteResponseInput = {
    responseId: string
    submissionId: string
  }
  type DeleteResponseContext = {
    previousSubmissionWithResponses: SubmissionWithResponses | undefined
    submissionId: string
    responseId: string
  }

  return useMutation<boolean, Error, DeleteResponseInput, DeleteResponseContext>({
    mutationFn: (vars) => deleteResponse(vars.responseId),
    onMutate: async ({ responseId, submissionId }) => {
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            responses: previousSubmissionWithResponses.responses.filter((r) => r.id !== responseId),
          }
        )
      }

      return { previousSubmissionWithResponses, submissionId, responseId }
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting response ${variables.responseId}:`, err)
      if (context?.previousSubmissionWithResponses) {
        queryClient.setQueryData(
          submissionKeys.detailWithResponses(context.submissionId),
          context.previousSubmissionWithResponses
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
    },
  })
}
