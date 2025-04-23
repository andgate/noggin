import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  root: resolve(__dirname, 'src/app'),
  envDir: resolve(__dirname, './'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/app/index.html'),
      },
    },
    emptyOutDir: true, // Ensure the output directory is cleaned before build
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/'),
      '@test-utils': resolve(__dirname, 'tests/test-utils'),
    },
  },
  plugins: [
    viteReact(),
    TanStackRouterVite({
      routesDirectory: resolve(__dirname, 'src/routes'),
      generatedRouteTree: resolve(__dirname, 'src/routes/routeTree.gen.ts'),
    }),
    tsconfigPaths(),
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 33482,
  },
})
