import { Mod, moduleMetadataSchema } from '@noggin/types/module-types'
import { quizSchema, submissionSchema } from '@noggin/types/quiz-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as fsUtils from '../common/fs-utils'
import {
    ensureDir,
    findFiles,
    readJsonFile,
    removeDirectoryRecursively,
    writeJsonFile,
} from '../common/fs-utils'
import { getModuleMetadataPath, getQuizPath, getSubmissionPath } from '../common/module-utils'
import {
    deleteModuleSource,
    ensureModuleDirectories,
    readModuleById,
    readModuleData,
    readModuleMetadata,
    removeModule,
    writeModuleData,
    writeModuleMetadata,
    writeModuleSource,
} from './module-core-service'
import { resolveModulePath } from './module-discovery-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../common/fs-utils')
vi.mock('../common/module-utils')
vi.mock('./module-discovery-service')

// Add mock implementation for module utils functions
vi.mocked(getModuleMetadataPath).mockImplementation((modPath) => {
    return path.join(modPath, '.mod', 'meta.json')
})

describe('ModuleCoreService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'

    const mockModuleMetadata = {
        id: mockModuleId,
        title: 'Test Module',
        slug: 'test-module',
        overview: 'Test Module Overview',
        createdAt: '2024-01-01T00:00:00Z',
        path: mockModulePath,
        updatedAt: '2024-01-01T00:00:00Z',
        libraryId: mockLibraryId,
    }

    beforeEach(() => {
        vi.resetAllMocks()

        // Setup common mocks
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'))
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('module creation bug', () => {
        it('should create module in the correct directory path', async () => {
            // Arrange
            const libraryPath = '/test/library'
            const moduleId = 'test-module-20240101T000000Z'
            const fullModPath = `${libraryPath}/${moduleId}`

            const mod: Mod = {
                metadata: {
                    id: moduleId,
                    title: 'Test Module',
                    slug: 'test-module',
                    overview: 'Test Module Overview',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    libraryId: 'test-library',
                    path: fullModPath,
                },
                sources: [],
                quizzes: [],
                submissions: [],
            }

            // Spy on the fs-utils functions
            const ensureDirSpy = vi.spyOn(fsUtils, 'ensureDir').mockResolvedValue(undefined)
            const writeJsonFileSpy = vi.spyOn(fsUtils, 'writeJsonFile').mockResolvedValue(undefined)

            try {
                // Act
                await writeModuleData(fullModPath, mod)

                // Assert - Verify directories are created under fullModPath/.mod
                expect(ensureDirSpy).toHaveBeenCalledWith(`${fullModPath}/.mod/quizzes`)
                expect(ensureDirSpy).toHaveBeenCalledWith(`${fullModPath}/.mod/submissions`)
            } finally {
                // Clean up
                ensureDirSpy.mockRestore()
                writeJsonFileSpy.mockRestore()
            }
        })
    })

    describe('readModuleMetadata', () => {
        it('should read and parse metadata from the correct path', async () => {
            // Arrange
            const metadataPath = `${mockModulePath}/.mod/meta.json`

            // Make getModuleMetadataPath return the expected path
            vi.mocked(getModuleMetadataPath).mockReturnValueOnce(metadataPath)
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockModuleMetadata)

            // Act
            const result = await readModuleMetadata(mockModulePath)

            // Assert
            expect(readJsonFile).toHaveBeenCalledWith(metadataPath, moduleMetadataSchema)
            expect(result).toEqual(mockModuleMetadata)
        })

        it('should throw an error if metadata cannot be read', async () => {
            // Arrange
            const metadataPath = `${mockModulePath}/.mod/meta.json`
            const mockError = new Error('Failed to read file')

            vi.mocked(getModuleMetadataPath).mockReturnValueOnce(metadataPath)
            vi.mocked(readJsonFile).mockRejectedValueOnce(mockError)

            // Act & Assert
            await expect(readModuleMetadata(mockModulePath)).rejects.toThrow(
                `Failed to read metadata for module at ${mockModulePath}: ${mockError}`
            )
        })
    })

    describe('writeModuleMetadata', () => {
        it('should write metadata to the correct path', async () => {
            // Arrange
            const metadataPath = `${mockModulePath}/.mod/meta.json`

            vi.mocked(getModuleMetadataPath).mockReturnValueOnce(metadataPath)
            vi.mocked(writeJsonFile).mockResolvedValueOnce(undefined)

            // Act
            await writeModuleMetadata(mockModulePath, mockModuleMetadata)

            // Assert
            expect(writeJsonFile).toHaveBeenCalledWith(metadataPath, mockModuleMetadata)
        })
    })

    describe('ensureModuleDirectories', () => {
        it('should create necessary module directories', async () => {
            // Arrange
            const quizzesPath = `${mockModulePath}/.mod/quizzes`
            const submissionsPath = `${mockModulePath}/.mod/submissions`

            vi.mocked(path.join)
                .mockReturnValueOnce(quizzesPath)
                .mockReturnValueOnce(submissionsPath)

            // Act
            await ensureModuleDirectories(mockModulePath)

            // Assert
            expect(path.join).toHaveBeenCalledWith(mockModulePath, '.mod/quizzes')
            expect(path.join).toHaveBeenCalledWith(mockModulePath, '.mod/submissions')
        })
    })

    describe('readModuleData', () => {
        it('should read all module data components', async () => {
            // Arrange
            // Instead of mocking readModuleMetadata (which is in the same file),
            // we mock the underlying dependencies
            const metadataPath = `${mockModulePath}/.mod/meta.json`
            vi.mocked(getModuleMetadataPath).mockReturnValueOnce(metadataPath)

            // Setup readJsonFile to return metadata when called with metadataPath
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (path === metadataPath && schema === moduleMetadataSchema) {
                    return mockModuleMetadata
                } else if (schema === quizSchema) {
                    if (path.includes('quiz1')) {
                        return {
                            id: 'quiz1',
                            questions: [],
                            createdAt: '2024-01-01T00:00:00Z',
                            sources: [],
                            timeLimit: 600,
                            title: 'Quiz 1',
                        }
                    } else {
                        return {
                            id: 'quiz2',
                            questions: [],
                            createdAt: '2024-01-01T00:00:00Z',
                            sources: [],
                            timeLimit: 600,
                            title: 'Quiz 2',
                        }
                    }
                } else if (schema === submissionSchema) {
                    if (path.includes('sub1')) {
                        return {
                            quizId: 'quiz1',
                            attemptNumber: 1,
                            completedAt: '2024-01-01T00:00:00Z',
                            responses: [],
                            status: 'pending' as const,
                            libraryId: mockLibraryId,
                            moduleSlug: 'test-module',
                            quizTitle: 'Quiz 1',
                            timeElapsed: 300,
                            timeLimit: 600,
                        }
                    } else {
                        return {
                            quizId: 'quiz2',
                            attemptNumber: 1,
                            completedAt: '2024-01-01T00:00:00Z',
                            responses: [],
                            status: 'pending' as const,
                            libraryId: mockLibraryId,
                            moduleSlug: 'test-module',
                            quizTitle: 'Quiz 2',
                            timeElapsed: 300,
                            timeLimit: 600,
                        }
                    }
                }
                throw new Error(`Unexpected path or schema: ${path}, ${schema}`)
            })

            // Mock findFiles for sources, quizzes, and submissions
            vi.mocked(findFiles).mockImplementation(async (pattern, _options) => {
                if (pattern.includes('*.{txt,pdf}')) {
                    return [`${mockModulePath}/source1.txt`, `${mockModulePath}/source2.pdf`]
                } else if (pattern.includes('quizzes')) {
                    return [
                        `${mockModulePath}/.mod/quizzes/quiz1.json`,
                        `${mockModulePath}/.mod/quizzes/quiz2.json`,
                    ]
                } else if (pattern.includes('submissions')) {
                    return [
                        `${mockModulePath}/.mod/submissions/sub1.json`,
                        `${mockModulePath}/.mod/submissions/sub2.json`,
                    ]
                }
                return []
            })

            // Act
            const result = await readModuleData(mockModulePath)

            // Assert
            // We shouldn't expect readModuleMetadata to be called as a mock
            // since it's an internal function in the same file
            expect(findFiles).toHaveBeenCalledTimes(3)
            expect(result).toEqual({
                metadata: mockModuleMetadata,
                stats: expect.any(Object),
                sources: [`${mockModulePath}/source1.txt`, `${mockModulePath}/source2.pdf`],
                quizzes: [
                    {
                        id: 'quiz1',
                        questions: [],
                        createdAt: '2024-01-01T00:00:00Z',
                        sources: [],
                        timeLimit: 600,
                        title: 'Quiz 1',
                    },
                    {
                        id: 'quiz2',
                        questions: [],
                        createdAt: '2024-01-01T00:00:00Z',
                        sources: [],
                        timeLimit: 600,
                        title: 'Quiz 2',
                    },
                ],
                submissions: [
                    {
                        quizId: 'quiz1',
                        attemptNumber: 1,
                        completedAt: '2024-01-01T00:00:00Z',
                        responses: [],
                        status: 'pending' as const,
                        libraryId: mockLibraryId,
                        moduleSlug: 'test-module',
                        quizTitle: 'Quiz 1',
                        timeElapsed: 300,
                        timeLimit: 600,
                    },
                    {
                        quizId: 'quiz2',
                        attemptNumber: 1,
                        completedAt: '2024-01-01T00:00:00Z',
                        responses: [],
                        status: 'pending' as const,
                        libraryId: mockLibraryId,
                        moduleSlug: 'test-module',
                        quizTitle: 'Quiz 2',
                        timeElapsed: 300,
                        timeLimit: 600,
                    },
                ],
            })
        })
    })

    describe('readModuleById', () => {
        it('should resolve path and read module data', async () => {
            // Arrange
            const metadataPath = `${mockModulePath}/.mod/meta.json`

            // Mock resolveModulePath to return the module path
            vi.mocked(resolveModulePath).mockResolvedValue(mockModulePath)

            // Mock getModuleMetadataPath for the readModuleMetadata function
            vi.mocked(getModuleMetadataPath).mockReturnValue(metadataPath)

            // Mock readJsonFile to return mockModuleMetadata when called with metadata path
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (path === metadataPath && schema === moduleMetadataSchema) {
                    return mockModuleMetadata
                }
                throw new Error(`Unexpected path or schema: ${path}, ${schema}`)
            })

            // Mock findFiles for sources
            vi.mocked(findFiles).mockImplementation(async (pattern, _options) => {
                if (pattern.includes('*.{txt,pdf}')) {
                    return [`${mockModulePath}/source1.txt`]
                } else if (pattern.includes('quizzes')) {
                    return []
                } else if (pattern.includes('submissions')) {
                    return []
                }
                return []
            })

            // Act
            const result = await readModuleById(mockLibraryId, mockModuleId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            // We can't expect readModuleData to be called directly since it's in the same file
            expect(result.metadata).toEqual(mockModuleMetadata)
            expect(result.sources).toEqual([`${mockModulePath}/source1.txt`])
            expect(result.quizzes).toEqual([])
            expect(result.submissions).toEqual([])
        })

        it('should throw an error if module not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(readModuleById(mockLibraryId, 'non-existent')).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('writeModuleData', () => {
        it('should ensure directories and write all module components', async () => {
            // Arrange
            const mod = {
                metadata: mockModuleMetadata,
                quizzes: [
                    {
                        id: 'quiz1',
                        questions: [],
                        createdAt: '2024-01-01T00:00:00Z',
                        sources: [],
                        timeLimit: 600,
                        title: 'Quiz 1',
                    },
                ],
                submissions: [
                    {
                        quizId: 'quiz1',
                        attemptNumber: 1,
                        completedAt: '2024-01-01T00:00:00Z',
                        responses: [],
                        status: 'pending' as const,
                        libraryId: mockLibraryId,
                        moduleSlug: 'test-module',
                        quizTitle: 'Quiz 1',
                        timeElapsed: 300,
                        timeLimit: 600,
                    },
                ],
                sources: [`${mockModulePath}/source1.txt`],
            }

            // Mock paths
            const quizzesPath = `${mockModulePath}/.mod/quizzes`
            const submissionsPath = `${mockModulePath}/.mod/submissions`
            const metadataPath = `${mockModulePath}/.mod/meta.json`
            const quizPath = `${mockModulePath}/.mod/quizzes/quiz1.json`
            const subPath = `${mockModulePath}/.mod/submissions/quiz1-1.json`

            // Setup path.join mocks for ensureModuleDirectories
            vi.mocked(path.join)
                .mockReturnValueOnce(quizzesPath) // for ensureModuleDirectories
                .mockReturnValueOnce(submissionsPath) // for ensureModuleDirectories

            // Mock getModuleMetadataPath for writeModuleMetadata
            vi.mocked(getModuleMetadataPath).mockReturnValueOnce(metadataPath)

            // Mock getQuizPath and getSubmissionPath
            vi.mocked(getQuizPath).mockReturnValueOnce(quizPath)
            vi.mocked(getSubmissionPath).mockReturnValueOnce(subPath)

            // Mock the fs utility functions
            vi.mocked(ensureDir).mockResolvedValue(undefined)
            vi.mocked(writeJsonFile).mockResolvedValue(undefined)

            // Act
            await writeModuleData(mockModulePath, mod)

            // Assert
            expect(ensureDir).toHaveBeenCalledWith(quizzesPath)
            expect(ensureDir).toHaveBeenCalledWith(submissionsPath)
            expect(writeJsonFile).toHaveBeenCalledWith(metadataPath, mockModuleMetadata)
            expect(writeJsonFile).toHaveBeenCalledWith(quizPath, mod.quizzes[0])
            expect(writeJsonFile).toHaveBeenCalledWith(subPath, mod.submissions[0])
        })
    })

    describe('removeModule', () => {
        it('should remove module directory recursively', async () => {
            // Arrange
            vi.mocked(removeDirectoryRecursively).mockResolvedValueOnce(undefined)

            // Act
            await removeModule(mockModulePath)

            // Assert
            expect(removeDirectoryRecursively).toHaveBeenCalledWith(mockModulePath)
        })

        it('should propagate errors from file system operations', async () => {
            // Arrange
            const mockError = new Error('Failed to remove directory')
            vi.mocked(removeDirectoryRecursively).mockRejectedValueOnce(mockError)

            // Act & Assert
            await expect(removeModule(mockModulePath)).rejects.toThrow(mockError)
        })
    })

    describe('writeModuleSource', () => {
        it('should copy source file to module directory', async () => {
            // Arrange
            const sourceFile = {
                path: '/temp/source.txt',
                name: 'source.txt',
                size: 100,
                modifiedAt: Date.now(),
                isDirectory: false,
            }
            const targetPath = `${mockModulePath}/source.txt`

            vi.mocked(path.basename).mockReturnValueOnce('source.txt')
            vi.mocked(path.join).mockReturnValueOnce(targetPath)
            vi.mocked(fs.copyFile).mockResolvedValueOnce(undefined)

            // Act
            const result = await writeModuleSource(mockModulePath, sourceFile)

            // Assert
            expect(fs.copyFile).toHaveBeenCalledWith(sourceFile.path, targetPath)
            expect(result).toBe(targetPath)
        })
    })

    describe('deleteModuleSource', () => {
        it('should delete a source file', async () => {
            // Arrange
            const sourcePath = `${mockModulePath}/source.txt`
            vi.mocked(fs.unlink).mockResolvedValueOnce(undefined)

            // Act
            await deleteModuleSource(sourcePath)

            // Assert
            expect(fs.unlink).toHaveBeenCalledWith(sourcePath)
        })
    })
})
