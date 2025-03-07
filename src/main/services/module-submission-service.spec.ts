import { ModuleStats } from '@noggin/types/module-types'
import { Submission } from '@noggin/types/quiz-types'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureDir, findFiles, readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getSubmissionPath } from '../common/module-utils'
import * as spacedRepetition from '../common/spaced-repetition'
import { resolveModulePath } from './module-discovery-service'
import * as moduleStatsService from './module-stats-service'
import {
    getModuleSubmissions,
    getQuizAttemptCount,
    getQuizSubmissions,
    readModuleSubmission,
    saveModuleSubmission,
    updateModuleStatsForSubmission,
    writeSubmissions,
} from './module-submission-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../common/fs-utils')
vi.mock('../common/module-utils')
vi.mock('./module-discovery-service')
vi.mock('./module-stats-service')
vi.mock('../common/spaced-repetition')

describe('ModuleSubmissionService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'
    const mockQuizId = 'test-quiz'
    const mockAttemptNumber = 1

    const mockSubmission: Submission = {
        quizId: mockQuizId,
        quizTitle: 'Test Quiz',
        moduleSlug: 'test-module',
        libraryId: mockLibraryId,
        attemptNumber: mockAttemptNumber,
        completedAt: '2024-01-01T00:00:00Z',
        timeElapsed: 300,
        timeLimit: 600,
        status: 'pending',
        responses: [],
    }

    const mockSubmissionPath = `${mockModulePath}/.mod/submissions/${mockQuizId}-${mockAttemptNumber}.json`

    beforeEach(() => {
        vi.resetAllMocks()

        // Common mocks
        vi.mocked(resolveModulePath).mockResolvedValue(mockModulePath)
        vi.mocked(getSubmissionPath).mockReturnValue(mockSubmissionPath)
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'))
        vi.mocked(path.dirname).mockImplementation((p) => {
            const parts = p.split('/')
            parts.pop()
            return parts.join('/')
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('saveModuleSubmission', () => {
        it('should save a submission to the correct path', async () => {
            // Arrange
            vi.mocked(ensureDir).mockResolvedValueOnce(undefined)
            vi.mocked(writeJsonFile).mockResolvedValueOnce(undefined)

            // Act
            await saveModuleSubmission(mockLibraryId, mockModuleId, mockSubmission)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getSubmissionPath).toHaveBeenCalledWith(
                mockModulePath,
                mockQuizId,
                mockAttemptNumber
            )
            expect(ensureDir).toHaveBeenCalledWith(`${mockModulePath}/.mod/submissions`)
            expect(writeJsonFile).toHaveBeenCalledWith(mockSubmissionPath, mockSubmission)

            // Verify that updateModuleStats is not being called
            expect(moduleStatsService.getModuleStats).not.toHaveBeenCalled()
            expect(spacedRepetition.updateModuleStats).not.toHaveBeenCalled()
            expect(moduleStatsService.saveModuleStats).not.toHaveBeenCalled()
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(
                saveModuleSubmission(mockLibraryId, 'non-existent', mockSubmission)
            ).rejects.toThrow('Module not found: non-existent')
        })
    })

    describe('updateModuleStatsForSubmission', () => {
        it('should not update module stats for ungraded submissions', async () => {
            // Create a test submission object
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
                status: 'pending',
            }

            const result = await updateModuleStatsForSubmission(
                mockLibraryId,
                mockModuleId,
                submission
            )

            // Verify no stats were updated and function returned false
            expect(result).toBe(false)
            expect(moduleStatsService.getModuleStats).not.toHaveBeenCalled()
            expect(moduleStatsService.saveModuleStats).not.toHaveBeenCalled()
            expect(spacedRepetition.updateModuleStats).not.toHaveBeenCalled()
        })

        it('should update module stats for graded submissions with passing grade', async () => {
            // Create test data
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                lastReviewDate: '2023-01-01T12:00:00Z', // Older than the submission
                nextDueDate: '2023-01-03T12:00:00Z',
            }

            const updatedStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 3, // Moved up a box because passed
                lastReviewDate: '2023-01-15T12:00:00Z', // Updated to current date
                nextDueDate: '2023-01-22T12:00:00Z', // Box 3 = 7 days later
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

            // Mock updateModuleStats to return our expected updated stats
            vi.mocked(spacedRepetition.updateModuleStats).mockReturnValue(updatedStats)

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

            const result = await updateModuleStatsForSubmission(
                mockLibraryId,
                mockModuleId,
                submission
            )

            // Verify stats were updated correctly and function returned true
            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, true) // true because passed
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                updatedStats
            )
        })

        it('should update module stats for graded submissions with failing grade', async () => {
            // Create test data
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 3,
                lastReviewDate: '2023-01-01T12:00:00Z', // Older than the submission
                nextDueDate: '2023-01-08T12:00:00Z',
            }

            const updatedStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 1, // Reset to box 1 because failed
                lastReviewDate: '2023-01-15T12:00:00Z', // Updated to current date
                nextDueDate: '2023-01-16T12:00:00Z', // Box 1 = 1 day later
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

            // Mock updateModuleStats to return our expected updated stats
            vi.mocked(spacedRepetition.updateModuleStats).mockReturnValue(updatedStats)

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
                grade: 55, // Failing grade (below 60)
                letterGrade: 'F',
            }

            const result = await updateModuleStatsForSubmission(
                mockLibraryId,
                mockModuleId,
                submission
            )

            // Verify stats were updated correctly and function returned true
            expect(result).toBe(true)
            expect(moduleStatsService.getModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId
            )
            expect(spacedRepetition.updateModuleStats).toHaveBeenCalledWith(currentStats, false) // false because failed
            expect(moduleStatsService.saveModuleStats).toHaveBeenCalledWith(
                mockLibraryId,
                mockModuleId,
                updatedStats
            )
        })

        it('should not update module stats if submission is older than lastReviewDate', async () => {
            // Create test data with a more recent lastReviewDate
            const currentStats: ModuleStats = {
                moduleId: mockModuleId,
                currentBox: 2,
                lastReviewDate: '2023-01-20T12:00:00Z', // More recent than the submission
                nextDueDate: '2023-01-22T12:00:00Z',
            }

            // Mock getModuleStats to return our test stats
            vi.mocked(moduleStatsService.getModuleStats).mockResolvedValue(currentStats)

            // Create a graded submission with an older date
            const submission: Submission = {
                quizId: 'quiz-1',
                attemptNumber: 1,
                completedAt: '2023-01-15T12:00:00Z', // Older than lastReviewDate
                quizTitle: 'Test Quiz',
                timeElapsed: 300,
                timeLimit: 600,
                libraryId: mockLibraryId,
                moduleSlug: mockModuleId,
                responses: [],
                status: 'graded',
                grade: 85,
                letterGrade: 'B',
            }

            const result = await updateModuleStatsForSubmission(
                mockLibraryId,
                mockModuleId,
                submission
            )

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

    describe('readModuleSubmission', () => {
        it('should read a submission from the correct path', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockSubmission)

            // Act
            const result = await readModuleSubmission(
                mockLibraryId,
                mockModuleId,
                mockQuizId,
                mockAttemptNumber
            )

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getSubmissionPath).toHaveBeenCalledWith(
                mockModulePath,
                mockQuizId,
                mockAttemptNumber
            )
            expect(readJsonFile).toHaveBeenCalled()
            expect(result).toEqual(mockSubmission)
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(
                readModuleSubmission(mockLibraryId, 'non-existent', mockQuizId, mockAttemptNumber)
            ).rejects.toThrow('Module not found: non-existent')
        })

        it('should throw error if submission is not found', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockRejectedValueOnce(new Error('File not found'))

            // Act & Assert
            await expect(
                readModuleSubmission(mockLibraryId, mockModuleId, 'non-existent', 999)
            ).rejects.toThrow('Submission not found: non-existent-999')
        })
    })

    describe('getQuizAttemptCount', () => {
        it('should return the number of attempts for a quiz', async () => {
            // Arrange
            const submissionsDir = `${mockModulePath}/.mod/submissions`
            const fileMatches = [
                `${mockQuizId}-1.json`,
                `${mockQuizId}-2.json`,
                `${mockQuizId}-3.json`,
            ]

            vi.mocked(path.join).mockReturnValueOnce(submissionsDir)
            vi.mocked(findFiles).mockResolvedValueOnce(fileMatches)

            // Act
            const result = await getQuizAttemptCount(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(findFiles).toHaveBeenCalledWith(`${mockQuizId}-*.json`, {
                cwd: submissionsDir,
                absolute: false,
            })
            expect(result).toBe(3)
        })

        it('should return 0 if no attempts found', async () => {
            // Arrange
            vi.mocked(findFiles).mockResolvedValueOnce([])

            // Act
            const result = await getQuizAttemptCount(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(result).toBe(0)
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(
                getQuizAttemptCount(mockLibraryId, 'non-existent', mockQuizId)
            ).rejects.toThrow('Module not found: non-existent')
        })
    })

    describe('getQuizSubmissions', () => {
        it('should return all submissions for a quiz sorted by completion date', async () => {
            // Arrange
            const submissionsDir = `${mockModulePath}/.mod/submissions`
            const filePaths = [
                `${submissionsDir}/${mockQuizId}-1.json`,
                `${submissionsDir}/${mockQuizId}-2.json`,
            ]

            const submission1: Submission = {
                ...mockSubmission,
                attemptNumber: 1,
                completedAt: '2024-01-01T00:00:00Z',
            }

            const submission2: Submission = {
                ...mockSubmission,
                attemptNumber: 2,
                completedAt: '2024-01-02T00:00:00Z',
            }

            vi.mocked(path.join).mockReturnValueOnce(submissionsDir)
            vi.mocked(findFiles).mockResolvedValueOnce(filePaths)
            vi.mocked(readJsonFile)
                .mockResolvedValueOnce(submission1)
                .mockResolvedValueOnce(submission2)

            // Act
            const result = await getQuizSubmissions(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(findFiles).toHaveBeenCalledWith(`${mockQuizId}-*.json`, {
                cwd: submissionsDir,
                absolute: true,
            })
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual(submission2) // Newest first
            expect(result[1]).toEqual(submission1)
        })

        it('should return empty array if no submissions found', async () => {
            // Arrange
            vi.mocked(findFiles).mockResolvedValueOnce([])

            // Act
            const result = await getQuizSubmissions(mockLibraryId, mockModuleId, mockQuizId)

            // Assert
            expect(result).toEqual([])
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(
                getQuizSubmissions(mockLibraryId, 'non-existent', mockQuizId)
            ).rejects.toThrow('Module not found: non-existent')
        })
    })

    describe('getModuleSubmissions', () => {
        it('should return all submissions for a module sorted by completion date', async () => {
            // Arrange
            const submissionsDir = `${mockModulePath}/.mod/submissions`
            const filePaths = [`${submissionsDir}/quiz1-1.json`, `${submissionsDir}/quiz2-1.json`]

            const submission1: Submission = {
                ...mockSubmission,
                quizId: 'quiz1',
                attemptNumber: 1,
                completedAt: '2024-01-01T00:00:00Z',
            }

            const submission2: Submission = {
                ...mockSubmission,
                quizId: 'quiz2',
                attemptNumber: 1,
                completedAt: '2024-01-02T00:00:00Z',
            }

            vi.mocked(path.join).mockReturnValueOnce(submissionsDir)
            vi.mocked(findFiles).mockResolvedValueOnce(filePaths)
            vi.mocked(readJsonFile)
                .mockResolvedValueOnce(submission1)
                .mockResolvedValueOnce(submission2)

            // Act
            const result = await getModuleSubmissions(mockLibraryId, mockModuleId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(findFiles).toHaveBeenCalledWith('*.json', {
                cwd: submissionsDir,
                absolute: true,
            })
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual(submission2) // Newest first
            expect(result[1]).toEqual(submission1)
        })

        it('should return empty array if no submissions found', async () => {
            // Arrange
            vi.mocked(findFiles).mockResolvedValueOnce([])

            // Act
            const result = await getModuleSubmissions(mockLibraryId, mockModuleId)

            // Assert
            expect(result).toEqual([])
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(getModuleSubmissions(mockLibraryId, 'non-existent')).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('writeSubmissions', () => {
        it('should write multiple submissions to their respective paths', async () => {
            // Arrange
            const submission1: Submission = {
                ...mockSubmission,
                quizId: 'quiz1',
                attemptNumber: 1,
            }

            const submission2: Submission = {
                ...mockSubmission,
                quizId: 'quiz2',
                attemptNumber: 1,
            }

            const subPath1 = `${mockModulePath}/.mod/submissions/quiz1-1.json`
            const subPath2 = `${mockModulePath}/.mod/submissions/quiz2-1.json`

            vi.mocked(getSubmissionPath).mockReturnValueOnce(subPath1).mockReturnValueOnce(subPath2)

            vi.mocked(writeJsonFile).mockResolvedValue(undefined)

            // Act
            await writeSubmissions(mockModulePath, [submission1, submission2])

            // Assert
            expect(getSubmissionPath).toHaveBeenCalledWith(mockModulePath, 'quiz1', 1)
            expect(getSubmissionPath).toHaveBeenCalledWith(mockModulePath, 'quiz2', 1)
            expect(writeJsonFile).toHaveBeenCalledWith(subPath1, submission1)
            expect(writeJsonFile).toHaveBeenCalledWith(subPath2, submission2)
        })
    })
})
