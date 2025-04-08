import type { Library } from '@noggin/types/library-types'
import type { ModuleOverview } from '@noggin/types/module-types'
import { render as testingLibraryRender, screen } from '@test-utils' // Keep original for reference if needed
import { describe, expect, it, vi } from 'vitest'
import { LibraryPage } from '.'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
} from '@tanstack/react-router'
import userEvent from '@testing-library/user-event' // Import user-event

// Mock the AppHeader component
vi.mock('@renderer/components/layout/AppHeader', () => ({
    AppHeader: vi
        .fn()
        .mockImplementation(({ title }) => <div data-testid="mock-header">{title}</div>),
}))

// --- Test Setup Start ---

// Custom render function including Router and Query providers
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    // Create a new QueryClient for each test to ensure isolation
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // ✅ turns retries off
                retry: false,
                // ✅ set gcTime to Infinity to prevent issues in some test runners
                gcTime: Infinity,
            },
        },
    });

    // Component that renders the UI passed to this function
    const TestComponent = () => ui;

    // Define routes: Root -> ComponentRoute (renders TestComponent)
    const rootRoute = createRootRoute();
    const componentRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/', // Render the component at the root path for simplicity
        component: TestComponent,
    });
    const routeTree = rootRoute.addChildren([componentRoute]);

    // Create router instance for the test
    const memoryHistory = createMemoryHistory({ initialEntries: [route] });
    const router = createRouter({ routeTree, history: memoryHistory });

    // Render the RouterProvider, which will manage rendering TestComponent via the route
    return {
        user: userEvent.setup(), // Return userEvent instance
        ...testingLibraryRender(
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        ),
        router, // Optionally return router instance
    };
}

// --- Test Setup End ---

describe('LibraryPage', () => {
    const mockLibrary: Library = {
        path: '/path/to/library',
        name: 'Test Library',
        description: 'A test library description',
        slug: 'test-library',
        createdAt: 1234567890,
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
        const { container } = renderWithRouter(<LibraryPage library={mockLibrary} modules={[]} />) // Use new render function
        expect(container).toBeTruthy()
        expect(screen.getByTestId('mock-header')).toHaveTextContent('Test Library')
        expect(screen.getByText('A test library description')).toBeTruthy()
    })

    it('should render list of modules when modules exist', () => {
        const { container } = renderWithRouter(
            <LibraryPage library={mockLibrary} modules={mockModules} />, // Use new render function
        )
        expect(container).toBeTruthy()
        expect(screen.getByText('Module 1')).toBeTruthy()
        expect(screen.getByText('Module 2')).toBeTruthy()
    })

    it('should render empty state when no modules exist', () => {
        const { container } = renderWithRouter(<LibraryPage library={mockLibrary} modules={[]} />) // Use new render function
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

        const { container } = renderWithRouter(
            <LibraryPage library={mockLibrary} modules={mixedModules} />, // Use new render function
        )
        expect(container).toBeTruthy()
        expect(screen.getByText('Module 1')).toBeTruthy()
        expect(screen.getByText('Module 2')).toBeTruthy()
        expect(screen.queryByText('Other Module')).toBeNull()
    })
})
