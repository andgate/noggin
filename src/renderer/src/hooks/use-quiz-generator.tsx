import { GenerateQuizOptions } from '@noggin/types/electron-types'
import { useCallback } from 'react'

export function useQuizGenerator() {
    const generateQuizContent = useCallback(async (options: GenerateQuizOptions) => {
        try {
            return await window.api.generate.generateQuiz(options)
        } catch (error) {
            console.error('Error generating quiz:', error)
            throw error
        }
    }, [])

    return { generateQuiz: generateQuizContent }
}
