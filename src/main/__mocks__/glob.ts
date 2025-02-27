import { vi } from 'vitest'

// Create a glob function that returns a properly mocked Promise
export const glob = vi.fn().mockImplementation(() => Promise.resolve([]))

// Export as default export for ES default imports
export default { glob }
