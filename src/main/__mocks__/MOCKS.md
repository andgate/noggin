# Mocking Strategy

This directory contains mocks for system dependencies used in the application. The mocking approach follows these principles:

## Global System Mocks

The following system dependencies are mocked globally in `tests/setup.node.ts`:

- `fs/promises`: File system operations
- `path`: Path manipulation utilities
- `glob`: File pattern matching

These global mocks ensure consistent behavior across all tests without requiring each test file to mock these dependencies individually.

## Local Application Mocks

Application-specific modules (such as those under `src/main/common` or service modules) should be mocked locally in each test file using:

```typescript
vi.mock('../common/fs-utils')
vi.mock('./module-discovery-service')
// etc.
```

This approach allows:

1. Greater flexibility in configuring mocks for specific test scenarios
2. Easier testing of the common modules themselves
3. Clearer dependencies between modules being tested

## Mock Implementations

Custom mock implementations are defined in this directory for system modules, and can be imported or customized as needed in individual test files. For application modules, mock implementations are typically defined inline in the test files.

## Best Practices

1. Don't mock application modules globally
2. Don't re-mock system dependencies that are already mocked globally
3. Mock only what's necessary for the test
4. Reset mocks between tests with `vi.resetAllMocks()` to prevent test pollution
