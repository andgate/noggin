import { electronApp, optimizer } from '@electron-toolkit/utils'
import { NogginStoreSchema } from '@noggin/types/store-types'
import { app, BrowserWindow, ipcMain, Menu, MenuItem, shell } from 'electron'
import Store from 'electron-store'
import { join } from 'path'
import * as db from './db'

function createWindow(): void {
    console.log('createWindow')
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    setupContextMenu(mainWindow)

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

function setupContextMenu(mainWindow: BrowserWindow) {
    mainWindow.webContents.on('context-menu', (_event, params) => {
        const menu = new Menu()

        menu.append(
            new MenuItem({
                label: 'Copy',
                role: 'copy', // Built-in role for "Copy"
                enabled: params.editFlags.canCopy, // Enable only if text is selectable
            })
        )

        menu.append(
            new MenuItem({
                label: 'Paste',
                role: 'paste', // Built-in role for "Paste"
                enabled: params.editFlags.canPaste, // Enable only if paste is possible
            })
        )

        menu.popup({
            window: mainWindow,
        })
    })
}

// Initialize store
const store = new Store<NogginStoreSchema>({
    defaults: {
        userSettings: {},
    },
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.andgate')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('db:execute', db.execute)

    // Add store IPC handlers
    ipcMain.handle('store:get', (_, key: keyof NogginStoreSchema) => store.get(key))
    ipcMain.handle('store:set', (_, key: keyof NogginStoreSchema, value: any) =>
        store.set(key, value)
    )
    ipcMain.handle('store:delete', (_, key: keyof NogginStoreSchema) => store.delete(key))
    ipcMain.handle('store:clear', () => store.clear())

    // TODO fix automatic migrations
    // see https://github.com/drizzle-team/drizzle-orm/issues/680
    await db.runMigrate()
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
