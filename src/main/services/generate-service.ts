import { SimpleFile } from '@noggin/types/electron-types'
import { compact } from 'lodash'
import mime from 'mime'
import { z } from 'zod'
import { geminiService } from './gemini-service'

const analysisResultSchema = z.object({
    title: z.string(),
    overview: z.string(),
    slug: z.string(),
})

export const generateService = {
    async analyzeContent(files: SimpleFile[]) {
        const fileDataParts = compact(
            files.map(
                (file) =>
                    file.data && {
                        inlineData: {
                            data: file.data,
                            mimeType: mime.getType(file.path) || 'application/octet-stream',
                        },
                    }
            )
        )

        const parts = [
            {
                text: 'Analyze these learning materials and generate a module title and overview.',
            },
            ...fileDataParts,
            {
                text: 'Generate a JSON response with:\n1. title: A clear, descriptive title for this learning module\n2. overview: A brief summary of the module content\n3. slug: A URL-friendly version of the title',
            },
        ]

        return await geminiService.generateContent({
            parts,
            schema: analysisResultSchema,
        })
    },
}
