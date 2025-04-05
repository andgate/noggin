import { ModuleStats } from '@noggin/types/module-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as dateUtils from './date-utils'
import { calculateNextReviewDate, calculatePriority, updateModuleStats } from './spaced-repetition'

// Mock date utilities module
vi.mock('./date-utils')

describe('spaced-repetition', () => {
    describe('calculateNextReviewDate', () => {
        it('should schedule box 1 items for review the next day', () => {
            const currentDate = new Date('2023-01-01T12:00:00Z')
            const result = calculateNextReviewDate(1, currentDate)

            // Box 1 = 1 day later
            expect(result.toISOString().split('T')[0]).toBe('2023-01-02')
        })

        it('should schedule box 2 items for review after 2 days', () => {
            const currentDate = new Date('2023-01-01T12:00:00Z')
            const result = calculateNextReviewDate(2, currentDate)

            // Box 2 = 2 days later
            expect(result.toISOString().split('T')[0]).toBe('2023-01-03')
        })

        it('should schedule box 3 items for review after 7 days', () => {
            const currentDate = new Date('2023-01-01T12:00:00Z')
            const result = calculateNextReviewDate(3, currentDate)

            // Box 3 = 7 days later
            expect(result.toISOString().split('T')[0]).toBe('2023-01-08')
        })

        it('should schedule box 4 items for review after 14 days', () => {
            const currentDate = new Date('2023-01-01T12:00:00Z')
            const result = calculateNextReviewDate(4, currentDate)

            // Box 4 = 14 days later
            expect(result.toISOString().split('T')[0]).toBe('2023-01-15')
        })

        it('should schedule box 5 items for review after 30 days', () => {
            const currentDate = new Date('2023-01-01T12:00:00Z')
            const result = calculateNextReviewDate(5, currentDate)

            // Box 5 = 30 days later
            expect(result.toISOString().split('T')[0]).toBe('2023-01-31')
        })
    })

    describe('calculatePriority', () => {
        const mockDate = new Date('2023-01-15T12:00:00Z')

        beforeEach(() => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getDaysBetween).mockImplementation((date1, date2) => {
                // Simple difference calculation for testing
                return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
            })
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should return 0 for undefined stats', () => {
            expect(calculatePriority(undefined)).toBe(0)
        })

        it('should prioritize overdue items significantly', () => {
            const overdue5Days: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                nextReviewDate: '2023-01-10T12:00:00Z', // 5 days overdue
            }
            const overdue1Day: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                nextReviewDate: '2023-01-14T12:00:00Z', // 1 day overdue
            }
            // Priority = (daysOverdue > 0 ? daysOverdue * 10 : daysOverdue) + (6 - currentBox) * 0.1
            // Priority 5 days = 5 * 10 + (6 - 3) * 0.1 = 50 + 0.3 = 50.3
            // Priority 1 day = 1 * 10 + (6 - 3) * 0.1 = 10 + 0.3 = 10.3
            expect(calculatePriority(overdue5Days)).toBeCloseTo(50.3)
            expect(calculatePriority(overdue1Day)).toBeCloseTo(10.3)
            expect(calculatePriority(overdue5Days)).toBeGreaterThan(calculatePriority(overdue1Day))
        })

        it('should prioritize lower boxes slightly when overdue days are equal', () => {
            const box1Item: ModuleStats = {
                moduleId: 'test',
                currentBox: 1,
                nextReviewDate: '2023-01-14T12:00:00Z', // 1 day overdue
            }
            const box5Item: ModuleStats = {
                moduleId: 'test',
                currentBox: 5,
                nextReviewDate: '2023-01-14T12:00:00Z', // 1 day overdue
            }
            // Priority Box 1 = 1 * 10 + (6 - 1) * 0.1 = 10 + 0.5 = 10.5
            // Priority Box 5 = 1 * 10 + (6 - 5) * 0.1 = 10 + 0.1 = 10.1
            expect(calculatePriority(box1Item)).toBeCloseTo(10.5)
            expect(calculatePriority(box5Item)).toBeCloseTo(10.1)
            expect(calculatePriority(box1Item)).toBeGreaterThan(calculatePriority(box5Item))
        })

        it('should handle future review dates (negative priority base)', () => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2023-01-10T12:00:00Z'))
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                nextReviewDate: '2023-01-15T12:00:00Z', // 5 days in the future
            }
            // Priority = -5 + (6 - 3) * 0.1 = -5 + 0.3 = -4.7
            expect(calculatePriority(stats)).toBeCloseTo(-4.7)
        })

        it('should handle the current day as review date (zero day difference)', () => {
            const reviewDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(reviewDate)
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 4,
                nextReviewDate: reviewDate.toISOString(),
            }
            // Priority = 0 + (6 - 4) * 0.1 = 0.2
            expect(calculatePriority(stats)).toBeCloseTo(0.2)
        })
    })

    describe('updateModuleStats', () => {
        const mockDate = new Date('2023-01-15T12:00:00Z')

        beforeEach(() => {
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should move to the next box and update nextReviewDate when passed', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 2,
                nextReviewDate: '2023-01-14T12:00:00Z',
            }
            const updatedStats = updateModuleStats(stats, true)
            expect(updatedStats.currentBox).toBe(3)
            // Next review date should be 7 days later (box 3) from 'now' (mockDate)
            expect(new Date(updatedStats.nextReviewDate).toISOString().split('T')[0]).toBe(
                '2023-01-22'
            )
        })

        it('should not exceed box 5 and update nextReviewDate when passed', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 5,
                nextReviewDate: '2023-01-14T12:00:00Z',
            }
            const updatedStats = updateModuleStats(stats, true)
            expect(updatedStats.currentBox).toBe(5)
            // Next review date should be 30 days later (box 5) from 'now' (mockDate)
            expect(new Date(updatedStats.nextReviewDate).toISOString().split('T')[0]).toBe(
                '2023-02-14'
            )
        })

        it('should reset to box 1 and update nextReviewDate when failed', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 4,
                nextReviewDate: '2023-01-14T12:00:00Z',
            }
            const updatedStats = updateModuleStats(stats, false)
            expect(updatedStats.currentBox).toBe(1)
            // Next review date should be 1 day later (box 1) from 'now' (mockDate)
            expect(new Date(updatedStats.nextReviewDate).toISOString().split('T')[0]).toBe(
                '2023-01-16'
            )
        })

        it('should preserve the moduleId property', () => {
            const stats: ModuleStats = {
                moduleId: 'preserved-id',
                currentBox: 3,
                nextReviewDate: '2023-01-14T12:00:00Z',
            }
            const updatedStats = updateModuleStats(stats, true)
            expect(updatedStats.moduleId).toBe('preserved-id')
        })
    })
})
