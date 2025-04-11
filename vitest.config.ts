import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'noggin-web',
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}', // Unit tests are colocated with source files
    ],
    exclude: [
      'src/routes/**', // We don't tests routes directly
      'node_modules/**',
      'dist/**',
      // Exclude e2e tests from the unit test runner
      '**/*.e2e.*',
      'tests-e2e/**',
    ],
    reporters: ['default', 'html'],
    environment: 'jsdom', // Use jsdom for browser environment simulation
    globals: true,
    setupFiles: [resolve(__dirname, 'tests/setup.web.ts')], // Keep setup file
    // Aliases should be handled by vite-tsconfig-paths plugin, add them here if needed
  },
})
