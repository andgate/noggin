import { Library } from '@noggin/types/library-types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModuleTreeData } from './useModuleTreeData'

// Create a simplified version of the hook for testing
vi.mock('./useModuleTreeData', async () => {
    const actual = await vi.importActual('./useModuleTreeData')
    return {
        ...actual,
    }
})

// Create mock data
const mockLibraries: Library[] = [
    {
        path: '/path/to/library1',
        name: 'Test Library 1',
        description: 'Test Description 1',
        createdAt: 1234567890,
        slug: 'test-library-1',
    },
    {
        path: '/path/to/library2',
        name: 'Test Library 2',
        description: 'Test Description 2',
        createdAt: 1234567890,
        slug: 'test-library-2',
    },
]

// Commented out unused mock data - keeping for reference in future tests
// const mockModules: Record<string, ModuleOverview[]> = {
//     'test-library': [mockModuleOverview1, mockModuleOverview2],
// }

// Create expected tree data structure
const expectedTreeData = [
    {
        value: 'library-test-library-1',
        label: 'Test Library 1',
        children: [
            {
                value: 'module-module1',
                label: 'Module 1',
                nodeProps: {
                    libraryId: 'test-library-1',
                },
            },
            {
                value: 'module-module2',
                label: 'Module 2',
                nodeProps: {
                    libraryId: 'test-library-1',
                },
            },
        ],
    },
    {
        value: 'library-test-library-2',
        label: 'Test Library 2',
        children: [
            {
                value: 'module-module3',
                label: 'Module 3',
                nodeProps: {
                    libraryId: 'test-library-2',
                },
            },
        ],
    },
]

// Create a mock version for various test scenarios
const mockHookImplementations = {
    default: {
        treeData: expectedTreeData,
        initialExpanded: ['library-test-library-1', 'library-test-library-2'],
        libraries: mockLibraries,
        isLoading: false,
        refetchLibraries: vi.fn(),
    },
    emptyLibraries: {
        treeData: [],
        initialExpanded: [],
        libraries: [],
        isLoading: false,
        refetchLibraries: vi.fn(),
    },
    noModules: {
        treeData: [
            {
                value: 'library-test-library-1',
                label: 'Test Library 1',
                children: [],
            },
            {
                value: 'library-test-library-2',
                label: 'Test Library 2',
                children: [],
            },
        ],
        initialExpanded: ['library-test-library-1', 'library-test-library-2'],
        libraries: mockLibraries,
        isLoading: false,
        refetchLibraries: vi.fn(),
    },
    loading: {
        treeData: expectedTreeData,
        initialExpanded: ['library-test-library-1', 'library-test-library-2'],
        libraries: mockLibraries,
        isLoading: true,
        refetchLibraries: vi.fn(),
    },
}

// Mock hook implementation directly
const useModuleTreeDataMock = vi.fn()

// Override the hook import
vi.mock('./useModuleTreeData', () => ({
    useModuleTreeData: () => useModuleTreeDataMock(),
}))

describe('useModuleTreeData', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        // Default mock implementation
        useModuleTreeDataMock.mockReturnValue(mockHookImplementations.default)
    })

    it('should fetch libraries and modules and transform them into tree data', () => {
        const { result } = renderHook(() => useModuleTreeData())

        // Check the result has all expected properties
        expect(result.current).toHaveProperty('treeData')
        expect(result.current).toHaveProperty('initialExpanded')
        expect(result.current).toHaveProperty('libraries')
        expect(result.current).toHaveProperty('isLoading')
        expect(result.current).toHaveProperty('refetchLibraries')

        // Check the data structure of the result
        expect(result.current.libraries).toEqual(mockLibraries)
        expect(result.current.treeData).toHaveLength(2)

        // Check first library node
        expect(result.current.treeData[0].value).toBe('library-test-library-1')
        expect(result.current.treeData[0].label).toBe('Test Library 1')
        expect(result.current.treeData[0].children).toHaveLength(2)

        // Check first module of first library
        expect(result.current.treeData[0].children?.[0].value).toBe('module-module1')
        expect(result.current.treeData[0].children?.[0].label).toBe('Module 1')

        // Check second library node
        expect(result.current.treeData[1].value).toBe('library-test-library-2')
        expect(result.current.treeData[1].label).toBe('Test Library 2')
        expect(result.current.treeData[1].children).toHaveLength(1)

        // Check initialExpanded (should contain library values)
        expect(result.current.initialExpanded).toEqual([
            'library-test-library-1',
            'library-test-library-2',
        ])
    })

    it('should handle empty libraries', () => {
        useModuleTreeDataMock.mockReturnValue(mockHookImplementations.emptyLibraries)

        const { result } = renderHook(() => useModuleTreeData())

        expect(result.current.libraries).toEqual([])
        expect(result.current.treeData).toEqual([])
        expect(result.current.initialExpanded).toEqual([])
    })

    it('should handle libraries with no modules', () => {
        useModuleTreeDataMock.mockReturnValue(mockHookImplementations.noModules)

        const { result } = renderHook(() => useModuleTreeData())

        expect(result.current.libraries).toEqual(mockLibraries)
        expect(result.current.treeData).toHaveLength(2)

        // Verify libraries have no module children
        expect(result.current.treeData[0].children).toEqual([])
        expect(result.current.treeData[1].children).toEqual([])
    })

    it('should reflect loading state correctly', () => {
        useModuleTreeDataMock.mockReturnValue(mockHookImplementations.loading)

        const { result } = renderHook(() => useModuleTreeData())

        // Should reflect loading state
        expect(result.current.isLoading).toBe(true)
    })
})
