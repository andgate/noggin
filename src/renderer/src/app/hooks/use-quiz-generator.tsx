import { GenerateQuizOptions } from '@noggin/types/electron-types'
import { Quiz } from '@noggin/types/quiz-types'
import { useCallback } from 'react'

export function useQuizGenerator() {
    const generateQuizContent = useCallback(async (options: GenerateQuizOptions): Promise<Quiz> => {
        try {
            return await window.api.generate.generateQuiz(options)
        } catch (error) {
            console.error('Error generating quiz:', error)
            throw error
        }
    }, [])

    return { generateQuiz: generateQuizContent }
}
