/**
 * Database Initialization
 * Automatically creates the database if it doesn't exist
 */

import pg from "pg";

export async function initializeDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Parse the database URL to extract connection info
  const dbUrl = new URL(process.env.DATABASE_URL);
  const dbName = dbUrl.pathname.slice(1); // Remove leading slash

  // Create connection to postgres database (default database)
  const adminUrl = new URL(process.env.DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const adminPool = new pg.Pool({
    connectionString: adminUrl.toString(),
  });

  try {
    // Check if database exists
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`[DB Init] Creating database '${dbName}'...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`[DB Init] Database '${dbName}' created successfully!`);
    } else {
      console.log(`[DB Init] Database '${dbName}' already exists.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[DB Init] Error initializing database: ${error.message}`);
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}
