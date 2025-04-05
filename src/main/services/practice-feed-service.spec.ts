import { Mod, ModuleStats } from '@noggin/types/module-types'
import { Submission } from '@noggin/types/quiz-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as dateUtils from '../common/date-utils'
import * as spacedRepetition from '../common/spaced-repetition'
import { LeitnerBox } from '../common/spaced-repetition'
import { getAllLibraries } from './library-service'
import { readModuleById } from './module-service/module-core-service'
import { getModuleOverviews } from './module-service/module-discovery-service'
import * as moduleStatsService from './module-service/module-stats-service'
import { getDueModules, updateReviewSchedule } from './practice-feed-service'

// Mock dependencies
vi.mock('./module-service/module-stats-service')
vi.mock('./library-service')
vi.mock('./module-service/module-core-service')
vi.mock('./module-service/module-discovery-service')
vi.mock('../common/date-utils')
vi.mock('../common/spaced-repetition')

describe('PracticeFeedService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'

    const mockLibrary = {
        path: '/test/library',
        metadata: {
            name: 'Test Library',
            description: 'Test Description',
            createdAt: '2024-01-01T00:00:00Z',
            slug: mockLibraryId,
        },
        modules: [],
    }

    const mockModuleOverview = {
        id: mockModuleId,
        slug: 'test-module',
        displayName: 'Test Module',
        librarySlug: mockLibraryId,
    }

    const mockStats: ModuleStats = {
        moduleId: mockModuleId,
        currentBox: 1,
        nextReviewDate: '2024-01-02T00:00:00Z',
    }

    const mockModule: Mod = {
        metadata: {
            id: mockModuleId,
            title: 'Test Module',
            slug: 'test-module',
            overview: 'Test Overview',
            createdAt: '2024-01-01T00:00:00Z',
            path: '/test/library/test-module',
            updatedAt: '2024-01-01T00:00:00Z',
            libraryId: mockLibraryId,
        },
        stats: mockStats,
        quizzes: [],
        submissions: [],
        sources: [],
    }

    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2023-01-15T12:00:00Z'))

        // Mock spacing functions that we need for tests
        vi.mocked(spacedRepetition.calculatePriority).mockImplementation((stats) => {
            if (!stats) return 0
            const box = stats.currentBox
            return 1 + (6 - box) * 0.1 // Simple priority calculation for testing
        })

        vi.mocked(spacedRepetition.updateModuleStats).mockImplementation((stats, passed) => {
            const newBox = passed ? Math.min(stats.currentBox + 1, 5) : 1
            return {
                ...stats,
                currentBox: newBox,
                nextReviewDate: passed ? '2023-01-22T12:00:00Z' : '2023-01-16T12:00:00Z',
            }
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('updateReviewSchedule', () => {
        it('should not update review schedule for ungraded submissions', async () => {
            // Create an ungraded submission
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-15T12:00:00Z',
                quizTitle: 'Test Quiz',
                timeElapsed: 300,
                timeLimit: 600,
                libraryId: mockLibraryId,
                moduleSlug: mockModuleId,
                responses: [],
                status: 'pending', // Use pending instead of completed
                grade: undefined,
                letterGrade: undefined,
            }

            // Call the function under test
            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            // Assert that the schedule was not updated
            expect(result).toBe(false)
            expect(moduleStatsService.getModuleStats).not.toHaveBeenCalled()
            expect(spacedRepetition.updateModuleStats).not.toHaveBeenCalled()
            expect(moduleStatsService.saveModuleStats).not.toHaveBeenCalled()
        })

        it('should update review schedule for graded submissions with passing grade', async () => {
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                nextReviewDate: '2023-01-03T12:00:00Z',
            }

            const expectedUpdatedStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 3,
                nextReviewDate: '2023-01-22T12:00:00Z',
            }

            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)
            vi.mocked(spacedRepetition.updateModuleStats).mockReturnValue(expectedUpdatedStats)

            // Create a graded submission with passing grade
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-15T12:00:00Z',
                quizTitle: 'Test Quiz',
                timeElapsed: 300,
                timeLimit: 600,
                libraryId: mockLibraryId,
                moduleSlug: mockModuleId,
                responses: [],
                status: 'graded',
                grade: 75, // Passing grade (above 60)
                letterGrade: 'C',
            }

            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, true)
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                expectedUpdatedStats
            )
        })

        it('should update review schedule for graded submissions with failing grade', async () => {
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                nextReviewDate: '2023-01-03T12:00:00Z',
            }

            const expectedUpdatedStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 1,
                nextReviewDate: '2023-01-16T12:00:00Z',
            }

            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)
            vi.mocked(spacedRepetition.updateModuleStats).mockReturnValue(expectedUpdatedStats)

            // Create a graded submission with failing grade
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-15T12:00:00Z',
                quizTitle: 'Test Quiz',
                timeElapsed: 300,
                timeLimit: 600,
                libraryId: mockLibraryId,
                moduleSlug: mockModuleId,
                responses: [],
                status: 'graded',
                grade: 45, // Failing grade (below 60)
                letterGrade: 'F',
            }

            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, false)
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                expectedUpdatedStats
            )
        })

        it('should update review schedule even if submission is older than lastReviewDate concept (which is removed)', async () => {
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                nextReviewDate: '2023-01-22T12:00:00Z',
            }

            const expectedUpdatedStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 3,
                nextReviewDate: '2023-01-22T12:00:00Z',
            }

            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)
            vi.mocked(spacedRepetition.updateModuleStats).mockReturnValue(expectedUpdatedStats)

            // Create a graded submission with passing grade
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-10T12:00:00Z', // Older date
                quizTitle: 'Test Quiz',
                timeElapsed: 300,
                timeLimit: 600,
                libraryId: mockLibraryId,
                moduleSlug: mockModuleId,
                responses: [],
                status: 'graded',
                grade: 75, // Passing grade (above 60)
                letterGrade: 'C',
            }

            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, true)
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                expectedUpdatedStats
            )
        })
    })

    describe('getDueModules', () => {
        it('should return modules that are due for review', async () => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2024-01-02T00:00:00Z'))

            const dueStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 1,
                nextReviewDate: '2024-01-02T00:00:00Z', // Due today
            }

            const moduleWithDueStats = { ...mockModule, stats: dueStats }

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(moduleWithDueStats)
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValueOnce(dueStats)

            const result = await getDueModules()

            expect(result.length).toBe(1)
            expect(result[0].metadata.id).toBe(mockModuleId)
        })

        it('should not return modules that are not yet due', async () => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2024-01-01T00:00:00Z'))

            const futureStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 1,
                nextReviewDate: '2024-01-02T00:00:00Z', // Due tomorrow
            }

            const moduleWithFutureStats = { ...mockModule, stats: futureStats }

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockResolvedValueOnce(moduleWithFutureStats)
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValueOnce(futureStats)

            const result = await getDueModules()

            expect(result.length).toBe(0)
        })

        it('should sort modules by priority', async () => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2024-01-05T00:00:00Z'))

            const mockModuleId1 = 'module-1'
            const mockStats1: ModuleStats = {
                moduleId: mockModuleId1,
                currentBox: 3, // Higher box = lower priority bonus
                nextReviewDate: '2024-01-04T00:00:00Z', // 1 day overdue
            }

            const mockModuleId2 = 'module-2'
            const mockStats2: ModuleStats = {
                moduleId: mockModuleId2,
                currentBox: 1, // Lower box = higher priority bonus
                nextReviewDate: '2024-01-02T00:00:00Z', // 3 days overdue
            }

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

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce(mockModuleOverviews)

            // Set up module reading mocks
            vi.mocked(readModuleById)
                .mockResolvedValueOnce(mockModule1)
                .mockResolvedValueOnce(mockModule2)

            // Set up stats mocks
            vi.mocked(moduleStatsService.getModuleStats)
                .mockResolvedValueOnce(mockStats1)
                .mockResolvedValueOnce(mockStats2)

            // Mock calculation priorities
            vi.mocked(spacedRepetition.calculatePriority)
                .mockReturnValueOnce(1.3) // For mockStats1: Box 3
                .mockReturnValueOnce(1.5) // For mockStats2: Box 1

            const result = await getDueModules()

            expect(result.length).toBe(2)
            expect(result[0].metadata.id).toBe(mockModuleId2) // Higher priority
            expect(result[1].metadata.id).toBe(mockModuleId1) // Lower priority
        })

        it('should handle errors when reading modules', async () => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2024-01-05T00:00:00Z'))

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(readModuleById).mockRejectedValueOnce(new Error('Failed to read module'))

            const result = await getDueModules()

            expect(result).toHaveLength(0)
        })
    })
})
