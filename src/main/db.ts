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

function getMigrationsFolder(): string {
    return import.meta.env.DEV ? 'migrations' : path.join(app.getPath('userData'), 'migrations')
}

function ensureDirectory(dir: string) {
    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
        console.log(`Directory does not exist. Creating directory at: ${dir}`)
        fs.mkdirSync(dir, { recursive: true })
    }
}

function ensureFile(filePath: string) {
    // Ensure the directory exists first
    ensureDirectory(path.dirname(filePath))

    // // Ensure the file exists
    if (!fs.existsSync(filePath)) {
        console.log(`Database file does not exist. Creating new database at: ${filePath}`)
        fs.closeSync(fs.openSync(filePath, 'w')) // Create the file
    }
}

function createSqlite(dbPath: string) {
    try {
        ensureFile(dbPath)
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
const sqlite = createSqlite(dbPath)
export const db = createDb(sqlite)

console.log('Database connection establish.')

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
    const result = sqlite.prepare(sql)
    const ret = result[method](...params)
    return toDrizzleResult(ret)
}

export const runMigrate = async () => {
    ensureDirectory(getMigrationsFolder())
    return migrate(db, { migrationsFolder: 'migrations' })
}
