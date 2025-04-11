import { describe, expect, it } from 'vitest'
import { formatDate, formatFileSize } from './format'

describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
        expect(formatFileSize(500)).toBe('500.0 B')
    })

    it('should format kilobytes correctly', () => {
        expect(formatFileSize(1024)).toBe('1.0 KB')
        expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes correctly', () => {
        expect(formatFileSize(1048576)).toBe('1.0 MB')
    })

    it('should format gigabytes correctly', () => {
        expect(formatFileSize(1073741824)).toBe('1.0 GB')
    })
})

describe('formatDate', () => {
    it('should format date strings correctly', () => {
        expect(formatDate('2023-10-05')).toBe('Oct 5, 2023')
    })

    it('should handle invalid date strings gracefully', () => {
        expect(() => formatDate('invalid-date')).toThrow()
    })
})
