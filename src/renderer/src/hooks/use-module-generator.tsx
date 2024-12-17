import { useCallback } from 'react'
import { z } from 'zod'

export function useModuleGenerator() {
    const analyzeContent = useCallback(async (files: File[]) => {
        // Convert files to text content for analysis
        const fileContents = await Promise.all(
            files.map(async (file) => {
                const text = await file.text()
                return {
                    name: file.name,
                    content: text,
                }
            })
        )

        // Construct prompt for Gemini
        const prompt = `Analyze these learning materials and generate a module title and overview.
Files provided:
${fileContents.map((f) => `- ${f.name}`).join('\n')}

Content:
${fileContents.map((f) => f.content).join('\n\n')}

Generate a JSON response with:
1. title: A clear, descriptive title for this learning module
2. overview: A brief summary of the module content
3. slug: A URL-friendly version of the title`

        const response = await window.api.gemini.generateContent({
            prompt,
            schema: z.object({
                title: z.string(),
                overview: z.string(),
                slug: z.string(),
            }),
        })

        return response
    }, [])

    return { analyzeContent }
}
