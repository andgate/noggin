import { SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
import { ipcMain } from 'electron'
import {
    deleteModuleSource,
    getRegisteredPaths,
    readModuleData,
    registerModulePath,
    removeModule,
    unregisterModulePath,
    writeModuleData,
    writeModuleSource,
} from '../services/mod-service'

export function registerModuleIPC(): void {
    ipcMain.handle('modules:getRegisteredPaths', async () => {
        return getRegisteredPaths()
    })

    ipcMain.handle('modules:registerModulePath', async (_, modulePath: string) => {
        await registerModulePath(modulePath)
    })

    ipcMain.handle('modules:unregisterModulePath', async (_, modulePath: string) => {
        await unregisterModulePath(modulePath)
    })

    ipcMain.handle('modules:readModuleData', async (_, modulePath: string) => {
        return readModuleData(modulePath)
    })

    ipcMain.handle('modules:writeModuleData', async (_, modulePath: string, mod: Mod) => {
        await writeModuleData(modulePath, mod)
    })

    ipcMain.handle('modules:removeModule', async (_, modulePath: string) => {
        await removeModule(modulePath)
    })

    ipcMain.handle(
        'modules:writeModuleSource',
        async (_, modPath: string, sourceFile: SimpleFile) => {
            return writeModuleSource(modPath, sourceFile)
        }
    )

    ipcMain.handle('modules:deleteModuleSource', async (_, sourcePath: string) => {
        await deleteModuleSource(sourcePath)
    })
}
