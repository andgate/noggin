import { moduleStatsSchema } from '@noggin/types/module-types'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getModuleStatsPath } from '../common/module-utils'
import { getAllLibraries } from './library-service'
import { readModuleById } from './module-core-service'
import { getModuleOverviews, resolveModulePath } from './module-discovery-service'
import {
    getAllModuleStats,
    getDueModules,
    getModuleStats,
    saveModuleStats,
} from './module-stats-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../common/fs-utils')
vi.mock('../common/module-utils')
vi.mock('./library-service')
vi.mock('./module-core-service')
vi.mock('./module-discovery-service')

describe('ModuleStatsService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'

    const mockLibrary = {
        path: '/test/library',
        metadata: {
            name: 'Test Library',
            description: 'Test Library Description',
            createdAt: '2024-01-01T00:00:00Z',
            slug: mockLibraryId,
        },
    }

    const mockStats = {
        moduleId: mockModuleId,
        currentBox: 1,
        lastReviewDate: '2024-01-01T00:00:00Z',
        nextDueDate: '2024-01-02T00:00:00Z',
    }

    const mockModuleOverview = {
        id: mockModuleId,
        slug: mockModuleId,
        displayName: 'Test Module',
        librarySlug: mockLibraryId,
    }

    const mockModule = {
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
        stats: mockStats,
        quizzes: [],
        submissions: [],
        sources: [],
    }

    const mockStatsPath = `${mockModulePath}/.mod/stats.json`

    beforeEach(() => {
        vi.resetAllMocks()

        // Common mocks
        vi.mocked(resolveModulePath).mockResolvedValue(mockModulePath)
        vi.mocked(getModuleStatsPath).mockReturnValue(mockStatsPath)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getModuleStats', () => {
        it('should read stats from the correct path', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getModuleStats(mockLibraryId, mockModuleId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(readJsonFile).toHaveBeenCalledWith(mockStatsPath, moduleStatsSchema)
            expect(result).toEqual(mockStats)
        })

        it('should return default stats if no stats file exists', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockRejectedValueOnce(new Error('File not found'))

            // Act
            const result = await getModuleStats(mockLibraryId, mockModuleId)

            // Assert
            expect(result).toEqual({
                moduleId: mockModuleId,
                currentBox: 1,
                lastReviewDate: expect.any(String),
                nextDueDate: expect.any(String),
            })
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(getModuleStats(mockLibraryId, 'non-existent')).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('saveModuleStats', () => {
        it('should save stats to the correct path', async () => {
            // Arrange
            vi.mocked(writeJsonFile).mockResolvedValueOnce(undefined)

            // Act
            await saveModuleStats(mockLibraryId, mockModuleId, mockStats)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(writeJsonFile).toHaveBeenCalledWith(mockStatsPath, mockStats)
        })

        it('should do nothing if stats is undefined', async () => {
            // Act
            await saveModuleStats(mockLibraryId, mockModuleId, undefined)

            // Assert
            expect(writeJsonFile).not.toHaveBeenCalled()
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(saveModuleStats(mockLibraryId, 'non-existent', mockStats)).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('getAllModuleStats', () => {
        it('should return stats for all modules across all libraries', async () => {
            // Arrange
            const mockStatsPath = `${mockModulePath}/.mod/stats.json`

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(resolveModulePath).mockResolvedValueOnce(mockModulePath)
            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath)
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledWith(mockLibraryId)
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(readJsonFile).toHaveBeenCalledWith(mockStatsPath, moduleStatsSchema)
            expect(result).toEqual([mockStats])
        })

        it('should filter out modules that fail to load stats', async () => {
            const mockLibraryId = 'test-library'
            const mockModuleId1 = 'test-module-1'
            const mockModuleId2 = 'test-module-2'
            const mockModulePath1 = '/test/library/test-module-1'

            // Mock library with correct structure
            const mockLibraries = [
                {
                    path: '/test/library',
                    metadata: {
                        name: 'Test Library',
                        description: 'Test Library Description',
                        createdAt: '2024-01-01T00:00:00Z',
                        slug: mockLibraryId,
                    },
                },
            ]

            // Mock module overviews
            const mockModuleOverviews = [
                {
                    id: mockModuleId1,
                    slug: mockModuleId1,
                    displayName: 'Test Module 1',
                    librarySlug: mockLibraryId,
                },
                {
                    id: mockModuleId2,
                    slug: mockModuleId2,
                    displayName: 'Test Module 2',
                    librarySlug: mockLibraryId,
                },
            ]

            // Module 1 stats that will load successfully
            const mockStats1 = {
                moduleId: mockModuleId1,
                currentBox: 1,
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-02T00:00:00Z',
            }

            const mockStatsPath1 = `${mockModulePath1}/.mod/stats.json`

            // Set up mocks for each service call
            vi.mocked(getAllLibraries).mockResolvedValueOnce(mockLibraries)
            vi.mocked(getModuleOverviews).mockResolvedValueOnce(mockModuleOverviews)

            // Mock resolveModulePath to succeed for module1 and fail for module2
            vi.mocked(resolveModulePath).mockImplementation(async (libId, modId) => {
                if (modId === mockModuleId1) {
                    return mockModulePath1
                }
                return null // module2 path resolution fails
            })

            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath1)
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats1)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].moduleId).toBe(mockModuleId1)
            expect(result[0]).toEqual(mockStats1)
        })

        it('should handle multiple libraries and modules', async () => {
            // Arrange
            const library2 = {
                ...mockLibrary,
                path: '/test/library2',
                metadata: {
                    ...mockLibrary.metadata,
                    slug: 'test-library2',
                },
            }

            const moduleOverview2 = {
                ...mockModuleOverview,
                id: 'module2-id',
                librarySlug: 'test-library2',
            }

            const stats2 = {
                ...mockStats,
                moduleId: 'module2-id',
            }

            const mockModulePath2 = '/test/library2/module2'
            const mockStatsPath1 = `${mockModulePath}/.mod/stats.json`
            const mockStatsPath2 = `${mockModulePath2}/.mod/stats.json`

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary, library2])
            vi.mocked(getModuleOverviews)
                .mockResolvedValueOnce([mockModuleOverview])
                .mockResolvedValueOnce([moduleOverview2])

            // First module mocks
            vi.mocked(resolveModulePath)
                .mockResolvedValueOnce(mockModulePath) // First call for first module
                .mockResolvedValueOnce(mockModulePath2) // Second call for second module

            vi.mocked(getModuleStatsPath)
                .mockReturnValueOnce(mockStatsPath1) // First call
                .mockReturnValueOnce(mockStatsPath2) // Second call

            vi.mocked(readJsonFile)
                .mockResolvedValueOnce(mockStats) // First call
                .mockResolvedValueOnce(stats2) // Second call

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledTimes(2)
            expect(resolveModulePath).toHaveBeenCalledTimes(2)
            expect(getModuleStatsPath).toHaveBeenCalledTimes(2)
            expect(readJsonFile).toHaveBeenCalledTimes(2)
            expect(result).toEqual([mockStats, stats2])
        })
    })

    describe('getDueModules', () => {
        it('should return modules that are due for review', async () => {
            // Mock a fixed date for testing in a more reliable way
            const realDate = global.Date
            const mockCurrentDate = new Date('2024-01-02T00:00:00Z').getTime()

            // This approach to mocking Date works better with date comparisons
            global.Date = class extends realDate {
                constructor(
                    arg1?: number | string | Date,
                    arg2?: number,
                    arg3?: number,
                    arg4?: number,
                    arg5?: number,
                    arg6?: number,
                    arg7?: number
                ) {
                    if (arguments.length === 0) {
                        super(mockCurrentDate) // When called with no args, return our fixed date
                    } else {
                        // @ts-ignore - TypeScript doesn't like passing arguments directly
                        super(...arguments) // When called with args (like parsing a date string), use real Date
                    }
                }
                static now() {
                    return mockCurrentDate
                }
            } as any

            // Module with due date matching current date
            const dueStats = {
                moduleId: mockModuleId,
                currentBox: 1,
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-02T00:00:00Z', // Due today
            }

            // Mock both the embedded stats and the getModuleStats response
            const moduleWithDueStats = {
                ...mockModule,
                stats: dueStats,
            }

            // Setup dependencies
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(moduleWithDueStats)

            // The getDueModules function also calls getModuleStats directly
            vi.mocked(resolveModulePath).mockResolvedValueOnce(mockModulePath)
            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath)
            vi.mocked(readJsonFile).mockResolvedValueOnce(dueStats)

            // Act
            const result = await getDueModules()

            // Assert - verify that the module is included in results
            expect(result.length).toBeGreaterThan(0)
            expect(result.some((mod) => mod.metadata.id === mockModuleId)).toBe(true)

            // Verify all modules returned have nextDueDate <= current date
            result.forEach((mod) => {
                const nextDue = new Date(mod.stats?.nextDueDate || '')
                expect(nextDue <= new Date(mockCurrentDate)).toBe(true)
            })

            // Restore original Date
            global.Date = realDate
        })

        it('should not return modules that are not yet due', async () => {
            // Mock a fixed date for testing in a more reliable way
            const realDate = global.Date
            const mockCurrentDate = new Date('2024-01-01T00:00:00Z').getTime()

            // This approach to mocking Date works better with date comparisons
            global.Date = class extends realDate {
                constructor(
                    arg1?: number | string | Date,
                    arg2?: number,
                    arg3?: number,
                    arg4?: number,
                    arg5?: number,
                    arg6?: number,
                    arg7?: number
                ) {
                    if (arguments.length === 0) {
                        super(mockCurrentDate) // When called with no args, return our fixed date
                    } else {
                        // @ts-ignore - TypeScript doesn't like passing arguments directly
                        super(...arguments) // When called with args (like parsing a date string), use real Date
                    }
                }
                static now() {
                    return mockCurrentDate
                }
            } as any

            // Module with future due date
            const futureStats = {
                moduleId: mockModuleId,
                currentBox: 1,
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-02T00:00:00Z', // Due tomorrow, not today
            }

            // Create module with future due date
            const moduleWithFutureStats = {
                ...mockModule,
                stats: futureStats,
            }

            // Setup dependencies
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(moduleWithFutureStats)

            // The service also calls getModuleStats directly
            vi.mocked(resolveModulePath).mockResolvedValueOnce(mockModulePath)
            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath)
            vi.mocked(readJsonFile).mockResolvedValueOnce(futureStats)

            // Act
            const result = await getDueModules()

            // Assert - verify that no modules with future dates are returned
            expect(result.length).toBe(0)

            // Restore original Date
            global.Date = realDate
        })

        it('should sort modules by priority', async () => {
            // Mock a fixed date for testing in a more reliable way
            const realDate = global.Date
            const mockCurrentDate = new Date('2024-01-05T00:00:00Z').getTime()

            // This approach to mocking Date works better with date comparisons
            global.Date = class extends realDate {
                constructor(
                    arg1?: number | string | Date,
                    arg2?: number,
                    arg3?: number,
                    arg4?: number,
                    arg5?: number,
                    arg6?: number,
                    arg7?: number
                ) {
                    if (arguments.length === 0) {
                        super(mockCurrentDate) // When called with no args, return our fixed date
                    } else {
                        // @ts-ignore - TypeScript doesn't like passing arguments directly
                        super(...arguments) // When called with args (like parsing a date string), use real Date
                    }
                }
                static now() {
                    return mockCurrentDate
                }
            } as any

            // Create modules with different priorities
            // Module 1 - less overdue (1 day) and higher box (3) = lower priority
            const mockModuleId1 = 'module-1'
            const mockStats1 = {
                moduleId: mockModuleId1,
                currentBox: 3, // Higher box number = lower priority
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-04T00:00:00Z', // 1 day overdue
            }

            // Module 2 - more overdue (3 days) and lower box (1) = higher priority
            const mockModuleId2 = 'module-2'
            const mockStats2 = {
                moduleId: mockModuleId2,
                currentBox: 1, // Lower box number = higher priority
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-02T00:00:00Z', // 3 days overdue
            }

            // Create full module objects with embedded stats
            const mockModule1 = {
                metadata: {
                    id: mockModuleId1,
                    title: 'Test Module 1',
                    slug: mockModuleId1,
                    overview: 'Test Overview 1',
                    createdAt: '2024-01-01T00:00:00Z',
                    path: '/path/to/module1',
                    updatedAt: '2024-01-01T00:00:00Z',
                    libraryId: mockLibraryId,
                },
                stats: mockStats1,
                quizzes: [],
                submissions: [],
                sources: [],
            }

            const mockModule2 = {
                metadata: {
                    id: mockModuleId2,
                    title: 'Test Module 2',
                    slug: mockModuleId2,
                    overview: 'Test Overview 2',
                    createdAt: '2024-01-01T00:00:00Z',
                    path: '/path/to/module2',
                    updatedAt: '2024-01-01T00:00:00Z',
                    libraryId: mockLibraryId,
                },
                stats: mockStats2,
                quizzes: [],
                submissions: [],
                sources: [],
            }

            // Create module overviews for both modules
            const mockModuleOverviews = [
                {
                    id: mockModuleId1,
                    slug: mockModuleId1,
                    displayName: 'Test Module 1',
                    librarySlug: mockLibraryId,
                },
                {
                    id: mockModuleId2,
                    slug: mockModuleId2,
                    displayName: 'Test Module 2',
                    librarySlug: mockLibraryId,
                },
            ]

            // Setup dependencies
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce(mockModuleOverviews)

            // Mock readModuleById to return the appropriate module based on ID
            const mockReadModuleById = vi.mocked(readModuleById)
            mockReadModuleById.mockImplementation(async (libId, modId) => {
                if (modId === mockModuleId1) return mockModule1
                if (modId === mockModuleId2) return mockModule2
                throw new Error('Module not found')
            })

            // Mock getModuleStats to return the appropriate stats based on ID
            vi.mocked(resolveModulePath).mockImplementation(async (libId, modId) => {
                if (modId === mockModuleId1) return '/path/to/module1'
                if (modId === mockModuleId2) return '/path/to/module2'
                return null
            })

            vi.mocked(getModuleStatsPath).mockImplementation((modPath) => {
                return `${modPath}/.mod/stats.json`
            })

            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (path.includes('module1')) return mockStats1
                if (path.includes('module2')) return mockStats2
                throw new Error('Stats not found')
            })

            // Act
            const result = await getDueModules()

            // Assert - verify that both modules are returned and sorted correctly
            expect(result).toHaveLength(2)

            // Module 2 should be first (higher priority due to more days overdue and lower box)
            // As defined in calculatePriority, priority = daysOverdue + (6 - currentBox) * 0.1
            expect(result[0].metadata.id).toBe(mockModuleId2)
            expect(result[1].metadata.id).toBe(mockModuleId1)

            // Restore original Date
            global.Date = realDate
        })

        it('should handle errors when reading modules', async () => {
            // Arrange
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockRejectedValueOnce(new Error('Failed to read module'))

            // Act
            const result = await getDueModules()

            // Assert
            expect(result).toHaveLength(0)
        })
    })
})
