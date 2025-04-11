// src/renderer/src/hooks/useQuizHooks.ts
import {
  createQuestions,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getQuizWithQuestions,
  getQuizzesByModule,
  updateQuestion,
  updateQuiz, // Import types from api file
  type DbQuestion,
  type DbQuiz, // Import types from api file
} from '@noggin/api/quizApi'
import type { TablesInsert, TablesUpdate } from '@noggin/types/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizKeys } from './query-keys'

// Type for the detailed quiz data (quiz + questions)
type QuizWithQuestions = {
  quiz: DbQuiz
  questions: DbQuestion[]
}

/**
 * Hook to fetch quizzes by module ID.
 * @param moduleId The ID of the module.
 */
export const useGetQuizzesByModule = (moduleId: string | null | undefined) => {
  return useQuery<DbQuiz[], Error>({
    queryKey: quizKeys.list(moduleId!),
    queryFn: () => getQuizzesByModule(moduleId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Only run if moduleId is provided
  })
}

/**
 * Hook to fetch a single quiz with its questions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const useGetQuizWithQuestions = (quizId: string | null | undefined) => {
  return useQuery<QuizWithQuestions | null, Error>({
    queryKey: quizKeys.detailWithQuestions(quizId!),
    queryFn: () => getQuizWithQuestions(quizId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!quizId, // Only run if quizId is provided
  })
}

/**
 * Hook to create a new quiz.
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient()
  type CreateQuizInput = {
    moduleId: string
    quizData: Omit<
      TablesInsert<'quizzes'>,
      'user_id' | 'id' | 'created_at' | 'module_id' | 'updated_at'
    >
  }

  return useMutation<DbQuiz | null, Error, CreateQuizInput>({
    mutationFn: (vars) => createQuiz(vars.moduleId, vars.quizData),
    onSuccess: (newQuiz, variables) => {
      if (newQuiz) {
        // Invalidate the list query for the specific module
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        // Optionally pre-populate the detail cache (without questions initially)
        queryClient.setQueryData(quizKeys.detail(newQuiz.id), newQuiz)
        // Pre-populate detailWithQuestions cache with empty questions array
        queryClient.setQueryData(quizKeys.detailWithQuestions(newQuiz.id), {
          quiz: newQuiz,
          questions: [],
        })
      }
    },
    onError: (error) => {
      console.error('Error creating quiz:', error)
    },
  })
}

/**
 * Hook to create multiple questions for a quiz.
 */
export const useCreateQuestions = () => {
  const queryClient = useQueryClient()
  type CreateQuestionsInput = {
    quizId: string
    questionsData: Omit<TablesInsert<'questions'>, 'user_id' | 'id' | 'quiz_id' | 'updated_at'>[]
  }

  return useMutation<DbQuestion[] | null, Error, CreateQuestionsInput>({
    mutationFn: (vars) => createQuestions(vars.quizId, vars.questionsData),
    onSuccess: (newQuestions, variables) => {
      if (newQuestions && newQuestions.length > 0) {
        // Invalidate the query that fetches the quiz with its questions
        queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
      }
      // Alternative: Optimistically add questions to cache if needed
      // queryClient.setQueryData<QuizWithQuestions | null>(
      //   quizKeys.detailWithQuestions(variables.quizId),
      //   (oldData) => {
      //     if (!oldData) return null;
      //     return {
      //       ...oldData,
      //       questions: [...oldData.questions, ...newQuestions],
      //     };
      //   }
      // );
    },
    onError: (error, variables) => {
      console.error(`Error creating questions for quiz ${variables.quizId}:`, error)
    },
  })
}

/**
 * Hook to update an existing quiz. Includes optimistic updates.
 */
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient()
  type UpdateQuizInput = {
    quizId: string
    moduleId: string // Needed for list invalidation
    updates: TablesUpdate<'quizzes'>
  }
  type UpdateQuizContext = {
    previousQuiz: DbQuiz | undefined
    previousQuizWithQuestions: QuizWithQuestions | undefined
    quizId: string
    moduleId: string
  }

  return useMutation<DbQuiz | null, Error, UpdateQuizInput, UpdateQuizContext>({
    mutationFn: (vars) => updateQuiz(vars.quizId, vars.updates),
    onMutate: async ({ quizId, moduleId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
      await queryClient.cancelQueries({ queryKey: quizKeys.detailWithQuestions(quizId) })

      // Snapshot previous values
      const previousQuiz = queryClient.getQueryData<DbQuiz>(quizKeys.detail(quizId))
      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizKeys.detailWithQuestions(quizId)
      )

      // Optimistically update the detail cache
      if (previousQuiz) {
        queryClient.setQueryData<DbQuiz>(quizKeys.detail(quizId), {
          ...previousQuiz,
          ...updates,
          updated_at: new Date().toISOString(), // Optimistic update
        })
      }
      // Optimistically update the detailWithQuestions cache
      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(quizKeys.detailWithQuestions(quizId), {
          ...previousQuizWithQuestions,
          quiz: {
            ...previousQuizWithQuestions.quiz,
            ...updates,
            updated_at: new Date().toISOString(), // Optimistic update
          },
        })
      }

      return { previousQuiz, previousQuizWithQuestions, quizId, moduleId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating quiz ${variables.quizId}:`, err)
      // Rollback on error
      if (context?.previousQuiz) {
        queryClient.setQueryData(quizKeys.detail(context.quizId), context.previousQuiz)
      }
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizKeys.detailWithQuestions(context.quizId),
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables, context) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
      // Invalidate the list for the module the quiz belongs to
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(context.moduleId) })
      } else {
        // Fallback if moduleId wasn't in context (should be)
        queryClient.invalidateQueries({ queryKey: quizKeys.all }) // Less specific
      }
    },
  })
}

/**
 * Hook to update an existing question. Includes optimistic updates.
 */
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()
  type UpdateQuestionInput = {
    questionId: string
    quizId: string // Needed for cache updates/invalidation
    updates: TablesUpdate<'questions'>
  }
  type UpdateQuestionContext = {
    previousQuizWithQuestions: QuizWithQuestions | undefined
    quizId: string
    questionId: string
  }

  return useMutation<DbQuestion | null, Error, UpdateQuestionInput, UpdateQuestionContext>({
    mutationFn: (vars) => updateQuestion(vars.questionId, vars.updates),
    onMutate: async ({ questionId, quizId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: quizKeys.detailWithQuestions(quizId) })

      // Snapshot previous value
      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizKeys.detailWithQuestions(quizId)
      )

      // Optimistically update the question within the detailWithQuestions cache
      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(quizKeys.detailWithQuestions(quizId), {
          ...previousQuizWithQuestions,
          questions: previousQuizWithQuestions.questions.map(
            (q) =>
              q.id === questionId ? { ...q, ...updates, updated_at: new Date().toISOString() } : q // Optimistic update
          ),
        })
      }

      return { previousQuizWithQuestions, quizId, questionId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating question ${variables.questionId}:`, err)
      // Rollback on error
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizKeys.detailWithQuestions(context.quizId),
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
    },
  })
}

/**
 * Hook to delete a quiz.
 */
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient()
  type DeleteQuizInput = {
    quizId: string
    moduleId: string // Needed for list invalidation
  }

  return useMutation<boolean, Error, DeleteQuizInput>({
    mutationFn: (vars) => deleteQuiz(vars.quizId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate the list query for the specific module
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        // Remove detail queries from cache
        queryClient.removeQueries({ queryKey: quizKeys.detail(variables.quizId), exact: true })
        queryClient.removeQueries({
          queryKey: quizKeys.detailWithQuestions(variables.quizId),
          exact: true,
        })
      } else {
        console.error(`Failed to delete quiz ${variables.quizId}, API returned false.`)
        // If deletion failed, invalidate to refetch potentially inconsistent state
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
        queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting quiz ${variables.quizId}:`, error)
      // Invalidate relevant queries on error to ensure consistency
      queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
    },
  })
}

/**
 * Hook to delete a question. Includes optimistic update.
 */
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()
  type DeleteQuestionInput = {
    questionId: string
    quizId: string // Needed for cache updates/invalidation
  }
  type DeleteQuestionContext = {
    previousQuizWithQuestions: QuizWithQuestions | undefined
    quizId: string
    questionId: string
  }

  return useMutation<boolean, Error, DeleteQuestionInput, DeleteQuestionContext>({
    mutationFn: (vars) => deleteQuestion(vars.questionId),
    onMutate: async ({ questionId, quizId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: quizKeys.detailWithQuestions(quizId) })

      // Snapshot previous value
      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizKeys.detailWithQuestions(quizId)
      )

      // Optimistically remove the question from the detailWithQuestions cache
      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(quizKeys.detailWithQuestions(quizId), {
          ...previousQuizWithQuestions,
          questions: previousQuizWithQuestions.questions.filter((q) => q.id !== questionId),
        })
      }

      return { previousQuizWithQuestions, quizId, questionId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting question ${variables.questionId}:`, err)
      // Rollback on error
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizKeys.detailWithQuestions(context.quizId),
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency,
      // especially if the optimistic update might have been wrong (e.g., deletion failed server-side)
      queryClient.invalidateQueries({ queryKey: quizKeys.detailWithQuestions(variables.quizId) })
    },
  })
}
