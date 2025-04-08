import { Library } from '@noggin/types/library-types'
import * as fs from 'fs/promises' // Keep for fs.rm mock if needed
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// --- Mocks ---
// Mock registry functions (as library-service depends on them)
vi.mock('./library-registry', () => ({
    getLibraryPathBySlug: vi.fn(),
    getRegisteredLibraries: vi.fn(),
    libraryExists: vi.fn(),
    registerLibrary: vi.fn(),
    unregisterLibrary: vi.fn(),
}))

// Mock utils functions (as library-service depends on them)
vi.mock('./utils', () => ({
    readLibraryMetadataFile: vi.fn(),
    writeLibraryMetadataFile: vi.fn(),
}))

// Mock types functions (as library-service depends on them)
// extractLibraryMetadata is simple, maybe let it run? Or mock if needed.
vi.mock('./types', () => ({
    extractLibraryMetadata: vi.fn((lib) => ({
        // Simple mock implementation
        name: lib.name,
        description: lib.description,
        createdAt: lib.createdAt,
        slug: lib.slug,
    })),
    libraryMetadataSchema: { parse: vi.fn((data) => data) }, // Mock zod schema if needed by utils
}))

// Mock fs.rm specifically if the global mock isn't sufficient or needs verification
// Note: MOCKS.md says fs/promises is globally mocked. Assuming it works for now.
// If tests fail on fs.rm, uncomment and refine this:
// vi.mock('fs/promises', async (importOriginal) => {
//   const originalFs = await importOriginal<typeof fs>()
//   return {
//     ...originalFs,
//     rm: vi.fn().mockResolvedValue(undefined), // Mock fs.rm
//   }
// })

// --- Service Functions ---
// Import the functions under test *after* mocks are defined
import { deleteLibrary, readAllLibraries, readLibrary, saveLibrary } from '.'

// --- Helper Imports for Mocks ---
import {
    getLibraryPathBySlug,
    getRegisteredLibraries,
    libraryExists,
    registerLibrary,
    unregisterLibrary,
} from './library-registry'
import { LibraryMetadata } from './types' // Import from local types
import { readLibraryMetadataFile, writeLibraryMetadataFile } from './utils'

// --- Test Suite ---
describe('LibraryService', () => {
    const mockLibraryPath1 = '/test/library1'
    const mockLibraryPath2 = '/test/library2'
    const mockSlug1 = 'test-library-1'
    const mockSlug2 = 'test-library-2'

    const mockMetadata1: LibraryMetadata = {
        name: 'Test Library 1',
        description: 'Description 1',
        createdAt: Date.now(),
        slug: mockSlug1,
    }
    const mockMetadata2: LibraryMetadata = {
        name: 'Test Library 2',
        description: 'Description 2',
        createdAt: Date.now(),
        slug: mockSlug2,
    }
    const mockLibrary1: Library = { path: mockLibraryPath1, ...mockMetadata1 }
    const mockLibrary2: Library = { path: mockLibraryPath2, ...mockMetadata2 }

    beforeEach(() => {
        vi.resetAllMocks()

        // Default mock implementations
        vi.mocked(getRegisteredLibraries).mockResolvedValue([mockLibraryPath1, mockLibraryPath2])
        vi.mocked(getLibraryPathBySlug).mockImplementation(async (slug) => {
            if (slug === mockSlug1) return mockLibraryPath1
            if (slug === mockSlug2) return mockLibraryPath2
            return undefined
        })
        vi.mocked(readLibraryMetadataFile).mockImplementation(async (path) => {
            if (path === mockLibraryPath1) return mockMetadata1
            if (path === mockLibraryPath2) return mockMetadata2
            throw new Error('Metadata not found')
        })
        vi.mocked(writeLibraryMetadataFile).mockResolvedValue(undefined)
        vi.mocked(libraryExists).mockResolvedValue(false)
        vi.mocked(registerLibrary).mockResolvedValue(undefined)
        vi.mocked(unregisterLibrary).mockResolvedValue(undefined)
        // Mock fs.rm if needed (assuming global mock handles it)
        // vi.mocked(fs.rm).mockResolvedValue(undefined);

        // Mock path.normalize if needed (assuming global mock handles it)
        vi.mocked(path.normalize).mockImplementation((p) => p.replace(/\\/g, '/'))
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // --- Tests ---

    describe('saveLibrary', () => {
        it('should write metadata and register library if it does not exist', async () => {
            vi.mocked(libraryExists).mockResolvedValue(false) // Ensure it doesn't exist

            await saveLibrary(mockLibrary1)

            expect(writeLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1, mockMetadata1)
            expect(libraryExists).toHaveBeenCalledWith(mockLibraryPath1)
            expect(registerLibrary).toHaveBeenCalledWith(mockLibraryPath1)
        })

        it('should write metadata but not register library if it already exists', async () => {
            vi.mocked(libraryExists).mockResolvedValue(true) // Ensure it exists

            await saveLibrary(mockLibrary1)

            expect(writeLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1, mockMetadata1)
            expect(libraryExists).toHaveBeenCalledWith(mockLibraryPath1)
            expect(registerLibrary).not.toHaveBeenCalled()
        })
    })

    describe('readLibrary', () => {
        it('should return library data for a valid slug', async () => {
            const library = await readLibrary(mockSlug1)

            expect(getLibraryPathBySlug).toHaveBeenCalledWith(mockSlug1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
            expect(library).toEqual(mockLibrary1)
        })

        it('should throw an error if slug is not found', async () => {
            const unknownSlug = 'unknown-slug'
            vi.mocked(getLibraryPathBySlug).mockResolvedValue(undefined)

            await expect(readLibrary(unknownSlug)).rejects.toThrow(
                `Library with slug "${unknownSlug}" not found`
            )
            expect(getLibraryPathBySlug).toHaveBeenCalledWith(unknownSlug)
            expect(readLibraryMetadataFile).not.toHaveBeenCalled()
        })

        it('should throw an error if metadata cannot be read', async () => {
            const errorMsg = 'Failed to read metadata'
            vi.mocked(readLibraryMetadataFile).mockRejectedValue(new Error(errorMsg))

            await expect(readLibrary(mockSlug1)).rejects.toThrow(errorMsg)
            expect(getLibraryPathBySlug).toHaveBeenCalledWith(mockSlug1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
        })
    })

    describe('readAllLibraries', () => {
        it('should return all registered libraries with their metadata', async () => {
            const libraries = await readAllLibraries()

            expect(getRegisteredLibraries).toHaveBeenCalledOnce()
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath2)
            expect(libraries).toHaveLength(2)
            expect(libraries).toEqual([mockLibrary1, mockLibrary2])
        })

        it('should return empty array if no libraries are registered', async () => {
            vi.mocked(getRegisteredLibraries).mockResolvedValue([])
            const libraries = await readAllLibraries()
            expect(libraries).toEqual([])
            expect(readLibraryMetadataFile).not.toHaveBeenCalled()
        })

        it('should throw if reading metadata for any library fails', async () => {
            const errorMsg = 'Failed reading metadata for lib 2'
            vi.mocked(readLibraryMetadataFile).mockImplementation(async (path) => {
                if (path === mockLibraryPath1) return mockMetadata1
                if (path === mockLibraryPath2) throw new Error(errorMsg)
                throw new Error('Metadata not found')
            })

            await expect(readAllLibraries()).rejects.toThrow(errorMsg)
            expect(getRegisteredLibraries).toHaveBeenCalledOnce()
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath2)
        })
    })

    describe('deleteLibrary', () => {
        it('should unregister library and remove directory for a valid slug', async () => {
            const normalizedPath = mockLibraryPath1 // Assuming normalize mock works
            await deleteLibrary(mockSlug1)

            expect(getLibraryPathBySlug).toHaveBeenCalledWith(mockSlug1)
            expect(unregisterLibrary).toHaveBeenCalledWith(normalizedPath)
            // Check fs.rm call - adjust if specific mock is used
            expect(fs.rm).toHaveBeenCalledWith(normalizedPath, { recursive: true, force: true })
        })

        it('should throw an error if slug is not found', async () => {
            const unknownSlug = 'unknown-slug'
            vi.mocked(getLibraryPathBySlug).mockResolvedValue(undefined)

            await expect(deleteLibrary(unknownSlug)).rejects.toThrow(
                `Library with slug "${unknownSlug}" not found`
            )
            expect(getLibraryPathBySlug).toHaveBeenCalledWith(unknownSlug)
            expect(unregisterLibrary).not.toHaveBeenCalled()
            expect(fs.rm).not.toHaveBeenCalled()
        })

        it('should NOT remove directory if unregisterLibrary fails', async () => {
            const normalizedPath = mockLibraryPath1
            const unregisterError = new Error('Failed to unregister')
            vi.mocked(unregisterLibrary).mockRejectedValue(unregisterError)

            // We expect deleteLibrary to potentially throw the unregisterError,
            // and fs.rm should NOT have been called because the error stopped execution.
            await expect(deleteLibrary(mockSlug1)).rejects.toThrow(unregisterError)

            expect(getLibraryPathBySlug).toHaveBeenCalledWith(mockSlug1)
            expect(unregisterLibrary).toHaveBeenCalledWith(normalizedPath)
            expect(fs.rm).not.toHaveBeenCalled() // Correct assertion based on implementation
        })
    })
})
