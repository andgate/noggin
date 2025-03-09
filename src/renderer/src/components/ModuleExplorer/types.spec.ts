import { TreeNodeData } from '@mantine/core'
import { describe, expect, it } from 'vitest'
import { getNodeIdentifier, isLibraryNode, isModuleNode } from './types'

describe('getNodeIdentifier', () => {
    it('should correctly parse module node values', () => {
        const result = getNodeIdentifier('module-abc123')

        expect(result).toEqual({
            nodeId: 'abc123',
            nodeType: 'module',
        })
    })

    it('should correctly parse library node values', () => {
        const result = getNodeIdentifier('library-xyz789')

        expect(result).toEqual({
            nodeId: 'xyz789',
            nodeType: 'library',
            libraryId: 'xyz789',
        })
    })

    it('should throw an error for unknown node types', () => {
        expect(() => getNodeIdentifier('unknown-type')).toThrow('Unknown node type: unknown-type')
        expect(() => getNodeIdentifier('')).toThrow('Unknown node type: ')
    })
})

describe('isLibraryNode', () => {
    it('should return true for library nodes', () => {
        const node = { value: 'library-test' } as TreeNodeData
        expect(isLibraryNode(node)).toBe(true)
    })

    it('should return false for non-library nodes', () => {
        const moduleNode = { value: 'module-test' } as TreeNodeData
        const otherNode = { value: 'other-stuff' } as TreeNodeData

        expect(isLibraryNode(moduleNode)).toBe(false)
        expect(isLibraryNode(otherNode)).toBe(false)
    })
})

describe('isModuleNode', () => {
    it('should return true for module nodes', () => {
        const node = { value: 'module-test' } as TreeNodeData
        expect(isModuleNode(node)).toBe(true)
    })

    it('should return false for non-module nodes', () => {
        const libraryNode = { value: 'library-test' } as TreeNodeData
        const otherNode = { value: 'other-stuff' } as TreeNodeData

        expect(isModuleNode(libraryNode)).toBe(false)
        expect(isModuleNode(otherNode)).toBe(false)
    })
})
