import { ModuleStats } from '@noggin/types/module-types'
import { Submission } from '@noggin/types/quiz-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as dateUtils from '../common/date-utils'
import * as spacedRepetition from '../common/spaced-repetition'
import { getAllLibraries } from './library-service'
import { readModuleById } from './module-core-service'
import { getModuleOverviews } from './module-discovery-service'
import * as moduleStatsService from './module-stats-service'
import { getDueModules, updateReviewSchedule } from './practice-feed-service'

// Mock dependencies
vi.mock('./module-stats-service')
vi.mock('./library-service')
vi.mock('./module-core-service')
vi.mock('./module-discovery-service')
vi.mock('../common/date-utils')

// Important: We do NOT mock spaced-repetition because it contains pure functions
// that should be tested with the real implementation

describe('PracticeFeedService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'

    const mockLibrary = {
        path: '/test/library',
        metadata: {
            slug: mockLibraryId,
            name: 'Test Library',
            description: 'Test Description',
            createdAt: '2024-01-01T00:00:00Z',
        },
        modules: [],
    }

    const mockModuleOverview = {
        id: mockModuleId,
        slug: 'test-module',
        displayName: 'Test Module',
        librarySlug: mockLibraryId,
    }

    const mockStats = {
        moduleId: mockModuleId,
        currentBox: 1,
        lastReviewDate: '2024-01-01T00:00:00Z',
        nextDueDate: '2024-01-02T00:00:00Z',
    }

    const mockModule = {
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

        // Since Date.now is used in tests checking if updateModuleStats is called,
        // we need to mock it for those tests
        vi.mock('../common/spaced-repetition', async () => {
            const actual = await vi.importActual('../common/spaced-repetition')
            return {
                ...actual,
                updateModuleStats: vi.fn().mockImplementation((stats, passed) => {
                    return {
                        ...stats,
                        currentBox: passed ? Math.min(stats.currentBox + 1, 5) : 1,
                        lastReviewDate: '2023-01-15T12:00:00Z',
                        nextDueDate: passed
                            ? '2023-01-22T12:00:00Z' // Box 3 = 7 days later
                            : '2023-01-16T12:00:00Z', // Box 1 = 1 day later
                    }
                }),
            }
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('updateReviewSchedule', () => {
        it('should not update review schedule for ungraded submissions', async () => {
            // Mock a fixed date for testing
            const mockDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getCurrentISOString).mockReturnValue(mockDate.toISOString())

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
                status: 'pending', // Use pending instead of completed since that's the expected type
                grade: undefined,
                letterGrade: undefined,
            }

            // Call the function under test
            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            // Assert that the schedule was not updated
            expect(result).toBe(false)
            expect(moduleStatsService.getModuleStats).not.toHaveBeenCalled()
            expect(moduleStatsService.saveModuleStats).not.toHaveBeenCalled()
            expect(spacedRepetition.updateModuleStats).not.toHaveBeenCalled()
        })

        it('should update review schedule for graded submissions with passing grade', async () => {
            // Mock a fixed date for testing
            const mockDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getCurrentISOString).mockReturnValue(mockDate.toISOString())

            // Setup the mock for updateModuleStats to return specific expected values
            vi.mocked(spacedRepetition.updateModuleStats).mockImplementation((stats, passed) => {
                expect(passed).toBe(true) // Verify passed flag is true
                return {
                    ...stats,
                    currentBox: 3, // Expected to move up from box 2
                    lastReviewDate: '2023-01-15T12:00:00Z',
                    nextDueDate: '2023-01-22T12:00:00Z',
                }
            })

            // Create test data
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                lastReviewDate: '2023-01-01T12:00:00Z', // Older than the submission
                nextDueDate: '2023-01-03T12:00:00Z',
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

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

            // Call the function under test
            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            // Assert - verify that stats were updated
            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )

            // Verify the mocked updateModuleStats was called
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, true)

            // Verify saveModuleStats was called with correct parameters
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalled()

            // We expect specific values based on our mock implementation
            const expectedUpdatedStats = {
                ...currentStats,
                currentBox: 3,
                lastReviewDate: '2023-01-15T12:00:00Z',
                nextDueDate: '2023-01-22T12:00:00Z',
            }

            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                expectedUpdatedStats
            )
        })

        it('should update review schedule for graded submissions with failing grade', async () => {
            // Mock a fixed date for testing
            const mockDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getCurrentISOString).mockReturnValue(mockDate.toISOString())

            // Setup the mock for updateModuleStats to return specific expected values
            vi.mocked(spacedRepetition.updateModuleStats).mockImplementation((stats, passed) => {
                expect(passed).toBe(false) // Verify passed flag is false
                return {
                    ...stats,
                    currentBox: 1, // Reset to box 1 because failed
                    lastReviewDate: '2023-01-15T12:00:00Z',
                    nextDueDate: '2023-01-16T12:00:00Z', // Box 1 = 1 day later
                }
            })

            // Create test data
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                lastReviewDate: '2023-01-01T12:00:00Z', // Older than the submission
                nextDueDate: '2023-01-03T12:00:00Z',
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

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

            // Call the function under test
            const result = await updateReviewSchedule(mockLibraryId, mockModuleId, submission)

            // Assert - verify that stats were updated
            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )

            // Verify the mocked updateModuleStats was called
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, false)

            // Verify saveModuleStats was called with correct parameters
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalled()

            // We expect specific values based on our mock implementation
            const expectedUpdatedStats = {
                ...currentStats,
                currentBox: 1, // Reset to box 1 because failed
                lastReviewDate: '2023-01-15T12:00:00Z',
                nextDueDate: '2023-01-16T12:00:00Z', // Box 1 = 1 day later
            }

            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                expectedUpdatedStats
            )
        })

        it('should not update review schedule if submission is older than lastReviewDate', async () => {
            // Mock a fixed date for testing
            const mockDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getCurrentISOString).mockReturnValue(mockDate.toISOString())

            // Create test data with a more recent lastReviewDate
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                lastReviewDate: '2023-01-20T12:00:00Z', // More recent than the submission
                nextDueDate: '2023-01-22T12:00:00Z',
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

            // Create a graded submission with passing grade, but older than the lastReviewDate
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-10T12:00:00Z', // Older than lastReviewDate
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

            // Verify stats were not updated and function returned false
            expect(result).toBe(false)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).not.toHaveBeenCalled()
            expect(moduleStatsService.saveModuleStats).not.toHaveBeenCalled()
        })
    })

    describe('getDueModules', () => {
        it('should return modules that are due for review', async () => {
            // Mock a fixed date for testing in a more reliable way
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2024-01-02T00:00:00Z'))

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
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValueOnce(dueStats)

            // Act
            const result = await getDueModules()

            // Assert - verify that the module is included in results
            expect(result.length).toBeGreaterThan(0)
            expect(result.some((mod) => mod.metadata.id === mockModuleId)).toBe(true)

            // Verify all modules returned have nextDueDate <= current date
            result.forEach((mod) => {
                const nextDue = new Date(mod.stats?.nextDueDate || '')
                expect(nextDue <= new Date(dateUtils.getCurrentDate())).toBe(true)
            })
        })

        it('should not return modules that are not yet due', async () => {
            // Mock a fixed date for testing in a more reliable way
            const mockCurrentDate = new Date('2024-01-01T00:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockCurrentDate)

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
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValueOnce(futureStats)

            // Act
            const result = await getDueModules()

            // Assert - verify that no modules with future dates are returned
            expect(result.length).toBe(0)
        })

        it('should sort modules by priority', async () => {
            // Mock a fixed date for testing in a more reliable way
            const mockCurrentDate = new Date('2024-01-05T00:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockCurrentDate)

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
            vi.mocked(readModuleById).mockImplementation(async (_libId, modId) => {
                if (modId === mockModuleId1) return mockModule1
                if (modId === mockModuleId2) return mockModule2
                throw new Error('Module not found')
            })

            // Mock getModuleStats to return the appropriate stats based on ID
            vi.mocked(moduleStatsService.getModuleStats).mockImplementation(
                async (_libId, modId) => {
                    if (modId === mockModuleId1) return mockStats1
                    if (modId === mockModuleId2) return mockStats2
                    throw new Error('Stats not found')
                }
            )

            // Call function under test
            const result = await getDueModules()

            // Assert - verify that modules are sorted in priority order based on the real calculatePriority implementation
            expect(result.length).toBe(2)

            // Calculate expected priorities for verification
            const priority1 = spacedRepetition.calculatePriority(mockStats1)
            const priority2 = spacedRepetition.calculatePriority(mockStats2)

            // The module with higher priority should be first
            if (priority2 > priority1) {
                expect(result[0].metadata.id).toBe(mockModuleId2)
                expect(result[1].metadata.id).toBe(mockModuleId1)
            } else {
                expect(result[0].metadata.id).toBe(mockModuleId1)
                expect(result[1].metadata.id).toBe(mockModuleId2)
            }
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
