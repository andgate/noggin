import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { rendererConfig } from './electron.vite.config'

// Create a modified version of renderer config for testing
const testConfig = { ...rendererConfig, plugins: [viteReact()] }

// Remove the root setting which is causing path resolution issues
delete (testConfig as any).root

export default defineConfig(testConfig)
