import { describe, expect, it } from 'vitest'
import { getCurrentDate, getCurrentISOString, getDaysBetween } from './date-utils'

describe('date-utils', () => {
    describe('getCurrentDate', () => {
        it('should return the current date', () => {
            const result = getCurrentDate()
            expect(result).toBeInstanceOf(Date)
        })
    })

    describe('getCurrentISOString', () => {
        it('should return the current date in ISO string format', () => {
            const result = getCurrentISOString()
            expect(typeof result).toBe('string')
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
    })

    describe('getDaysBetween', () => {
        it('should return the correct number of days between two dates', () => {
            const date1 = new Date('2023-01-15T12:00:00Z')
            const date2 = new Date('2023-01-10T12:00:00Z')
            expect(getDaysBetween(date1, date2)).toBe(5)
        })

        it('should return a negative number if the first date is earlier', () => {
            const date1 = new Date('2023-01-10T12:00:00Z')
            const date2 = new Date('2023-01-15T12:00:00Z')
            expect(getDaysBetween(date1, date2)).toBe(-5)
        })

        it('should work with fractional days', () => {
            const date1 = new Date('2023-01-15T18:00:00Z')
            const date2 = new Date('2023-01-15T06:00:00Z')
            expect(getDaysBetween(date1, date2)).toBe(0.5)
        })
    })
})
