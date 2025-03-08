import type { Library } from '@noggin/types/library-types'
import type { ModuleOverview } from '@noggin/types/module-types'
import { render, screen } from '@test-utils'
import { describe, expect, it } from 'vitest'
import { LibraryPage } from '.'

describe('LibraryPage', () => {
    const mockLibrary: Library = {
        path: '/path/to/library',
        metadata: {
            name: 'Test Library',
            description: 'A test library description',
            slug: 'test-library',
            createdAt: '',
        },
    }

    const mockModules: ModuleOverview[] = [
        {
            id: 'module-1',
            displayName: 'Module 1',
            slug: 'module-1',
            librarySlug: 'test-library',
        },
        {
            id: 'module-2',
            displayName: 'Module 2',
            slug: 'module-2',
            librarySlug: 'test-library',
        },
    ]

    it('should render library metadata', () => {
        const { container } = render(<LibraryPage library={mockLibrary} modules={[]} />)
        expect(container).toBeTruthy()
        expect(screen.getByText('Test Library')).toBeTruthy()
        expect(screen.getByText('A test library description')).toBeTruthy()
    })

    it('should render list of modules when modules exist', () => {
        const { container } = render(<LibraryPage library={mockLibrary} modules={mockModules} />)
        expect(container).toBeTruthy()
        expect(screen.getByText('Module 1')).toBeTruthy()
        expect(screen.getByText('Module 2')).toBeTruthy()
    })

    it('should render empty state when no modules exist', () => {
        const { container } = render(<LibraryPage library={mockLibrary} modules={[]} />)
        expect(container).toBeTruthy()
        expect(screen.getByText('No modules in this library')).toBeTruthy()
    })

    it('should only render modules belonging to the library', () => {
        const mixedModules: ModuleOverview[] = [
            ...mockModules,
            {
                id: 'other-module',
                displayName: 'Other Module',
                slug: 'other-module',
                librarySlug: 'other-library',
            },
        ]

        const { container } = render(<LibraryPage library={mockLibrary} modules={mixedModules} />)
        expect(container).toBeTruthy()
        expect(screen.getByText('Module 1')).toBeTruthy()
        expect(screen.getByText('Module 2')).toBeTruthy()
        expect(screen.queryByText('Other Module')).toBeNull()
    })
})
