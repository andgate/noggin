// TODO fix automatic migrations
// see https://github.com/drizzle-team/drizzle-orm/issues/680
import * as schema from '@noggin/drizzle/schema'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

console.log('Initializing db...', { dev: import.meta.env.DEV })
const dbPath = import.meta.env.DEV ? 'sqlite.db' : path.join(app.getPath('userData'), 'data.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

function toDrizzleResult(row: Record<string, any>)
function toDrizzleResult(rows: Record<string, any> | Array<Record<string, any>>) {
    if (!rows) {
        return []
    }
    if (Array.isArray(rows)) {
        return rows.map((row) => {
            return Object.keys(row).map((key) => row[key])
        })
    } else {
        return Object.keys(rows).map((key) => rows[key])
    }
}

export const execute = async (e, sqlstr, params, method) => {
    const result = sqlite.prepare(sqlstr)
    const ret = result[method](...params)
    return toDrizzleResult(ret)
}

export const runMigrate = async () => {
    const migrationsFolder = path.join(__dirname, './drizzle')
    console.log('Running migrations', migrationsFolder)
    return migrate(db, { migrationsFolder })
}
