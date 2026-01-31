// Bootstrap file - loads environment variables before any other imports
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Verify critical environment variables
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  console.error("Please create a .env file with DATABASE_URL=postgresql://username:password@localhost:5432/photonictag");
  process.exit(1);
}

// Now dynamically import and start the main application
async function start() {
  const { default: main } = await import("./main.js");
  await main();
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
