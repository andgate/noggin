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
        slug: 'test-module',
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
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(getModuleStats).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledWith(mockLibraryId)
            expect(getModuleStats).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(result).toEqual([mockStats])
        })

        it('should filter out modules that fail to load stats', async () => {
            // Arrange
            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(getModuleStats).mockRejectedValueOnce(new Error('Failed to get stats'))

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(result).toEqual([])
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

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary, library2])
            vi.mocked(getModuleOverviews)
                .mockResolvedValueOnce([mockModuleOverview])
                .mockResolvedValueOnce([moduleOverview2])
            vi.mocked(getModuleStats).mockResolvedValueOnce(mockStats).mockResolvedValueOnce(stats2)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledTimes(2)
            expect(getModuleStats).toHaveBeenCalledTimes(2)
            expect(result).toEqual([mockStats, stats2])
        })
    })

    describe('getDueModules', () => {
        it('should return modules that are due for review', async () => {
            // Arrange - set current date to match nextDueDate
            const originalDate = global.Date
            const mockDate = new Date('2024-01-02T00:00:00Z')
            global.Date = class extends Date {
                constructor() {
                    super()
                    return mockDate
                }
            } as any

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(mockModule)
            vi.mocked(getModuleStats).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getDueModules()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledWith(mockLibraryId)
            expect(readModuleById).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(mockModule)

            // Restore original Date
            global.Date = originalDate
        })

        it('should not return modules that are not yet due', async () => {
            // Arrange - set current date before nextDueDate
            const originalDate = global.Date
            const mockDate = new Date('2024-01-01T00:00:00Z')
            global.Date = class extends Date {
                constructor() {
                    super()
                    return mockDate
                }
            } as any

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(mockModule)
            vi.mocked(getModuleStats).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getDueModules()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledWith(mockLibraryId)
            expect(readModuleById).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(result).toHaveLength(0)

            // Restore original Date
            global.Date = originalDate
        })

        it('should sort modules by priority', async () => {
            // Arrange
            const originalDate = global.Date
            const mockDate = new Date('2024-01-05T00:00:00Z')
            global.Date = class extends Date {
                constructor() {
                    super()
                    return mockDate
                }
            } as any

            const module1 = {
                ...mockModule,
                stats: {
                    ...mockStats,
                    nextDueDate: '2024-01-01T00:00:00Z', // 4 days overdue
                    currentBox: 1,
                },
            }

            const module2 = {
                ...mockModule,
                metadata: {
                    ...mockModule.metadata,
                    id: 'module2-id',
                },
                stats: {
                    ...mockStats,
                    moduleId: 'module2-id',
                    nextDueDate: '2024-01-03T00:00:00Z', // 2 days overdue
                    currentBox: 1,
                },
            }

            const moduleOverview2 = {
                ...mockModuleOverview,
                id: 'module2-id',
            }

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([
                mockModuleOverview,
                moduleOverview2,
            ])
            vi.mocked(readModuleById).mockResolvedValueOnce(module1).mockResolvedValueOnce(module2)

            // Act
            const result = await getDueModules()

            // Assert
            expect(result).toHaveLength(2)
            // module1 should come first as it's more overdue (higher priority)
            expect(result[0]).toEqual(module1)
            expect(result[1]).toEqual(module2)

            // Restore original Date
            global.Date = originalDate
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
