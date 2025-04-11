// src/renderer/src/hooks/useSubmissionHooks.ts
import {
  createResponses,
  createSubmission,
  deleteResponse,
  deleteSubmission,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionKeys } from './query-keys'

// Type for the detailed submission data (submission + responses)
type SubmissionWithResponses = {
  submission: DbSubmission
  responses: DbResponse[]
}

/**
 * Hook to fetch submissions by module ID, including quiz titles.
 * @param moduleId The ID of the module.
 */
export const useGetSubmissionsByModule = (moduleId: string | null | undefined) => {
  // Update the return type here
  return useQuery<DbSubmissionWithQuizTitle[], Error>({
    queryKey: submissionKeys.listByModule(moduleId!),
    queryFn: () => getSubmissionsByModule(moduleId!), // This function now returns the enriched type
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Only run if moduleId is provided
  })
}

/**
 * Hook to fetch submissions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const useGetSubmissionsByQuiz = (quizId: string | null | undefined) => {
  return useQuery<DbSubmission[], Error>({
    queryKey: submissionKeys.listByQuiz(quizId!),
    queryFn: () => getSubmissionsByQuiz(quizId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!quizId, // Only run if quizId is provided
  })
}

/**
 * Hook to fetch a single submission with its responses by submission ID.
 * @param submissionId The ID of the submission.
 */
export const useGetSubmissionWithResponses = (submissionId: string | null | undefined) => {
  return useQuery<SubmissionWithResponses | null, Error>({
    queryKey: submissionKeys.detailWithResponses(submissionId!),
    queryFn: () => getSubmissionWithResponses(submissionId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!submissionId, // Only run if submissionId is provided
  })
}

/**
 * Hook to create a new submission.
 */
export const useCreateSubmission = () => {
  const queryClient = useQueryClient()
  type CreateSubmissionInput = {
    // Need module/quiz ID for invalidation, even if not directly in submissionData
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
        // Invalidate list queries
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
        }
        // Pre-populate detail cache
        queryClient.setQueryData(submissionKeys.detail(newSubmission.id), newSubmission)
        // Pre-populate detailWithResponses cache with empty responses array
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
        // Invalidate the query that fetches the submission with its responses
        queryClient.invalidateQueries({
          queryKey: submissionKeys.detailWithResponses(variables.submissionId),
        })
        // OPTIONAL: Optimistic update (more complex as it requires merging)
        // queryClient.setQueryData<SubmissionWithResponses | null>(
        //   submissionKeys.detailWithResponses(variables.submissionId),
        //   (oldData) => {
        //     if (!oldData) return null;
        //     // Basic merge, assumes no duplicates if API returns all created
        //     return {
        //       ...oldData,
        //       responses: [...oldData.responses, ...newResponses],
        //     };
        //   }
        // );
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
    moduleId?: string // Needed for list invalidation if applicable
    quizId?: string // Needed for list invalidation if applicable
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: submissionKeys.detail(submissionId) })
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      // Snapshot previous values
      const previousSubmission = queryClient.getQueryData<DbSubmission>(
        submissionKeys.detail(submissionId)
      )
      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      // Optimistically update the detail cache
      if (previousSubmission) {
        queryClient.setQueryData<DbSubmission>(submissionKeys.detail(submissionId), {
          ...previousSubmission,
          ...updates,
          updated_at: new Date().toISOString(), // Optimistic update
        })
      }
      // Optimistically update the detailWithResponses cache
      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            submission: {
              ...previousSubmissionWithResponses.submission,
              ...updates,
              updated_at: new Date().toISOString(), // Optimistic update
            },
          }
        )
      }

      return { previousSubmission, previousSubmissionWithResponses, submissionId, moduleId, quizId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating submission ${variables.submissionId}:`, err)
      // Rollback on error
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
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
      // Invalidate relevant list queries
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByModule(context.moduleId) })
      }
      if (context?.quizId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(context.quizId) })
      }
      // Consider invalidating 'all' if module/quiz IDs aren't always available
      // queryClient.invalidateQueries({ queryKey: submissionKeys.all });
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
    submissionId: string // Needed for cache updates/invalidation
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      // Snapshot previous value
      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      // Optimistically update the response within the detailWithResponses cache
      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            responses: previousSubmissionWithResponses.responses.map(
              (r) =>
                r.id === responseId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r // Optimistic update
            ),
          }
        )
      }

      return { previousSubmissionWithResponses, submissionId, responseId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating response ${variables.responseId}:`, err)
      // Rollback on error
      if (context?.previousSubmissionWithResponses) {
        queryClient.setQueryData(
          submissionKeys.detailWithResponses(context.submissionId),
          context.previousSubmissionWithResponses
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
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
    moduleId?: string // Needed for list invalidation
    quizId?: string // Needed for list invalidation
  }

  return useMutation<boolean, Error, DeleteSubmissionInput>({
    mutationFn: (vars) => deleteSubmission(vars.submissionId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate list queries
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
        }
        // Remove detail queries from cache
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
        // If deletion failed, invalidate to refetch potentially inconsistent state
        if (variables.moduleId) {
          queryClient.invalidateQueries({
            queryKey: submissionKeys.listByModule(variables.moduleId),
          })
        }
        if (variables.quizId) {
          queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
        }
        queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submissionId) })
        queryClient.invalidateQueries({
          queryKey: submissionKeys.detailWithResponses(variables.submissionId),
        })
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting submission ${variables.submissionId}:`, error)
      // Invalidate relevant queries on error to ensure consistency
      if (variables.moduleId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByModule(variables.moduleId) })
      }
      if (variables.quizId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.quizId) })
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
    submissionId: string // Needed for cache updates/invalidation
  }
  type DeleteResponseContext = {
    previousSubmissionWithResponses: SubmissionWithResponses | undefined
    submissionId: string
    responseId: string
  }

  return useMutation<boolean, Error, DeleteResponseInput, DeleteResponseContext>({
    mutationFn: (vars) => deleteResponse(vars.responseId),
    onMutate: async ({ responseId, submissionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: submissionKeys.detailWithResponses(submissionId),
      })

      // Snapshot previous value
      const previousSubmissionWithResponses = queryClient.getQueryData<SubmissionWithResponses>(
        submissionKeys.detailWithResponses(submissionId)
      )

      // Optimistically remove the response from the detailWithResponses cache
      if (previousSubmissionWithResponses) {
        queryClient.setQueryData<SubmissionWithResponses>(
          submissionKeys.detailWithResponses(submissionId),
          {
            ...previousSubmissionWithResponses,
            responses: previousSubmissionWithResponses.responses.filter((r) => r.id !== responseId),
          }
        )
      }

      return { previousSubmissionWithResponses, submissionId, responseId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting response ${variables.responseId}:`, err)
      // Rollback on error
      if (context?.previousSubmissionWithResponses) {
        queryClient.setQueryData(
          submissionKeys.detailWithResponses(context.submissionId),
          context.previousSubmissionWithResponses
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency,
      // especially if the optimistic update might have been wrong (e.g., deletion failed server-side)
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submissionId),
      })
    },
  })
}
