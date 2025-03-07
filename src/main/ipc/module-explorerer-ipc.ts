import { BrowserWindow, Menu, MenuItem, clipboard, dialog, ipcMain, shell } from 'electron'
import { removeModule, resolveModulePath } from '../services/module-service'

export function registerModuleExplorerIPC(): void {
    ipcMain.handle(
        'moduleExplorer:showModuleContextMenu',
        async (event, libraryId: string, moduleId: string) => {
            const modulePath = await resolveModulePath(libraryId, moduleId)
            if (!modulePath) {
                throw new Error(`Module not found: ${moduleId}`)
            }

            const window = BrowserWindow.fromWebContents(event.sender)
            if (!window) return

            const menu = new Menu()
            menu.append(
                new MenuItem({
                    label: 'View Module',
                    click: () => {
                        // dumbass hack to get tanstack router navigation working in the node process lol
                        console.log(`Navigating to module: ${moduleId}`)
                        window.webContents.executeJavaScript(
                            `window.history.pushState(null, '', '/module/view/${libraryId}/${moduleId}'); window.dispatchEvent(new PopStateEvent('popstate'))`
                        )
                        console.log('Navigation command executed')
                    },
                })
            )

            menu.append(
                new MenuItem({
                    label: 'Copy Module ID',
                    click: () => {
                        clipboard.writeText(moduleId)
                    },
                })
            )

            menu.append(
                new MenuItem({
                    label: 'Copy Module Path',
                    click: () => {
                        clipboard.writeText(modulePath)
                    },
                })
            )

            menu.append(
                new MenuItem({
                    label: 'Open Folder',
                    click: () => {
                        shell.openPath(modulePath)
                    },
                })
            )

            menu.append(new MenuItem({ type: 'separator' }))

            menu.append(
                new MenuItem({
                    label: 'Delete Module',
                    click: async () => {
                        const response = dialog.showMessageBoxSync(window, {
                            type: 'question',
                            buttons: ['Cancel', 'Delete'],
                            defaultId: 0,
                            title: 'Confirm Delete',
                            message: 'Are you sure you want to delete this module?',
                        })

                        if (response === 1) {
                            // User clicked Delete
                            await removeModule(moduleId)
                        }
                    },
                })
            )

            menu.popup({ window })
        }
    )

    // Add library context menu handler
    ipcMain.handle('moduleExplorer:showLibraryContextMenu', async (event, librarySlug: string) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window) return

        const menu = new Menu()
        menu.append(
            new MenuItem({
                label: 'View Library',
                click: () => {
                    window.webContents.executeJavaScript(
                        `window.history.pushState(null, '', '/library/view/${librarySlug}'); window.dispatchEvent(new PopStateEvent('popstate'))`
                    )
                },
            })
        )

        menu.append(
            new MenuItem({
                label: 'Copy Library ID',
                click: () => {
                    clipboard.writeText(librarySlug)
                },
            })
        )

        menu.popup({ window })
    })
}
