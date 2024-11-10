import type { Config } from 'drizzle-kit'

const migrationFolder = process.env.NODE_ENV === 'development' ? 'migrations' : 'build/migrations'

export default {
    out: migrationFolder,
    schema: './src/drizzle/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: './sqlite.db',
    },
} satisfies Config
