import { Part } from '@google/generative-ai'
import { convertGeneratedQuiz } from '@noggin/common/quiz-utils'
import { GenerateQuizOptions, SimpleFile } from '@noggin/types/electron-types'
import { GeneratedQuiz, generatedQuizSchema } from '@noggin/types/quiz-generation-types'
import { Quiz } from '@noggin/types/quiz-types'
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
    }: GenerateQuizOptions): Promise<Quiz> {
        console.log('Generating quiz with options:', {
            sources,
            numQuestions,
            includeMultipleChoice,
            includeWritten,
        })
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
                text: `Please focus on analyzing these learning materials to create an educational quiz.`,
            },
            ...fileDataParts,
            {
                text: `Based on the provided materials, generate a quiz with ${numQuestions} questions.
                The quiz should include ${[
                    includeMultipleChoice && 'multiple choice',
                    includeWritten && 'written response',
                ]
                    .filter(Boolean)
                    .join(' and ')} questions.

                Focus on testing key concepts and understanding from the materials. Each question should be clear,
                specific, and directly related to the content. For multiple choice questions, ensure one correct
                answer and plausible but incorrect alternatives.`,
            },
        ]

        const generatedQuiz: GeneratedQuiz = await geminiService.generateContent({
            parts,
            schema: generatedQuizSchema,
        })

        console.log('Raw generated quiz:', generatedQuiz)

        return convertGeneratedQuiz(generatedQuiz, sources)
    },
}