import { vi } from 'vitest'

// Mock all the methods from fs/promises that we use in our code
export const readFile = vi.fn()
export const writeFile = vi.fn()
export const unlink = vi.fn()
export const mkdir = vi.fn()
export const rm = vi.fn()

// Default implementations that return resolved promises
readFile.mockResolvedValue(Buffer.from(''))
writeFile.mockResolvedValue(undefined)
unlink.mockResolvedValue(undefined)
mkdir.mockResolvedValue(undefined)
rm.mockResolvedValue(undefined)

// Export as default and named exports to support different import styles
export default {
    readFile,
    writeFile,
    unlink,
    mkdir,
    rm,
}
