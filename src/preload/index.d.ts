import { ElectronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI } from '@noggin/types/electron-types'

declare global {
    interface Window {
        electron: ElectronAPI
        api: NogginElectronAPI
    }
}
