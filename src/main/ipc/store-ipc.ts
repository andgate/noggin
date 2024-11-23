import { NogginStoreSchema } from '@noggin/types/store-types'
import { ipcMain } from 'electron'
import { store } from '../services/store-service'

export function registerStoreIPC(): void {
    ipcMain.handle('store:get', (_, key: keyof NogginStoreSchema) => store.get(key))
    ipcMain.handle('store:set', (_, key: keyof NogginStoreSchema, value: any) =>
        store.set(key, value)
    )
    ipcMain.handle('store:delete', (_, key: keyof NogginStoreSchema) => store.delete(key))
    ipcMain.handle('store:clear', () => store.clear())
}
