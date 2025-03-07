/**
 * Utility functions for date operations
 * This provides a clear seam for testing date-based functionality
 */

/**
 * Get the current date
 * @returns Current date object
 */
export function getCurrentDate(): Date {
    return new Date()
}

/**
 * Get the current timestamp in ISO format
 * @returns Current date in ISO string format
 */
export function getCurrentISOString(): string {
    return getCurrentDate().toISOString()
}

/**
 * Calculate days between two dates
 * @param date1 First date
 * @param date2 Second date
 * @returns Number of days between dates (can be negative)
 */
export function getDaysBetween(date1: Date, date2: Date): number {
    return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
}
