import { Library } from '@noggin/types/library-types'
import * as fs from 'fs/promises' // Keep for fs.rm mock if needed
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// --- Mocks ---
// Mock registry functions
vi.mock('./library-registry', () => ({
    getLibraryPathById: vi.fn(),
    getRegisteredLibraries: vi.fn(),
    libraryExists: vi.fn(),
    registerLibrary: vi.fn(),
    unregisterLibrary: vi.fn(),
}))

// Mock utils functions
vi.mock('./utils', () => ({
    readLibraryMetadataFile: vi.fn(),
    writeLibraryMetadataFile: vi.fn(),
}))

// Mock types functions
vi.mock('./types', () => ({
    extractLibraryMetadata: vi.fn((lib) => ({
        name: lib.name,
        description: lib.description,
        createdAt: lib.createdAt,
        id: lib.id,
    })),
    libraryMetadataSchema: { parse: vi.fn((data) => data) },
}))

// Mock fs.rm (assuming global mock handles it)

// --- Service Functions ---
import { deleteLibrary, readAllLibraries, readLibrary, saveLibrary } from '.'

// --- Helper Imports for Mocks ---
import {
    getLibraryPathById,
    getRegisteredLibraries,
    libraryExists,
    registerLibrary,
    unregisterLibrary,
} from './library-registry'
import { LibraryMetadata } from './types'
import { readLibraryMetadataFile, writeLibraryMetadataFile } from './utils'

// --- Test Suite ---
describe('LibraryService', () => {
    const mockLibraryPath1 = '/test/library1'
    const mockLibraryPath2 = '/test/library2'
    const mockId1 = '11111111-1111-1111-1111-111111111111'
    const mockId2 = '22222222-2222-2222-2222-222222222222'

    const mockMetadata1: LibraryMetadata = {
        name: 'Test Library 1',
        description: 'Description 1',
        createdAt: 1678886400000,
        id: mockId1,
    }
    const mockMetadata2: LibraryMetadata = {
        name: 'Test Library 2',
        description: 'Description 2',
        createdAt: 1678886400001,
        id: mockId2,
    }
    const mockLibrary1: Library = { path: mockLibraryPath1, ...mockMetadata1 }
    const mockLibrary2: Library = { path: mockLibraryPath2, ...mockMetadata2 }

    beforeEach(() => {
        vi.resetAllMocks()

        // Default mock implementations
        vi.mocked(getRegisteredLibraries).mockResolvedValue([mockLibraryPath1, mockLibraryPath2])
        vi.mocked(getLibraryPathById).mockImplementation(async (id) => {
            if (id === mockId1) return mockLibraryPath1
            if (id === mockId2) return mockLibraryPath2
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
        it('should write metadata and register library (with ID) if it does not exist', async () => {
            vi.mocked(libraryExists).mockResolvedValue(false)

            await saveLibrary(mockLibrary1)

            expect(writeLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1, mockMetadata1)
            expect(libraryExists).toHaveBeenCalledWith(mockLibraryPath1)
            expect(registerLibrary).toHaveBeenCalledWith(mockLibraryPath1, mockId1)
        })

        it('should write metadata but not register library if it already exists', async () => {
            vi.mocked(libraryExists).mockResolvedValue(true)

            await saveLibrary(mockLibrary1)

            expect(writeLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1, mockMetadata1)
            expect(libraryExists).toHaveBeenCalledWith(mockLibraryPath1)
            expect(registerLibrary).not.toHaveBeenCalled()
        })
    })

    describe('readLibrary', () => {
        it('should return library data for a valid ID', async () => {
            const library = await readLibrary(mockId1)

            expect(getLibraryPathById).toHaveBeenCalledWith(mockId1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
            expect(library).toEqual(mockLibrary1)
        })

        it('should throw an error if ID is not found', async () => {
            const unknownId = 'unknown-id-12345'
            vi.mocked(getLibraryPathById).mockResolvedValue(undefined)

            await expect(readLibrary(unknownId)).rejects.toThrow(
                `Library with ID "${unknownId}" not found`
            )
            expect(getLibraryPathById).toHaveBeenCalledWith(unknownId)
            expect(readLibraryMetadataFile).not.toHaveBeenCalled()
        })

        it('should throw an error if metadata cannot be read', async () => {
            const errorMsg = 'Failed to read metadata'
            vi.mocked(readLibraryMetadataFile).mockRejectedValue(new Error(errorMsg))

            await expect(readLibrary(mockId1)).rejects.toThrow(errorMsg)
            expect(getLibraryPathById).toHaveBeenCalledWith(mockId1)
            expect(readLibraryMetadataFile).toHaveBeenCalledWith(mockLibraryPath1)
        })
    })

    describe('readAllLibraries', () => {
        it('should return all registered libraries with their metadata (including ID)', async () => {
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
        it('should unregister library (by ID) and remove directory for a valid ID', async () => {
            const normalizedPath = mockLibraryPath1 // Assuming normalize mock works
            await deleteLibrary(mockId1)

            expect(getLibraryPathById).toHaveBeenCalledWith(mockId1)
            expect(unregisterLibrary).toHaveBeenCalledWith(mockId1)
            expect(fs.rm).toHaveBeenCalledWith(normalizedPath, { recursive: true, force: true })
        })

        it('should throw an error if ID is not found', async () => {
            const unknownId = 'unknown-id-54321'
            vi.mocked(getLibraryPathById).mockResolvedValue(undefined)

            await expect(deleteLibrary(unknownId)).rejects.toThrow(
                `Library with ID "${unknownId}" not found`
            )
            expect(getLibraryPathById).toHaveBeenCalledWith(unknownId)
            expect(unregisterLibrary).not.toHaveBeenCalled()
            expect(fs.rm).not.toHaveBeenCalled()
        })

        it('should NOT remove directory if unregisterLibrary (by ID) fails', async () => {
            const unregisterError = new Error('Failed to unregister by ID')
            vi.mocked(unregisterLibrary).mockRejectedValue(unregisterError)

            await expect(deleteLibrary(mockId1)).rejects.toThrow(unregisterError)

            expect(getLibraryPathById).toHaveBeenCalledWith(mockId1)
            expect(unregisterLibrary).toHaveBeenCalledWith(mockId1)
            expect(fs.rm).not.toHaveBeenCalled()
        })
    })
})
