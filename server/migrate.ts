import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import path from "path";

export async function runMigrations() {
    const migrationsFolder = path.resolve(process.cwd(), "migrations");
    console.log(`[DB Init] Running migrations programmatically from ${migrationsFolder}...`);
    try {
        await migrate(db, { migrationsFolder });
        console.log("[DB Init] Migrations completed successfully!");
    } catch (error) {
        console.error("[DB Init] Migration failed:", error);
        throw error;
    }
}
