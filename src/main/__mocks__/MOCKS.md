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

## Vitest Mocking Limitations and Solutions

### Mocking Functions in the Same File

Vitest cannot effectively mock functions defined in the same file as the functions being tested. This is a fundamental limitation of how the module system works.

For example, in a file like `module-core-service.ts`, you cannot mock `readModuleMetadata` when testing `readModuleData` if both are defined in the same file.

```typescript
// This won't work:
vi.mocked(readModuleMetadata).mockResolvedValue(mockData) // ❌
```

### Solution: Mock Underlying Dependencies

Instead of trying to mock functions defined in the same file, mock the underlying dependencies that these functions call:

1. Identify the external dependencies used by the function under test
2. Set up mocks for those dependencies with appropriate return values
3. Verify that the function correctly uses those dependencies

Example from `module-core-service.spec.ts`:

```typescript
// Instead of mocking readModuleMetadata directly:
vi.mocked(getModuleMetadataPath).mockReturnValue(metadataPath)
vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
    if (path === metadataPath && schema === moduleMetadataSchema) {
        return mockModuleMetadata
    }
    // other conditions...
})
```

When a function calls another function from the same file, adjust your assertion strategy to verify the final results rather than checking if the internal function was called.

### Benefits of This Approach

1. Tests are more resilient to internal refactoring
2. Tests focus on the public API behavior rather than implementation details
3. Better isolation of the specific functionality being tested

## Mock Implementations

Custom mock implementations are defined in this directory for system modules, and can be imported or customized as needed in individual test files. For application modules, mock implementations are typically defined inline in the test files.

## Best Practices

1. Don't mock application modules globally
2. Don't re-mock system dependencies that are already mocked globally
3. Mock only what's necessary for the test
4. Reset mocks between tests with `vi.resetAllMocks()` to prevent test pollution
5. When testing functions that call other functions in the same file, mock the underlying dependencies instead
6. Focus assertions on final results rather than internal function calls when dealing with same-file functions
7. Consider refactoring complex modules to separate files if testing becomes too complicated
