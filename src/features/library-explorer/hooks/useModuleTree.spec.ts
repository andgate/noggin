import { TreeNodeData } from '@mantine/core'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModuleTree } from './useModuleTree'

// Create a mock tree controller to be returned by useTree
const mockTreeController = {
    initialize: vi.fn(),
    expand: vi.fn(),
}

// Mock the @mantine/core useTree hook
vi.mock('@mantine/core', () => ({
    useTree: vi.fn(() => mockTreeController),
}))

describe('useModuleTree', () => {
    // Sample tree data for testing with the correct structure
    const sampleTreeData: TreeNodeData[] = [
        { value: 'node1', label: 'Node 1' },
        { value: 'node2', label: 'Node 2' },
        { value: 'node3', label: 'Node 3' },
    ]

    // Reset mocks before each test
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should initialize with empty treeData', () => {
        const { result } = renderHook(() => useModuleTree([]))

        // Tree should exist but initialize should not be called with empty data
        expect(result.current).toBeDefined()
        expect(mockTreeController.initialize).not.toHaveBeenCalled()
    })

    it('should initialize tree when treeData is provided', () => {
        const { result } = renderHook(() => useModuleTree(sampleTreeData))

        // Tree should be initialized with the provided data
        expect(result.current).toBeDefined()
        expect(mockTreeController.initialize).toHaveBeenCalledWith(sampleTreeData)
    })

    it('should expand initial nodes when specified', () => {
        const initialExpanded = ['node1', 'node3']

        renderHook(() => useModuleTree(sampleTreeData, initialExpanded))

        // Tree should be initialized
        expect(mockTreeController.initialize).toHaveBeenCalledWith(sampleTreeData)

        // Each node in initialExpanded should be expanded
        expect(mockTreeController.expand).toHaveBeenCalledTimes(2)
        expect(mockTreeController.expand).toHaveBeenCalledWith('node1')
        expect(mockTreeController.expand).toHaveBeenCalledWith('node3')
    })

    it('should only expand nodes on initial render', () => {
        const initialExpanded = ['node1', 'node3']

        // Initial render
        const { rerender } = renderHook(
            ({ treeData, expanded }) => useModuleTree(treeData, expanded),
            {
                initialProps: {
                    treeData: sampleTreeData,
                    expanded: initialExpanded,
                },
            }
        )

        // Check that initial expansion happened correctly
        const expandCallCount = mockTreeController.expand.mock.calls.length
        expect(expandCallCount).toBe(2) // Should be called once for each node in initialExpanded

        vi.mocked(mockTreeController.expand).mockClear()

        // Re-render with same data
        rerender({ treeData: sampleTreeData, expanded: initialExpanded })

        // Expand should not be called again
        expect(mockTreeController.expand).not.toHaveBeenCalled()
    })

    it('should reinitialize when treeData changes', () => {
        // Initial render
        const { rerender } = renderHook(({ treeData }) => useModuleTree(treeData), {
            initialProps: { treeData: sampleTreeData },
        })

        // Tree should be initialized once
        expect(mockTreeController.initialize).toHaveBeenCalledTimes(1)
        expect(mockTreeController.initialize).toHaveBeenCalledWith(sampleTreeData)

        // New tree data
        const newTreeData: TreeNodeData[] = [
            { value: 'node4', label: 'Node 4' },
            { value: 'node5', label: 'Node 5' },
        ]

        // Re-render with new data
        rerender({ treeData: newTreeData })

        // Tree should be initialized again with new data
        expect(mockTreeController.initialize).toHaveBeenCalledTimes(2)
        expect(mockTreeController.initialize).toHaveBeenLastCalledWith(newTreeData)
    })

    it('should not initialize tree when treeData is empty', () => {
        // Initial render with data
        const { rerender } = renderHook(({ treeData }) => useModuleTree(treeData), {
            initialProps: { treeData: sampleTreeData },
        })

        // Tree should be initialized
        expect(mockTreeController.initialize).toHaveBeenCalledTimes(1)

        // Re-render with empty data
        rerender({ treeData: [] })

        // Initialize should not be called again
        expect(mockTreeController.initialize).toHaveBeenCalledTimes(1)
    })
})
