import { SimpleFile } from '@noggin/types/electron-types'
import { useCallback } from 'react'

export function useModuleGenerator() {
    const analyzeContent = useCallback(async (files: SimpleFile[]) => {
        try {
            return await window.api.generate.analyzeContent(files)
        } catch (error) {
            console.error('Error analyzing content:', error)
            throw error
        }
    }, [])

    return { analyzeContent }
}
