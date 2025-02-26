import { ensureDir } from '@noggin/shared/fs-extra'
import { LibraryMetadata } from '@noggin/types/library-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    createLibrary,
    getAllLibraries,
    getRegisteredLibraries,
    readLibrary,
    readLibraryMetadata,
    registerLibrary,
    unregisterLibrary,
} from './library-service'
import { getStoreValue, setStoreValue } from './store-service'

// Mock dependencies
vi.mock('./store-service', () => ({
    getStoreValue: vi.fn(),
    setStoreValue: vi.fn(),
    deleteStoreValue: vi.fn(),
    clearStore: vi.fn(),
}))

vi.mock('electron-store', () => {
    return {
        default: class MockStore {
            private store: Record<string, any> = {}

            constructor() {
                this.store = {
                    userSettings: {
                        libraryPaths: [],
                    },
                }
            }

            get(key: string) {
                return this.store[key]
            }

            set(key: string, value: any) {
                this.store[key] = value
            }

            delete(key: string) {
                delete this.store[key]
            }

            clear() {
                this.store = {}
            }
        },
    }
})

vi.mock('@noggin/shared/fs-extra', () => ({
    ensureDir: vi.fn().mockImplementation(async (_dirPath: string) => {
        return Promise.resolve()
    }),
}))

vi.mock('@noggin/shared/slug', () => ({
    slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
}))

describe('LibraryService', () => {
    const mockLibraryPath = '/test/library'
    const existingLibraryPath = '/existing/library'

    const mockMetadata: LibraryMetadata = {
        name: 'Test Library',
        description: 'Test Description',
        createdAt: Date.now().toLocaleString(),
        slug: 'test-library',
    }

    const mockSettings = {
        libraryPaths: [existingLibraryPath],
    }

    beforeEach(() => {
        vi.resetAllMocks()

        vi.mocked(getStoreValue).mockReturnValue({
            libraryPaths: [existingLibraryPath],
        })
        vi.mocked(ensureDir).mockResolvedValue(undefined)
        vi.mocked(fs.writeFile).mockResolvedValue(undefined)

        vi.mocked(path.join).mockImplementation((...args) => args.join('/'))

        vi.mocked(path.normalize).mockImplementation((p) => p)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getRegisteredLibraries', () => {
        it('should return registered library paths from settings', async () => {
            const paths = await getRegisteredLibraries()
            expect(paths).toEqual(mockSettings.libraryPaths)
            expect(getStoreValue).toHaveBeenCalledWith('userSettings')
        })
    })

    describe('registerLibrary', () => {
        it('should add new library path to settings', async () => {
            await registerLibrary(mockLibraryPath)
            expect(setStoreValue).toHaveBeenCalledWith('userSettings', {
                ...mockSettings,
                libraryPaths: [...mockSettings.libraryPaths, mockLibraryPath],
            })
        })

        it('should not add duplicate library path', async () => {
            await registerLibrary(existingLibraryPath)
            expect(setStoreValue).not.toHaveBeenCalled()
        })
    })

    describe('unregisterLibrary', () => {
        it('should remove library path from settings', async () => {
            await unregisterLibrary(existingLibraryPath)
            expect(setStoreValue).toHaveBeenCalledWith('userSettings', {
                ...mockSettings,
                libraryPaths: [],
            })
        })
    })

    describe('createLibrary', () => {
        it('should create library directory and metadata file', async () => {
            await createLibrary(mockLibraryPath, mockMetadata)

            expect(ensureDir).toHaveBeenCalledWith(mockLibraryPath)
            expect(ensureDir).toHaveBeenCalledWith(`${mockLibraryPath}/.lib`)
            expect(fs.writeFile).toHaveBeenCalledWith(
                `${mockLibraryPath}/.lib/meta.json`,
                JSON.stringify({ ...mockMetadata, slug: 'test-library' }, null, 2)
            )
        })

        it('should register the library after creation', async () => {
            await createLibrary(mockLibraryPath, mockMetadata)
            expect(setStoreValue).toHaveBeenCalled()
        })
    })

    describe('readLibraryMetadata', () => {
        it('should read and parse metadata file', async () => {
            vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMetadata))

            const metadata = await readLibraryMetadata(mockLibraryPath)
            expect(metadata).toEqual(mockMetadata)
            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(mockLibraryPath, '.lib', 'meta.json'),
                'utf-8'
            )
        })

        it('should throw error if metadata file is invalid', async () => {
            vi.mocked(fs.readFile).mockResolvedValue('invalid json')

            await expect(readLibraryMetadata(mockLibraryPath)).rejects.toThrow()
        })
    })

    describe('readLibrary', () => {
        it('should return library with metadata', async () => {
            vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMetadata))

            const library = await readLibrary(mockLibraryPath)
            expect(library).toEqual({
                path: mockLibraryPath,
                metadata: mockMetadata,
            })
        })
    })

    describe('getAllLibraries', () => {
        it('should return all registered libraries', async () => {
            vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMetadata))

            const libraries = await getAllLibraries()
            expect(libraries).toHaveLength(1)
            expect(libraries[0]).toEqual({
                path: '/existing/library'.replace(/\\/g, '/'),
                metadata: mockMetadata,
            })
        })

        it('should filter out libraries that fail to load', async () => {
            vi.mocked(fs.readFile).mockRejectedValue(new Error('Failed to read'))

            const libraries = await getAllLibraries()
            expect(libraries).toHaveLength(0)
        })
    })
})
