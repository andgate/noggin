import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
                '@noggin/schema': resolve('src/drizzle/schema'),
            },
        },
        plugins: [TanStackRouterVite(), viteReact()],
        css: {
            postcss: './postcss.config.cjs',
        },
        server: {
            port: 33482,
        },
    },
})
