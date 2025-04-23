import {
  createQuestions,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getQuiz,
  getQuizzesByModule,
  updateQuestion,
  updateQuiz,
  type CreateQuestionInput,
  type CreateQuizInput,
  type UpdateQuestionInput,
  type UpdateQuizInput,
} from '@/core/api/quizApi'
import { Question } from '@/core/types/question.types'
import { Quiz } from '@/core/types/quiz.types'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizKeys } from './query-keys'

// --- Exported Hook Input/Context Types ---

export type CreateQuizHookInput = {
  moduleId: string
  quizData: CreateQuizInput
}

export type CreateQuestionsHookInput = {
  quizId: string
  questionsData: CreateQuestionInput[]
}

export type UpdateQuizHookInput = {
  quizId: string
  moduleId: string // Keep for invalidation
  updates: Partial<UpdateQuizInput> // Allow partial updates
}

export type UpdateQuizHookContext = {
  previousQuiz: Quiz | undefined
  quizId: string
  moduleId: string
}

export type UpdateQuestionHookInput = {
  questionId: string
  quizId: string
  updates: UpdateQuestionInput
}

export type UpdateQuestionHookContext = {
  previousQuiz: Quiz | undefined
  quizId: string
  questionId: string
}

export type DeleteQuizHookInput = {
  quizId: string
  moduleId: string
}

export type DeleteQuestionHookInput = {
  questionId: string
  quizId: string
}

export type DeleteQuestionHookContext = {
  previousQuiz: Quiz | undefined
  quizId: string
  questionId: string
}

// --- Query Options ---

/**
 * Query options for fetching quizzes by module ID.
 * @param moduleId The ID of the module.
 */
export const quizzesByModuleQueryOptions = (moduleId: string) =>
  queryOptions<Quiz[], Error>({
    queryKey: quizKeys.list(moduleId),
    queryFn: () => getQuizzesByModule(moduleId),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })

/**
 * Query options for fetching a single quiz with its questions and submission list items.
 * @param quizId The ID of the quiz.
 */
export const quizQueryOptions = (quizId: string) =>
  queryOptions<Quiz | null, Error>({
    queryKey: quizKeys.detail(quizId),
    queryFn: () => getQuiz(quizId),
    staleTime: 1000 * 60 * 5,
    enabled: !!quizId,
  })

// --- Hooks ---

/**
 * Hook to fetch quizzes by module ID.
 * @param moduleId The ID of the module.
 */
export const useGetQuizzesByModule = (moduleId: string | null | undefined) => {
  return useQuery(quizzesByModuleQueryOptions(moduleId!))
}

/**
 * Hook to fetch a single quiz with its questions and submission list items.
 * @param quizId The ID of the quiz.
 */
export const useQuiz = (quizId: string | null | undefined) => {
  return useQuery(quizQueryOptions(quizId!))
}

/**
 * Hook to create a new quiz.
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation<Quiz | null, Error, CreateQuizHookInput>({
    mutationFn: (vars) => createQuiz(vars.moduleId, vars.quizData),
    onSuccess: (newQuiz, variables) => {
      if (newQuiz) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.setQueryData(quizKeys.detail(newQuiz.id), newQuiz)
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

  return useMutation<Question[] | null, Error, CreateQuestionsHookInput>({
    mutationFn: (vars) => createQuestions(vars.quizId, vars.questionsData),
    onSuccess: (newQuestions, variables) => {
      if (newQuestions && newQuestions.length > 0) {
        queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
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

  return useMutation<Quiz | null, Error, UpdateQuizHookInput, UpdateQuizHookContext>({
    mutationFn: (vars) => updateQuiz(vars.quizId, vars.updates),
    onMutate: async ({ quizId, moduleId, updates }) => {
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
      const previousQuiz = queryClient.getQueryData<Quiz>(quizKeys.detail(quizId))
      if (previousQuiz) {
        queryClient.setQueryData<Quiz>(quizKeys.detail(quizId), {
          ...previousQuiz,
          ...updates,
          updatedAt: new Date().toISOString(),
        })
      }
      return { previousQuiz, quizId, moduleId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating quiz ${variables.quizId}:`, err)
      if (context?.previousQuiz) {
        queryClient.setQueryData(quizKeys.detail(context.quizId), context.previousQuiz)
      }
    },
    onSettled: (_data, _error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(context.moduleId) })
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

  return useMutation<Question | null, Error, UpdateQuestionHookInput, UpdateQuestionHookContext>({
    mutationFn: (vars) => updateQuestion(vars.questionId, vars.updates),
    onMutate: async ({ questionId, quizId, updates }) => {
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
      const previousQuiz = queryClient.getQueryData<Quiz>(quizKeys.detail(quizId))
      if (previousQuiz) {
        queryClient.setQueryData<Quiz>(quizKeys.detail(quizId), {
          ...previousQuiz,
          questions: previousQuiz.questions.map((q) => {
            if (q.id !== questionId) return q
            const updatedQuestionBase = {
              ...q,
              questionText: updates.question_text ?? q.questionText,
              updatedAt: new Date().toISOString(),
            }
            if (
              q.questionType === 'multiple_choice' &&
              updates.question_type === 'multiple_choice'
            ) {
              return {
                ...updatedQuestionBase,
                questionType: 'multiple_choice',
                choices: updates.choices ? JSON.parse(updates.choices as string) : q.choices,
              }
            } else if (q.questionType === 'written' && updates.question_type === 'written') {
              return {
                ...updatedQuestionBase,
                questionType: 'written',
              }
            }
            console.warn(
              `Optimistic update skipped for question ${q.id} due to type mismatch or invalid update.`
            )
            return q
          }),
        })
      }
      return { previousQuiz, quizId, questionId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating question ${variables.questionId}:`, err)
      if (context?.previousQuiz) {
        queryClient.setQueryData(quizKeys.detail(context.quizId), context.previousQuiz)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

/**
 * Hook to delete a quiz.
 */
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, DeleteQuizHookInput>({
    mutationFn: (vars) => deleteQuiz(vars.quizId),
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.removeQueries({ queryKey: quizKeys.detail(variables.quizId), exact: true })
      } else {
        console.error(`Failed to delete quiz ${variables.quizId}, API returned false.`)
        queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
        queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting quiz ${variables.quizId}:`, error)
      queryClient.invalidateQueries({ queryKey: quizKeys.list(variables.moduleId) })
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

/**
 * Hook to delete a question. Includes optimistic update.
 */
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, DeleteQuestionHookInput, DeleteQuestionHookContext>({
    mutationFn: (vars) => deleteQuestion(vars.questionId),
    onMutate: async ({ questionId, quizId }) => {
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
      const previousQuiz = queryClient.getQueryData<Quiz>(quizKeys.detail(quizId))
      if (previousQuiz) {
        queryClient.setQueryData<Quiz>(quizKeys.detail(quizId), {
          ...previousQuiz,
          questions: previousQuiz.questions.filter((q) => q.id !== questionId),
        })
      }
      return { previousQuiz, quizId, questionId }
    },
    onError: (err, variables, context) => {
      console.error(`Error deleting question ${variables.questionId}:`, err)
      if (context?.previousQuiz) {
        queryClient.setQueryData(quizKeys.detail(context.quizId), context.previousQuiz)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}
