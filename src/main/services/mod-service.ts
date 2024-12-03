/**
 * A service for managing individual learning modules ("mods").
 *
 * Mods are stored as JSON files containing:
 * - Content sources (PDFs, text, or URLs)
 * - Tests with questions
 * - Student submissions and grades
 *
 * The service provides functions to:
 * - Find mod files within a directory (recursively)
 * - Load mod data from JSON files
 * - Save mod data by embedding it into JSON files
 */
import { Mod, ModGradesFile, modGradesFileSchema, modSchema } from '@noggin/types/mod-types'
import { quizSchema, submissionSchema } from '@noggin/types/quiz-types'
import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { z } from 'zod'
import { slugify } from '../utils/string-utils'

// Helper to read and parse JSON with schema
async function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    const rawData = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(rawData)
    return schema.parse(parsed)
}

export async function findMods(dirPath: string): Promise<string[]> {
    return glob('**/*.mod/', {
        cwd: dirPath,
        absolute: true,
    })
}

export async function loadMod(modPath: string): Promise<Mod> {
    // Load quizzes with new naming convention
    const quizFiles = await glob('quizzes/*.json', { cwd: modPath, absolute: true })
    const quizzes = await Promise.all(quizFiles.map((file) => readJsonFile(file, quizSchema)))

    // Load submissions and grades
    const submissionFiles = await glob('submissions/*.json', { cwd: modPath, absolute: true })
    const submissions = await Promise.all(
        submissionFiles.map((file) => readJsonFile(file, submissionSchema))
    )

    // Load graded submissions (new)
    const gradedFiles = await glob('graded/*.json', { cwd: modPath, absolute: true })
    const grades = await Promise.all(
        gradedFiles.map((file) => readJsonFile(file, modGradesFileSchema))
    )

    // Load sources with new metadata
    const sourceFiles = await glob('sources/*', { cwd: modPath, absolute: true })
    const sources = await Promise.all(
        sourceFiles.map(async (file) => {
            const originalName = path.basename(file)
            return {
                type: 'text' as const,
                originalName,
                slug: slugify(originalName),
                content: await fs.readFile(file, 'utf-8'),
                createdAt: new Date().toISOString(),
            }
        })
    )

    const modId = path.basename(modPath, '.mod')
    return {
        id: modId,
        name: modId,
        sources,
        tests: quizzes,
        submissions,
        grades,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

export async function saveMod(modPath: string, mod: Mod): Promise<void> {
    // Create all required directories
    await Promise.all([
        fs.mkdir(path.join(modPath, 'quizzes'), { recursive: true }),
        fs.mkdir(path.join(modPath, 'submissions'), { recursive: true }),
        fs.mkdir(path.join(modPath, 'sources'), { recursive: true }),
        fs.mkdir(path.join(modPath, 'graded'), { recursive: true }),
    ])

    // Save quizzes with slugified names
    await Promise.all(
        mod.tests.map(async (quiz) => {
            const quizPath = path.join(modPath, 'quizzes', `${quiz.slug}.json`)
            await fs.writeFile(quizPath, JSON.stringify(quiz, null, 2))
        })
    )

    // Save submissions
    await Promise.all(
        mod.submissions.map(async (sub) => {
            const subPath = path.join(modPath, 'submissions', `${sub.id}.json`)
            await fs.writeFile(subPath, JSON.stringify(sub, null, 2))
        })
    )

    // Save sources
    await Promise.all(
        mod.sources.map(async (source, index) => {
            if (source.type === 'text') {
                const sourcePath = path.join(modPath, 'sources', `source_${index}.txt`)
                await fs.writeFile(sourcePath, source.content)
            }
        })
    )
}
