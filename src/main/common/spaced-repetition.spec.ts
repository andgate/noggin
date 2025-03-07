import { ModuleStats } from '@noggin/types/module-types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { calculateNextReviewDate, calculatePriority, updateModuleStats } from './spaced-repetition'

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
        // Mock the current date to be fixed for testing
        let originalDate: DateConstructor

        beforeEach(() => {
            originalDate = global.Date
            // Mock current date to 2023-01-15
            const mockDate = new Date('2023-01-15T12:00:00Z')
            // @ts-ignore - we're implementing a minimal mock of Date
            global.Date = class extends originalDate {
                constructor(arg1?: number | string | Date, arg2?: number, arg3?: number) {
                    if (arguments.length === 0) {
                        return mockDate
                    }
                    // @ts-ignore - we know we're passing valid args to original Date
                    super(...arguments)
                }
            } as DateConstructor
        })

        afterEach(() => {
            global.Date = originalDate
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
    })

    describe('updateModuleStats', () => {
        // Mock the current date to be fixed for testing
        let originalDate: DateConstructor

        beforeEach(() => {
            originalDate = global.Date
            // Mock current date to 2023-01-15
            const mockDate = new Date('2023-01-15T12:00:00Z')
            // @ts-ignore - we're implementing a minimal mock of Date
            global.Date = class extends originalDate {
                constructor(_arg1?: number | string | Date, _arg2?: number, _arg3?: number) {
                    if (arguments.length === 0) {
                        return mockDate
                    }
                    // @ts-ignore - we know we're passing valid args to original Date
                    super(...arguments)
                }

                static now() {
                    return mockDate.getTime()
                }
            } as DateConstructor
        })

        afterEach(() => {
            global.Date = originalDate
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
            // Check the ISO date format allowing for milliseconds or not
            expect(updatedStats.lastReviewDate.startsWith('2023-01-15T12:00:00')).toBe(true)
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
            // Check the ISO date format allowing for milliseconds or not
            expect(updatedStats.lastReviewDate.startsWith('2023-01-15T12:00:00')).toBe(true)
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
            // Check the ISO date format allowing for milliseconds or not
            expect(updatedStats.lastReviewDate.startsWith('2023-01-15T12:00:00')).toBe(true)
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
