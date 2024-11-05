export type NogginElectronAPI = {
    db: {
        execute: (...args: any[]) => Promise<any[]>
    }
}
