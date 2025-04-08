import { Library } from '@noggin/types/library-types'
import { ModuleOverview } from '@noggin/types/module-types'
import { describe, expect, it } from 'vitest'
import {
    buildModuleTreeData,
    getInitialExpandedState,
    groupModulesByLibrary,
    libraryToTreeNode,
    moduleToTreeNode,
} from './module-tree'

describe('module-tree utilities', () => {
    // Test data
    const mockModules: ModuleOverview[] = [
        { id: 'mod1', slug: 'mod1', displayName: 'Module 1', librarySlug: 'lib1' },
        { id: 'mod2', slug: 'mod2', displayName: 'Module 2', librarySlug: 'lib1' },
        { id: 'mod3', slug: 'mod3', displayName: 'Module 3', librarySlug: 'lib2' },
        { id: 'mod4', slug: 'mod4', displayName: 'Module 4' }, // No library assigned
    ] as ModuleOverview[]

    const mockLibraries: Library[] = [
        { slug: 'lib1', name: 'Library 1' },
        { slug: 'lib2', name: 'Library 2' },
    ] as Library[]

    describe('groupModulesByLibrary', () => {
        it('groups modules by library slug', () => {
            const result = groupModulesByLibrary(mockModules)
            expect(result).toEqual({
                lib1: [mockModules[0], mockModules[1]],
                lib2: [mockModules[2]],
            })
        })

        it('handles empty input', () => {
            const result = groupModulesByLibrary([])
            expect(result).toEqual({})
        })
    })

    describe('moduleToTreeNode', () => {
        it('converts module to tree node format', () => {
            const result = moduleToTreeNode(mockModules[0])
            expect(result).toEqual({
                value: 'module-mod1',
                label: 'Module 1',
                nodeProps: {
                    libraryId: 'lib1',
                },
            })
        })
    })

    describe('libraryToTreeNode', () => {
        it('converts library to tree node with modules', () => {
            const modules = [mockModules[0], mockModules[1]]
            const result = libraryToTreeNode(mockLibraries[0], modules)
            expect(result).toEqual({
                value: 'library-lib1',
                label: 'Library 1',
                children: [
                    {
                        value: 'module-mod1',
                        label: 'Module 1',
                        nodeProps: {
                            libraryId: 'lib1',
                        },
                    },
                    {
                        value: 'module-mod2',
                        label: 'Module 2',
                        nodeProps: {
                            libraryId: 'lib1',
                        },
                    },
                ],
            })
        })

        it('handles library with no modules', () => {
            const result = libraryToTreeNode(mockLibraries[0])
            expect(result).toEqual({
                value: 'library-lib1',
                label: 'Library 1',
                children: [],
            })
        })
    })

    describe('buildModuleTreeData', () => {
        it('builds complete tree structure', () => {
            const result = buildModuleTreeData(mockLibraries, mockModules)
            expect(result).toHaveLength(2) // Only 2 libraries, no unorganized
            expect(result[0].value).toBe('library-lib1')
            expect(result[1].value).toBe('library-lib2')
        })

        it('handles empty libraries and modules', () => {
            const result = buildModuleTreeData([], [])
            expect(result).toHaveLength(0) // No libraries, no tree nodes
        })
    })

    describe('getInitialExpandedState', () => {
        it('returns expanded state for all library nodes', () => {
            const treeData = buildModuleTreeData(mockLibraries, mockModules)
            const result = getInitialExpandedState(treeData)
            expect(result).toEqual(['library-lib1', 'library-lib2'])
        })

        it('handles empty tree data', () => {
            const result = getInitialExpandedState([])
            expect(result).toEqual([])
        })
    })
})
