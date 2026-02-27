import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";

export async function runMigrations() {
    console.log("[DB Init] Running migrations programmatically...");
    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("[DB Init] Migrations completed successfully!");
    } catch (error) {
        console.error("[DB Init] Migration failed:", error);
        throw error;
    }
}
