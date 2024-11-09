import type { Config } from 'drizzle-kit'

export default {
    out: './migrations',
    schema: './src/drizzle/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: './sqlite.db',
    },
} satisfies Config
