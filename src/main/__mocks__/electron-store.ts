import { vi } from 'vitest'

// Create a simple in-memory store for testing
const mockStore = new Map<string, any>()

class MockStore<T> {
    defaults: Partial<T>

    constructor(options?: {
        defaults?: Partial<T>
        projectName?: string // Add projectName option that's required by electron-store
        name?: string
    }) {
        this.defaults = options?.defaults || {}
        // Initialize store with defaults
        Object.entries(this.defaults).forEach(([key, value]) => {
            if (!mockStore.has(key)) {
                mockStore.set(key, value)
            }
        })
    }

    get<K extends keyof T>(key: K): T[K] {
        return mockStore.get(key as string) as T[K]
    }

    set<K extends keyof T>(key: K, value: T[K]): void {
        mockStore.set(key as string, value)
    }

    has(key: string): boolean {
        return mockStore.has(key)
    }

    delete(key: string): void {
        mockStore.delete(key)
    }

    clear(): void {
        mockStore.clear()
    }

    // Add additional methods as needed
}

// Add spies to methods for testing
vi.spyOn(MockStore.prototype, 'get')
vi.spyOn(MockStore.prototype, 'set')
vi.spyOn(MockStore.prototype, 'has')
vi.spyOn(MockStore.prototype, 'delete')
vi.spyOn(MockStore.prototype, 'clear')

export default MockStore
