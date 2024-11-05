import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
    main: {
        resolve: {
            alias: {
                '@noggin/drizzle': resolve('src/drizzle'),
                '@noggin/types': resolve('src/types'),
            },
        },
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        resolve: {
            alias: {
                '@noggin/drizzle': resolve('src/drizzle'),
                '@noggin/types': resolve('src/types'),
            },
        },
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
                '@noggin/drizzle': resolve('src/drizzle'),
                '@noggin/types': resolve('src/types'),
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
