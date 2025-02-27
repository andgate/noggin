import { SimpleFile } from '@noggin/types/electron-types'
import { useCallback } from 'react'

export function useModuleGenerator() {
    const analyzeContent = useCallback(async (files: SimpleFile[]) => {
        console.log(
            '📋 analyzeContent hook called with files:',
            files.map((f) => f.path)
        )
        try {
            console.log('📋 Calling window.api.generate.analyzeContent')
            const result = await window.api.generate.analyzeContent(files)
            console.log('📋 analyzeContent API call succeeded with result:', result)
            return result
        } catch (error) {
            console.error('📋 Error analyzing content:', error)
            throw error
        }
    }, [])

    return { analyzeContent }
}
