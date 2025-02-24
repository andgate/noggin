/// <reference types="vitest" />
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
    main: {
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/main/index.ts'),
                },
            },
        },
        resolve: {
            alias: {
                '@noggin/types': resolve(__dirname, 'src/types'),
                '@noggin/shared': resolve(__dirname, 'src/shared'),
            },
        },
        plugins: [externalizeDepsPlugin({ exclude: ['lodash'] })],
        test: {
            name: 'main',
            include: ['src/main/**/*.{test,spec}.{js,ts}'],
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
                '**/*.e2e.*',
                'tests-e2e/**',
            ],
            reporters: ['default', 'html'],
            environment: 'node',
            globals: true,
            setupFiles: [resolve(__dirname, 'tests/setup.node.ts')],
        },
    },
    preload: {
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/preload/index.ts'),
                },
            },
        },
        resolve: {
            alias: {
                '@noggin/types': resolve(__dirname, 'src/types'),
            },
        },
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        root: './src/renderer/',
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html'),
                },
            },
        },
        resolve: {
            alias: {
                '@renderer': resolve(__dirname, 'src/renderer/src'),
                '@noggin/types': resolve(__dirname, 'src/types'),
                '@noggin/shared': resolve(__dirname, 'src/shared'),
                '@test-utils': resolve(__dirname, 'tests/test-utils'),
            },
        },
        plugins: [TanStackRouterVite(), viteReact()],
        css: {
            postcss: './postcss.config.cjs',
        },
        server: {
            port: 33482,
        },
        test: {
            name: 'renderer',
            exclude: [
                'src/main/**',
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
                '**/*.e2e.*',
                'tests-e2e/**',
            ],
            reporters: ['default', 'html'],
            environment: 'jsdom',
            globals: true,
            setupFiles: [resolve(__dirname, 'tests/setup.web.ts')],
        },
    },
})
