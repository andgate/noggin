import { Library } from '@noggin/types/library-types'
import { ModuleOverview } from '@noggin/types/module-types'
import { describe, expect, it } from 'vitest'
import {
    buildModuleTreeData,
    createUnorganizedLibraryNode,
    getInitialExpandedState,
    groupModulesByLibrary,
    libraryToTreeNode,
    moduleToTreeNode,
} from './module-tree'

describe('module-tree utilities', () => {
    // Test data
    const mockModules: ModuleOverview[] = [
        { slug: 'mod1', displayName: 'Module 1', librarySlug: 'lib1' },
        { slug: 'mod2', displayName: 'Module 2', librarySlug: 'lib1' },
        { slug: 'mod3', displayName: 'Module 3', librarySlug: 'lib2' },
        { slug: 'mod4', displayName: 'Module 4' }, // Unorganized
    ] as ModuleOverview[]

    const mockLibraries: Library[] = [
        { metadata: { slug: 'lib1', name: 'Library 1' } },
        { metadata: { slug: 'lib2', name: 'Library 2' } },
    ] as Library[]

    describe('groupModulesByLibrary', () => {
        it('groups modules by library slug', () => {
            const result = groupModulesByLibrary(mockModules)
            expect(result).toEqual({
                lib1: [mockModules[0], mockModules[1]],
                lib2: [mockModules[2]],
                unorganized: [mockModules[3]],
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

    describe('createUnorganizedLibraryNode', () => {
        it('creates unorganized library node with modules', () => {
            const result = createUnorganizedLibraryNode([mockModules[3]])
            expect(result).toEqual({
                value: 'library-unorganized',
                label: 'Unorganized',
                children: [
                    {
                        value: 'module-mod4',
                        label: 'Module 4',
                        nodeProps: {
                            libraryId: undefined,
                        },
                    },
                ],
            })
        })

        it('handles empty modules list', () => {
            const result = createUnorganizedLibraryNode([])
            expect(result).toEqual({
                value: 'library-unorganized',
                label: 'Unorganized',
                children: [],
            })
        })
    })

    describe('buildModuleTreeData', () => {
        it('builds complete tree structure', () => {
            const result = buildModuleTreeData(mockLibraries, mockModules)
            expect(result).toHaveLength(3) // Unorganized + 2 libraries
            expect(result[0].value).toBe('library-unorganized')
            expect(result[1].value).toBe('library-lib1')
            expect(result[2].value).toBe('library-lib2')
        })

        it('handles empty libraries and modules', () => {
            const result = buildModuleTreeData([], [])
            expect(result).toHaveLength(1) // Just unorganized library
            expect(result[0].value).toBe('library-unorganized')
            expect(result[0].children).toHaveLength(0)
        })
    })

    describe('getInitialExpandedState', () => {
        it('returns expanded state for all library nodes', () => {
            const treeData = buildModuleTreeData(mockLibraries, mockModules)
            const result = getInitialExpandedState(treeData)
            expect(result).toEqual({
                'library-unorganized': true,
                'library-lib1': true,
                'library-lib2': true,
            })
        })

        it('handles empty tree data', () => {
            const result = getInitialExpandedState([])
            expect(result).toEqual({})
        })
    })
})
