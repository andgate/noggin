import {
  createQuestions,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getQuizWithQuestions,
  getQuizzesByModule,
  updateQuestion,
  updateQuiz,
  type DbQuestion,
  type DbQuiz,
} from '@noggin/api/quizApi'
import { getLatestSubmittedQuizByModule } from '@noggin/api/submissionApi'
import type { TablesInsert, TablesUpdate } from '@noggin/types/database.types'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizKeys } from './query-keys'

// Type for the detailed quiz data (quiz + questions)
type QuizWithQuestions = {
  quiz: DbQuiz
  questions: DbQuestion[]
}

/**
 * Query options for fetching quizzes by module ID.
 * @param moduleId The ID of the module.
 */
export const quizzesByModuleQueryOptions = (moduleId: string) =>
  queryOptions<DbQuiz[], Error>({
    queryKey: quizKeys.list(moduleId),
    queryFn: () => getQuizzesByModule(moduleId),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })

/**
 * Hook to fetch quizzes by module ID.
 * @param moduleId The ID of the module.
 */
export const useGetQuizzesByModule = (moduleId: string | null | undefined) => {
  return useQuery(quizzesByModuleQueryOptions(moduleId!))
}

/**
 * Query options for fetching the latest *submitted* quiz by module ID.
 * @param moduleId The ID of the module.
 */
export const latestSubmittedQuizByModuleQueryOptions = (moduleId: string) =>
  queryOptions<DbQuiz | null, Error>({
    queryKey: quizKeys.latestSubmittedByModule(moduleId),
    queryFn: () => getLatestSubmittedQuizByModule(moduleId),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })

/**
 * Query options for fetching the latest *created* quiz by module ID.
 * @param moduleId The ID of the module.
 */
export const latestCreatedQuizByModuleQueryOptions = (moduleId: string) =>
  queryOptions<DbQuiz | null, Error>({
    // Use a distinct query key part
    queryKey: [...quizKeys.list(moduleId), 'latestCreated'],
    queryFn: async () => {
      const quizzes = await getQuizzesByModule(moduleId)
      if (!quizzes || quizzes.length === 0) {
        return null
      }
      // Sort by creation date desc to find the latest
      return [...quizzes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    },
    staleTime: 1000 * 60 * 5, // Keep stale time consistent
    enabled: !!moduleId,
  })

/**
 * Query options for fetching a single quiz with its questions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const quizWithQuestionsQueryOptions = (quizId: string) =>
  queryOptions<QuizWithQuestions | null, Error>({
    queryKey: quizKeys.detailWithQuestions(quizId),
    queryFn: () => getQuizWithQuestions(quizId),
    staleTime: 1000 * 60 * 5,
    enabled: !!quizId,
  })

/**
 * Hook to fetch a single quiz with its questions by quiz ID.
 * @param quizId The ID of the quiz.
 */
export const useGetQuizWithQuestions = (quizId: string | null | undefined) => {
  return useQuery(quizWithQuestionsQueryOptions(quizId!))
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
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.invalidateQueries({
          queryKey: quizKeys.latestSubmittedByModule(variables.moduleId),
        })
        // Invalidate latest created as well
        queryClient.invalidateQueries({
          queryKey: latestCreatedQuizByModuleQueryOptions(variables.moduleId).queryKey,
        })
        queryClient.setQueryData(quizKeys.detail(newQuiz.id), newQuiz)
        queryClient.setQueryData(quizWithQuestionsQueryOptions(newQuiz.id).queryKey, {
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
        queryClient.invalidateQueries({
          queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
        })
      }
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
    moduleId: string
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
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
      await queryClient.cancelQueries({ queryKey: quizWithQuestionsQueryOptions(quizId).queryKey })

      const previousQuiz = queryClient.getQueryData<DbQuiz>(quizKeys.detail(quizId))
      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizWithQuestionsQueryOptions(quizId).queryKey
      )

      if (previousQuiz) {
        queryClient.setQueryData<DbQuiz>(quizKeys.detail(quizId), {
          ...previousQuiz,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }
      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(
          quizWithQuestionsQueryOptions(quizId).queryKey,
          {
            ...previousQuizWithQuestions,
            quiz: {
              ...previousQuizWithQuestions.quiz,
              ...updates,
              updated_at: new Date().toISOString(),
            },
          }
        )
      }

      return { previousQuiz, previousQuizWithQuestions, quizId, moduleId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating quiz ${variables.quizId}:`, err)
      if (context?.previousQuiz) {
        queryClient.setQueryData(quizKeys.detail(context.quizId), context.previousQuiz)
      }
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizWithQuestionsQueryOptions(context.quizId).queryKey,
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      queryClient.invalidateQueries({
        queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
      })
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(context.moduleId) })
        queryClient.invalidateQueries({
          queryKey: quizKeys.latestSubmittedByModule(context.moduleId),
        })
        // Invalidate latest created too
        queryClient.invalidateQueries({
          queryKey: latestCreatedQuizByModuleQueryOptions(context.moduleId).queryKey,
        })
      } else {
        queryClient.invalidateQueries({ queryKey: quizKeys.all })
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
    quizId: string
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
      await queryClient.cancelQueries({ queryKey: quizWithQuestionsQueryOptions(quizId).queryKey })

      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizWithQuestionsQueryOptions(quizId).queryKey
      )

      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(
          quizWithQuestionsQueryOptions(quizId).queryKey,
          {
            ...previousQuizWithQuestions,
            questions: previousQuizWithQuestions.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates, updated_at: new Date().toISOString() } : q
            ),
          }
        )
      }

      return { previousQuizWithQuestions, quizId, questionId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating question ${variables.questionId}:`, err)
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizWithQuestionsQueryOptions(context.quizId).queryKey,
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
      })
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
    moduleId: string
  }

  return useMutation<boolean, Error, DeleteQuizInput>({
    mutationFn: (vars) => deleteQuiz(vars.quizId),
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.invalidateQueries({
          queryKey: quizKeys.latestSubmittedByModule(variables.moduleId),
        })
        queryClient.invalidateQueries({
          queryKey: latestCreatedQuizByModuleQueryOptions(variables.moduleId).queryKey,
        })
        queryClient.removeQueries({ queryKey: quizKeys.detail(variables.quizId), exact: true })
        queryClient.removeQueries({
          queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
          exact: true,
        })
      } else {
        console.error(`Failed to delete quiz ${variables.quizId}, API returned false.`)
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.invalidateQueries({
          queryKey: quizKeys.latestSubmittedByModule(variables.moduleId),
        })
        queryClient.invalidateQueries({
          queryKey: latestCreatedQuizByModuleQueryOptions(variables.moduleId).queryKey,
        })
        queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
        queryClient.invalidateQueries({
          queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
        })
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting quiz ${variables.quizId}:`, error)
      queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
      queryClient.invalidateQueries({
        queryKey: quizKeys.latestSubmittedByModule(variables.moduleId),
      })
      queryClient.invalidateQueries({
        queryKey: latestCreatedQuizByModuleQueryOptions(variables.moduleId).queryKey,
      })
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      queryClient.invalidateQueries({
        queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
      })
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
    quizId: string
  }
  type DeleteQuestionContext = {
    previousQuizWithQuestions: QuizWithQuestions | undefined
    quizId: string
    questionId: string
  }

  return useMutation<boolean, Error, DeleteQuestionInput, DeleteQuestionContext>({
    mutationFn: (vars) => deleteQuestion(vars.questionId),
    onMutate: async ({ questionId, quizId }) => {
      await queryClient.cancelQueries({ queryKey: quizWithQuestionsQueryOptions(quizId).queryKey })

      const previousQuizWithQuestions = queryClient.getQueryData<QuizWithQuestions>(
        quizWithQuestionsQueryOptions(quizId).queryKey
      )

      if (previousQuizWithQuestions) {
        queryClient.setQueryData<QuizWithQuestions>(
          quizWithQuestionsQueryOptions(quizId).queryKey,
          {
            ...previousQuizWithQuestions,
            questions: previousQuizWithQuestions.questions.filter((q) => q.id !== questionId),
          }
        )
      }

      return { previousQuizWithQuestions, quizId, questionId }
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting question ${variables.questionId}:`, err)
      if (context?.previousQuizWithQuestions) {
        queryClient.setQueryData(
          quizWithQuestionsQueryOptions(context.quizId).queryKey,
          context.previousQuizWithQuestions
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizWithQuestionsQueryOptions(variables.quizId).queryKey,
      })
    },
  })
}
