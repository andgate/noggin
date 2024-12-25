import { Part } from '@google/generative-ai'
import { GenerateQuizOptions, SimpleFile } from '@noggin/types/electron-types'
import { generatedQuizSchema } from '@noggin/types/quiz-generation-types'
import fs from 'fs'
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

    async generateQuiz({
        sources,
        numQuestions,
        includeMultipleChoice,
        includeWritten,
    }: GenerateQuizOptions) {
        const loadedFiles = await Promise.all(
            sources.map(async (filepath) => ({
                path: filepath,
                data: await fs.promises.readFile(filepath, 'base64'),
            }))
        )

        const fileDataParts: Part[] = compact(
            loadedFiles.map((file) => ({
                inlineData: {
                    data: file.data,
                    mimeType: mime.getType(file.path) || 'application/octet-stream',
                },
            }))
        )

        const parts: Part[] = [
            {
                text: `Generate a quiz with ${numQuestions} questions based on these learning materials.
                    Include ${includeMultipleChoice ? 'multiple choice' : ''}
                    ${includeMultipleChoice && includeWritten ? 'and' : ''}
                    ${includeWritten ? 'written response' : ''} questions.

                    The response should be valid JSON matching this structure:
                    {
                        "title": "string",
                        "questions": [
                            {
                                "questionType": "multiple_choice",
                                "question": "string",
                                "choices": [
                                    {
                                        "text": "string",
                                        "isCorrect": boolean
                                    }
                                ]
                            }
                            // or
                            {
                                "questionType": "written",
                                "question": "string"
                            }
                        ]
                    }`,
            },
            ...fileDataParts,
        ]

        return await geminiService.generateContent({
            parts,
            schema: generatedQuizSchema,
        })
    },
}
