import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Global mocks for system dependencies
// These mocks will be applied to all test files automatically
vi.mock('fs/promises')
vi.mock('path')
vi.mock('glob')
vi.mock('electron-store') // Mock electron-store globally to avoid projectName error
// Note: Application-specific modules should be mocked in individual test files

// runs a cleanup after each test case
afterEach(() => {
    cleanup()
    vi.resetAllMocks()
})

// Setup common mock implementations before each test
beforeEach(() => {
    vi.resetAllMocks()
})
