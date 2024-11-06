export type NogginElectronAPI = {
    db: {
        execute: (
            sql: string,
            params: any[],
            method: 'run' | 'all' | 'values' | 'get'
        ) => Promise<any[]>
    }
}
