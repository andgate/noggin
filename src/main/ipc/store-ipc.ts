import { NogginStoreSchema } from '@noggin/types/store-types'
import { ipcMain } from 'electron'
import {
    clearStore,
    deleteStoreValue,
    getStoreValue,
    setStoreValue,
} from '../services/store-service'

export function registerStoreIPC(): void {
    ipcMain.handle('store:get', (_, key: keyof NogginStoreSchema) => getStoreValue(key))
    ipcMain.handle('store:set', (_, key: keyof NogginStoreSchema, value: any) =>
        setStoreValue(key, value)
    )
    ipcMain.handle('store:delete', (_, key: keyof NogginStoreSchema) => deleteStoreValue(key))
    ipcMain.handle('store:clear', () => clearStore())
}
