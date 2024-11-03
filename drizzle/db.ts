/**
 * Initializes a SQLite database connection using the `drizzle-orm` library.
 * The database file is named `sqlite.db` and is located in the `app/db` directory.
 * The `db` object can be used to interact with the SQLite database throughout the application.
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

export default db;
