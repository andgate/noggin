/**
 * Initializes a SQLite database connection using the `drizzle-orm` library.
 * The database file is named `sqlite.db` and is located in the `app/db` directory.
 * The `db` object can be used to interact with the SQLite database throughout the application.
 */
import * as schema from '@noggin/drizzle/schema'
import { drizzle } from 'drizzle-orm/sqlite-proxy'

export const db = drizzle(
    async (sql, params, method) => {
        try {
            console.log('db args ==>', { sql, params, method })
            const rows = await window.api.db.execute(sql, params, method)
            return { rows }
        } catch (e: any) {
            console.error('SQLite Proxy Error:', {
                message: e.message,
                responseData: e.response?.data,
                stack: e.stack,
                args: args, // Include the original query arguments
            })
            return { rows: [] }
        }
    },
    {
        schema: schema,
    }
)

export default db
