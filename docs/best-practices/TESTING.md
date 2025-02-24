# Noggin Testing Practices

## Overview

This document outlines the comprehensive testing strategy used in the Noggin application. We employ a multi-layered testing approach combining unit tests, integration tests, and end-to-end (e2e) tests to ensure reliability and maintainability.

## Project Structure

```
noggin/
├── src/                  # Source code with colocated unit tests
│   ├── main/            # Main process code
│   │   └── *.spec.ts    # Main process tests
│   ├── renderer/        # Renderer process code
│   │   └── *.spec.ts    # Renderer process tests
│   └── shared/          # Shared code
│       └── *.spec.ts    # Shared code tests
├── e2e/                 # End-to-end tests
│   └── features/        # Feature-specific e2e tests
└── tests/              # Test support files
    ├── render.tsx      # Custom render function for React components
    ├── setup.node.ts   # Node environment test setup
    ├── setup.web.ts    # Browser environment test setup
    └── test-utils.ts   # Shared test utilities
```

## Testing Philosophy

Our testing strategy is built on the principle of using tests as living documentation and implementation guides. We follow a systematic approach where tests are written first to define requirements and guide development.

1. **Test-First Feature Development**

    - Begin with failing end-to-end tests that define feature requirements
    - Each major feature gets its own test file in `e2e/features/<feature-name>.spec.ts`
    - Tests serve as executable specifications, documenting expected behavior
    - All scenarios from the product requirements are captured as test cases
    - Tests initially fail, creating a clear roadmap for implementation

    Example structure for a new feature:

    ```typescript
    // e2e/features/library.spec.ts
    test.describe('Library Management', () => {
        test.beforeEach(async () => {
            electronApp = await electron.launch({ args: ['./out/main/index.js'] })
        })

        test.afterEach(async () => {
            await electronApp.close()
        })

        test('should create a new library', async () => {
            test.fail() // Placeholder until implemented
            // TODO: Test library creation workflow
        })

        test('should prevent duplicate library slugs', async () => {
            test.fail() // Placeholder until implemented
            // TODO: Test duplicate slug validation
        })
    })
    ```

2. **Test Organization and Progression**

    - **End-to-End Tests** (`e2e/`):

        - Define high-level features and user workflows
        - Act as acceptance criteria for feature completion
        - Initially fail, showing what needs to be implemented
        - Organized by feature for clear traceability to requirements

    - **Unit Tests** (`*.spec.ts`):

        - Colocated with source files they test
        - Added as implementation progresses
        - Focus on individual component behavior
        - Support the scenarios defined in e2e tests

    - **Test Support** (`tests/`):
        - Shared utilities and setup for consistent testing
        - Reduces duplication and maintains standards
        - Makes tests more readable and maintainable

3. **Implementation Workflow**

    1. Start with failing e2e tests that outline feature requirements
    2. Use failing tests as a roadmap for implementation
    3. Add unit tests as implementation details are determined
    4. Progressively implement until all tests pass
    5. Maintain tests as living documentation

4. **Test Coverage Strategy**

    - E2E tests cover all major features and user workflows
    - Unit tests verify implementation details
    - No feature is complete until both levels of tests pass
    - Tests serve as both specification and verification

This approach ensures that:

- No requirements are overlooked
- Implementation aligns with specifications
- Progress can be tracked through test status
- Documentation stays current with implementation
- New developers can understand features through tests

## Test Support Infrastructure

### 1. Test Setup Files

We maintain separate setup files for different test environments:

1. **Node.js Setup** (`setup.node.ts`):

    ```typescript
    import { cleanup } from '@testing-library/react'
    import { afterEach } from 'vitest'

    // Cleanup after each test
    afterEach(() => {
        cleanup()
    })
    ```

2. **Browser Setup** (`setup.web.ts`):

    ```typescript
    import '@testing-library/jest-dom'
    import * as matchers from '@testing-library/jest-dom/matchers'
    import { cleanup } from '@testing-library/react'
    import { expect } from 'vitest'

    // Add jest-dom matchers
    expect.extend(matchers)

    // Mock browser APIs
    window.HTMLElement.prototype.scrollIntoView = () => {}
    window.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
    ```

### 2. React Testing Utilities

1. **Custom Render Function** (`render.tsx`):

    ```typescript
    import { MantineProvider } from '@mantine/core'
    import { render as testingLibraryRender } from '@testing-library/react'

    export function render(ui: React.ReactNode) {
        return testingLibraryRender(ui, {
            wrapper: ({ children }) => (
                <MantineProvider theme={theme}>
                    {children}
                </MantineProvider>
            ),
        })
    }
    ```

2. **Shared Test Utilities** (`test-utils.ts`):
    ```typescript
    export * from '@testing-library/react'
    export { render } from './render'
    export { userEvent } from '@testing-library/user-event'
    ```

## Test Types and Configuration

### 1. Unit Tests

Unit tests are colocated with their source files and use the appropriate test setup based on their environment.

**Main Process Tests**:

```typescript
import { describe, it, expect } from 'vitest'

describe('main process feature', () => {
    it('performs specific action', () => {
        // Test implementation
    })
})
```

**React Component Tests**:

```typescript
import { render, screen, userEvent } from '@test-utils'

describe('Component', () => {
    it('handles user interaction', async () => {
        render(<MyComponent />)
        await userEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Result')).toBeVisible()
    })
})
```

### 2. End-to-End Tests

E2E tests verify the entire application stack using Playwright.

```
e2e/
├── app.spec.ts           # Core application tests
├── features/
    ├── library.spec.ts   # Library management
    ├── module.spec.ts    # Module operations
    ├── quiz.spec.ts      # Quiz functionality
    └── ...              # Other feature tests
```

**Key Characteristics:**

- Test complete user workflows
- Interact with the actual application UI
- Run against a built version of the app
- Use Playwright's Electron testing capabilities
- Organized by major feature areas

## Test Configuration

### Unit Tests (Vitest)

We maintain separate configurations for different environments, with specific setup files:

1. **Node.js Environment** (`vitest.config.node.ts`):

    ```typescript
    export default {
        test: {
            environment: 'node',
            include: ['src/main/**/*.spec.ts'],
            exclude: ['**/*.e2e.*'],
            setupFiles: ['tests/setup.node.ts'],
        },
    }
    ```

2. **Browser Environment** (`vitest.config.web.ts`):
    ```typescript
    export default {
        test: {
            environment: 'jsdom',
            include: ['src/renderer/**/*.spec.ts'],
            exclude: ['src/main/**'],
            setupFiles: ['tests/setup.web.ts'],
        },
    }
    ```

### E2E Tests (Playwright)

Configuration in `playwright.config.ts`:

```typescript
export default {
    testDir: './e2e',
    use: {
        trace: 'on-first-retry',
        video: 'on-first-retry',
    },
    reporter: [['html'], ['list']],
}
```

## Testing Guidelines

### Unit Tests

1. **Test Organization**

    ```typescript
    describe('module-tree utilities', () => {
        // Setup test data
        const mockModules = [...]

        describe('groupModulesByLibrary', () => {
            it('groups modules by library slug', () => {
                // Test implementation
            })
        })
    })
    ```

2. **Testing React Components**

    ```typescript
    import { render, screen } from '@testing-library/react'
    import userEvent from '@testing-library/user-event'

    describe('ModuleExplorer', () => {
        it('handles user interactions', async () => {
            render(<ModuleExplorer />)
            await userEvent.click(screen.getByRole('button'))
            expect(screen.getByText('Expected Result')).toBeVisible()
        })
    })
    ```

### E2E Tests

1. **Test Setup**

    ```typescript
    let electronApp: ElectronApplication

    test.describe('Feature Name', () => {
        test.beforeEach(async () => {
            electronApp = await electron.launch({ args: ['./out/main/index.js'] })
        })

        test.afterEach(async () => {
            await electronApp.close()
        })

        test('should perform specific action', async () => {
            // Test implementation
        })
    })
    ```

    Key points about E2E test setup:

    - Use `beforeEach`/`afterEach` hooks instead of `beforeAll`/`afterAll`
    - Each test gets a fresh Electron app instance
    - Proper cleanup after each test prevents state pollution
    - Failures in one test won't affect others
    - Easier debugging since each test is isolated

2. **Page Objects**

    ```typescript
    class LibraryPage {
        constructor(private page: Page) {}

        async createLibrary(name: string) {
            await this.page.click('[data-testid="create-library"]')
            await this.page.fill('[data-testid="library-name"]', name)
            await this.page.click('[data-testid="submit"]')
        }
    }
    ```

## Best Practices

1. **Selectors**

    - Use `data-testid` for e2e test selectors
    - Use semantic queries in unit tests (getByRole, getByText)
    - Avoid brittle selectors like CSS classes

2. **Test Data**

    - Use meaningful, minimal test data
    - Create reusable fixtures
    - Clean up after tests
    - Handle file system operations carefully

3. **Assertions**
    - Make specific, focused assertions
    - Test both success and error cases
    - Verify state changes and side effects
    - Use appropriate matchers

## Running Tests

```bash
# Unit Tests
pnpm test:node        # Run main process tests
pnpm test:web         # Run renderer process tests

# E2E Tests
pnpm test:e2e        # Run with UI
pnpm test:e2e:ci     # Run in CI mode
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch commits
- Release tags

Configuration in `.github/workflows/tests.yml` handles:

- Unit test execution
- E2E test runs
- Test artifact collection
- Results reporting

## Maintenance

1. **Regular Updates**

    - Keep test dependencies current
    - Review and update test patterns
    - Remove obsolete tests
    - Update documentation

2. **Performance**
    - Monitor test execution times
    - Parallelize when possible
    - Use appropriate timeouts
    - Cache test results when appropriate

## Writing Test Scenarios

When initially defining test scenarios, follow these guidelines:

1. **Start with Pure Scenarios**

    - Write only the test descriptions without ANY implementation
    - Skip even basic setup/teardown code initially
    - Use `test.fail()` as a placeholder for all scenarios
    - Focus purely on WHAT needs to be tested, not HOW

2. **Map to Specifications**
    - Each scenario should directly correspond to documented requirements
    - Start with basic sanity checks (e.g., window title, basic UI presence)
    - Progress to more complex functionality only after basics are covered
    - Avoid testing assumed or undocumented behaviors

Example of proper initial scenario writing:

```typescript
test.describe('Feature Name', () => {
    test('should verify basic sanity check', async () => {
        test.fail() // Not implemented
    })

    test('should perform core functionality', async () => {
        test.fail() // Not implemented
    })
})
```

3. **Implementation Separation**

    - Keep scenario definition and implementation as separate phases
    - Only add implementation details after scenarios are reviewed and approved
    - This ensures focus remains on requirements rather than implementation details

4. **Scenario Review**
    - Review scenarios independently of implementation
    - Verify each scenario maps to a specific requirement
    - Ensure basic functionality is covered before complex cases
    - Get stakeholder agreement on scenarios before implementation

This approach helps maintain focus on requirements and ensures comprehensive test coverage without getting lost in implementation details prematurely.
