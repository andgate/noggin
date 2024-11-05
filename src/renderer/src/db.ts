/**
 * Initializes a SQLite database connection using the `drizzle-orm` library.
 * The database file is named `sqlite.db` and is located in the `app/db` directory.
 * The `db` object can be used to interact with the SQLite database throughout the application.
 */
import * as schema from '@noggin/drizzle/schema'
import { drizzle } from 'drizzle-orm/sqlite-proxy'

export const db = drizzle(
    async (args) => {
        try {
            const result = await window.api.db.execute(...args)
            return { rows: result }
        } catch (e: any) {
            console.error('Error from sqlite proxy server: ', e.response.data)
            return { rows: [] }
        }
    },
    {
        schema: schema,
    }
)

export default db
