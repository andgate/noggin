import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
    // Basic functionality
    it('converts basic strings correctly', () => {
        expect(slugify('Hello World')).toBe('hello_world')
    })

    it('handles multiple words', () => {
        expect(slugify('Computer Science Fundamentals')).toBe('computer_science_fundamentals')
    })

    // Special characters
    it('removes special characters within words', () => {
        expect(slugify('C++ & Python!!')).toBe('c_python')
        expect(slugify('Web-Dev#Site')).toBe('webdevsite')
    })

    // Whitespace handling
    it('handles multiple spaces and trimming', () => {
        expect(slugify('  Hello   World  ')).toBe('hello_world')
    })

    it('handles tabs and newlines', () => {
        expect(slugify('Hello\tWorld\nTest')).toBe('hello_world_test')
    })

    // Empty and edge cases
    it('handles empty strings', () => {
        expect(slugify('')).toBe('')
    })

    it('handles strings with only special characters', () => {
        expect(slugify('!@#$%')).toBe('')
    })

    it('handles strings that become empty after cleaning', () => {
        expect(slugify('  !@#  $%^  ')).toBe('')
    })

    // Length limits
    it('truncates long strings to 255 characters', () => {
        const longString = 'a'.repeat(300)
        expect(slugify(longString)).toBe('a'.repeat(255))
    })

    it('handles long strings with multiple words', () => {
        const longWord = 'a'.repeat(300)
        const result = slugify(`Hello ${longWord} World`)
        expect(result.length).toBe(255)
        expect(result.startsWith('hello_')).toBe(true)
    })

    // Mixed cases
    it('handles mixed case strings', () => {
        expect(slugify('HeLLo WoRLD')).toBe('hello_world')
    })

    // Numbers
    it('preserves numbers', () => {
        expect(slugify('Web Dev 2024 Course')).toBe('web_dev_2024_course')
    })

    // Real-world examples from protocol
    it('handles protocol document examples correctly', () => {
        expect(slugify('Computer Science Fundamentals')).toBe('computer_science_fundamentals')
        expect(slugify('C++ & Systems Programming!')).toBe('c_systems_programming')
        expect(slugify('Web Dev (2024) - Basics')).toBe('web_dev_2024_basics')
    })
})
