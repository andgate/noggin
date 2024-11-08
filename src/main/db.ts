// TODO fix automatic migrations
// see https://github.com/drizzle-team/drizzle-orm/issues/680
import * as schema from '@noggin/drizzle/schema'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import fs from 'fs'
import path, { resolve } from 'path'

function getDbPath(): string {
    return import.meta.env.DEV ? 'sqlite.db' : path.join(app.getPath('userData'), 'data.db')
}

function createSqlite(dbPath: string) {
    try {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true })
        return new Database(resolve(dbPath))
    } catch (e) {
        console.error('Error creating sqlite at db path', e)
        throw new Error('Error creating sqlite at db path', { cause: e })
    }
}

function createDb(sqlite: Database.Database) {
    try {
        return drizzle(sqlite, { schema })
    } catch (e) {
        console.error('Error creating db', e)
        throw new Error('Error creating db', { cause: e })
    }
}

const dbPath = getDbPath()
console.log('database path ==>', resolve(dbPath))

const sqlite = createSqlite(dbPath)
export const db = createDb(sqlite)

console.log('Created db')

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

export const execute = async (e, sql, params, method) => {
    console.log('db:execute ==>', { e, sql, params, method })
    const result = sqlite.prepare(sql)
    console.log('result ==>', result)
    const ret = result[method](...params)
    return toDrizzleResult(ret)
}

export const runMigrate = async () => {
    const migrationsFolder = path.join(__dirname, './drizzle')
    console.log('Running migrations', migrationsFolder)
    return migrate(db, { migrationsFolder })
}
