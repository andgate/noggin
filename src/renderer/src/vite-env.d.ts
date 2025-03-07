/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE?: string
    // Add other environment variables you use
    readonly DEV: boolean
    readonly PROD: boolean
    readonly MODE: string
}

// No imports here to avoid breaking type augmentation
interface ImportMeta {
    readonly env: ImportMetaEnv
}
