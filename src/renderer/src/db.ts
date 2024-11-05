/**
 * Initializes a SQLite database connection using the `drizzle-orm` library.
 * The database file is named `sqlite.db` and is located in the `app/db` directory.
 * The `db` object can be used to interact with the SQLite database throughout the application.
 */
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from '../../drizzle/schema'

export const db = drizzle(
    async (...args) => {
        try {
            // @ts-expect-error
            const result = await window.api.execute(...args)
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
