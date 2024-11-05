import type { Config } from "drizzle-kit";

export default {
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: "./sqlite.db",
    },
} satisfies Config;
