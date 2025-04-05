import { Quiz } from '@noggin/types/quiz-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureDir, readJsonFile, writeJsonFile } from '../../common/fs-utils'
import { getQuizPath } from '../../common/module-utils'
import { readModuleById } from './module-core-service'
import { resolveModulePath } from './module-discovery-service'
import {
    deleteModuleQuiz,
    getLatestModuleQuiz,
    readModuleQuiz,
    saveModuleQuiz,
} from './module-quiz-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../../common/fs-utils')
vi.mock('../../common/module-utils')
vi.mock('./module-core-service')
vi.mock('./module-discovery-service')

describe('ModuleQuizService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'
    const mockQuizId = 'test-quiz'

    const mockQuiz: Quiz = {
        id: mockQuizId,
        title: 'Test Quiz',
        timeLimit: 600,
        sources: ['source1.txt'],
        questions: [],
        createdAt: '2024-01-01T00:00:00Z',
    }

    const mockQuizPath = `${mockModulePath}/.mod/quizzes/${mockQuizId}.json`

    beforeEach(() => {
        vi.resetAllMocks()

        // Common mocks
        vi.mocked(resolveModulePath).mockResolvedValue(mockModulePath)
        vi.mocked(getQuizPath).mockReturnValue(mockQuizPath)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('saveModuleQuiz', () => {
        it('should save a quiz to the correct path', async () => {
            // Arrange
            vi.mocked(ensureDir).mockResolvedValueOnce(undefined)
            vi.mocked(writeJsonFile).mockResolvedValueOnce(undefined)
            vi.mocked(path.dirname).mockReturnValueOnce(`${mockModulePath}/.mod/quizzes`)

            // Act
            await saveModuleQuiz(mockLibraryId, mockModuleId, mockQuiz)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getQuizPath).toHaveBeenCalledWith(mockModulePath, mockQuizId)
            expect(ensureDir).toHaveBeenCalledWith(`${mockModulePath}/.mod/quizzes`)
            expect(writeJsonFile).toHaveBeenCalledWith(mockQuizPath, mockQuiz)
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(saveModuleQuiz(mockLibraryId, 'non-existent', mockQuiz)).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('deleteModuleQuiz', () => {
        it('should delete a quiz file', async () => {
            // Arrange
            vi.mocked(fs.unlink).mockResolvedValueOnce(undefined)

            // Act
            await deleteModuleQuiz(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getQuizPath).toHaveBeenCalledWith(mockModulePath, mockQuizId)
            expect(fs.unlink).toHaveBeenCalledWith(mockQuizPath)
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(
                deleteModuleQuiz(mockLibraryId, 'non-existent', mockQuizId)
            ).rejects.toThrow('Module not found: non-existent')
        })
    })

    describe('readModuleQuiz', () => {
        it('should read a quiz from the correct path', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockQuiz)

            // Act
            const result = await readModuleQuiz(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getQuizPath).toHaveBeenCalledWith(mockModulePath, mockQuizId)
            expect(readJsonFile).toHaveBeenCalled()
            expect(result).toEqual(mockQuiz)
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(readModuleQuiz(mockLibraryId, 'non-existent', mockQuizId)).rejects.toThrow(
                'Module not found: non-existent'
            )
        })

        it('should throw error if quiz is not found', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockRejectedValueOnce(new Error('File not found'))

            // Act & Assert
            await expect(
                readModuleQuiz(mockLibraryId, mockModuleId, 'non-existent')
            ).rejects.toThrow('Quiz not found: non-existent')
        })
    })

    describe('getLatestModuleQuiz', () => {
        it('should return the most recent quiz from a module', async () => {
            // Arrange
            const oldQuiz: Quiz = {
                ...mockQuiz,
                id: 'old-quiz',
                createdAt: '2023-01-01T00:00:00Z',
            }

            const newQuiz: Quiz = {
                ...mockQuiz,
                id: 'new-quiz',
                createdAt: '2024-01-01T00:00:00Z',
            }

            vi.mocked(readModuleById).mockResolvedValueOnce({
                metadata: {
                    id: mockModuleId,
                    title: 'Test Module',
                    slug: 'test-module',
                    overview: 'Test Overview',
                    createdAt: '2024-01-01T00:00:00Z',
                    path: mockModulePath,
                    updatedAt: '2024-01-01T00:00:00Z',
                    libraryId: mockLibraryId,
                },
                quizzes: [oldQuiz, newQuiz],
                submissions: [],
                sources: [],
                stats: {
                    moduleId: mockModuleId,
                    currentBox: 1,
                    nextReviewDate: '2024-01-02T00:00:00Z',
                },
            })

            // Act
            const result = await getLatestModuleQuiz(mockLibraryId, mockModuleId)

            // Assert
            expect(readModuleById).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(result).toEqual(newQuiz)
        })

        it('should throw error if no quizzes are available', async () => {
            // Arrange
            vi.mocked(readModuleById).mockResolvedValueOnce({
                metadata: {
                    id: mockModuleId,
                    title: 'Test Module',
                    slug: 'test-module',
                    overview: 'Test Overview',
                    createdAt: '2024-01-01T00:00:00Z',
                    path: mockModulePath,
                    updatedAt: '2024-01-01T00:00:00Z',
                    libraryId: mockLibraryId,
                },
                quizzes: [],
                submissions: [],
                sources: [],
                stats: {
                    moduleId: mockModuleId,
                    currentBox: 1,
                    nextReviewDate: '2024-01-02T00:00:00Z',
                },
            })

            // Act & Assert
            await expect(getLatestModuleQuiz(mockLibraryId, mockModuleId)).rejects.toThrow(
                'No quizzes available for this module'
            )
        })
    })
})
