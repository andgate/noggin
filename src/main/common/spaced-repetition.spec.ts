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
            // Mock getCurrentDate to return a fixed date
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getDaysBetween).mockImplementation((date1, date2) => {
                return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
            })
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should return 0 for undefined stats', () => {
            expect(calculatePriority(undefined)).toBe(0)
        })

        it('should prioritize overdue items', () => {
            const overdue5Days: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-10T12:00:00Z', // 5 days overdue on 2023-01-15
            }

            const overdue1Day: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                lastReviewDate: '2023-01-10T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z', // 1 day overdue on 2023-01-15
            }

            // The 5-day overdue item should have higher priority
            expect(calculatePriority(overdue5Days)).toBeGreaterThan(calculatePriority(overdue1Day))
        })

        it('should prioritize lower boxes over higher boxes', () => {
            const box1Item: ModuleStats = {
                moduleId: 'test',
                currentBox: 1,
                lastReviewDate: '2023-01-10T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z', // 1 day overdue
            }

            const box5Item: ModuleStats = {
                moduleId: 'test',
                currentBox: 5,
                lastReviewDate: '2023-01-10T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z', // 1 day overdue
            }

            // Same overdue time, but box 1 should have higher priority
            expect(calculatePriority(box1Item)).toBeGreaterThan(calculatePriority(box5Item))
        })

        it('should calculate correct priority values', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 2,
                lastReviewDate: '2023-01-10T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z', // 1 day overdue on 2023-01-15
            }

            // Priority = daysOverdue + (6 - currentBox) * 0.1
            // = 1 + (6 - 2) * 0.1 = 1 + 0.4 = 1.4
            expect(calculatePriority(stats)).toBeCloseTo(1.4)
        })

        it('should handle negative overdue days (future due dates)', () => {
            // Mock getCurrentDate to return a fixed date
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2023-01-10T12:00:00Z'))

            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 3,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-15T12:00:00Z', // 5 days in the future from 2023-01-10
            }

            // Priority = daysOverdue + (6 - currentBox) * 0.1
            // = -5 + (6 - 3) * 0.1 = -5 + 0.3 = -4.7
            expect(calculatePriority(stats)).toBeCloseTo(-4.7)
        })

        it('should handle the current day as due date', () => {
            // Mock getCurrentDate to return exact same date as the next due date
            const dueDate = new Date('2023-01-15T12:00:00Z')
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(dueDate)

            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 4,
                lastReviewDate: '2023-01-10T12:00:00Z',
                nextDueDate: dueDate.toISOString(),
            }

            // Priority = daysOverdue + (6 - currentBox) * 0.1
            // = 0 + (6 - 4) * 0.1 = 0 + 0.2 = 0.2
            expect(calculatePriority(stats)).toBeCloseTo(0.2)
        })

        it('should prioritize extremely overdue items appropriately', () => {
            // Mock getCurrentDate to return a fixed date
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(new Date('2023-02-15T12:00:00Z'))

            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 5,
                lastReviewDate: '2022-11-15T12:00:00Z',
                nextDueDate: '2022-12-15T12:00:00Z', // 62 days overdue on 2023-02-15
            }

            // Priority = daysOverdue + (6 - currentBox) * 0.1
            // = 62 + (6 - 5) * 0.1 = 62 + 0.1 = 62.1
            expect(calculatePriority(stats)).toBeCloseTo(62.1)
        })
    })

    describe('updateModuleStats', () => {
        const mockDate = new Date('2023-01-15T12:00:00Z')
        const mockISOString = '2023-01-15T12:00:00.000Z'

        beforeEach(() => {
            // Mock date utility functions to return fixed values
            vi.mocked(dateUtils.getCurrentDate).mockReturnValue(mockDate)
            vi.mocked(dateUtils.getCurrentISOString).mockReturnValue(mockISOString)
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should move to the next box when passed is true', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 2,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z',
            }

            const updatedStats = updateModuleStats(stats, true)

            expect(updatedStats.currentBox).toBe(3)
            expect(updatedStats.lastReviewDate).toBe(mockISOString)
            // Next due date should be 7 days later (box 3)
            expect(new Date(updatedStats.nextDueDate).toISOString().split('T')[0]).toBe(
                '2023-01-22'
            )
        })

        it('should not exceed box 5 when passed is true', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 5,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z',
            }

            const updatedStats = updateModuleStats(stats, true)

            expect(updatedStats.currentBox).toBe(5) // Still box 5
            expect(updatedStats.lastReviewDate).toBe(mockISOString)
            // Next due date should be 30 days later (box 5)
            expect(new Date(updatedStats.nextDueDate).toISOString().split('T')[0]).toBe(
                '2023-02-14'
            )
        })

        it('should reset to box 1 when passed is false', () => {
            const stats: ModuleStats = {
                moduleId: 'test',
                currentBox: 4,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z',
            }

            const updatedStats = updateModuleStats(stats, false)

            expect(updatedStats.currentBox).toBe(1) // Reset to box 1
            expect(updatedStats.lastReviewDate).toBe(mockISOString)
            // Next due date should be 1 day later (box 1)
            expect(new Date(updatedStats.nextDueDate).toISOString().split('T')[0]).toBe(
                '2023-01-16'
            )
        })

        it('should preserve other properties from the original stats', () => {
            const stats: ModuleStats & { additionalProp: string } = {
                moduleId: 'test',
                currentBox: 3,
                lastReviewDate: '2023-01-01T12:00:00Z',
                nextDueDate: '2023-01-14T12:00:00Z',
                additionalProp: 'should be preserved',
            }

            const updatedStats = updateModuleStats(stats, true) as ModuleStats & {
                additionalProp: string
            }

            expect(updatedStats.additionalProp).toBe('should be preserved')
        })
    })
})
