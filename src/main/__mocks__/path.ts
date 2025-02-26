import { vi } from 'vitest'

// Create mock functions for path methods
export const join = vi.fn((...args) => args.join('/'))
export const dirname = vi.fn((p) => p.split('/').slice(0, -1).join('/') || '.')
export const basename = vi.fn((p) => p.split('/').pop() || '')
export const normalize = vi.fn((p) => String(p))

// Export as default and named exports to support different import styles
export default {
    join,
    dirname,
    basename,
    normalize,
}
