/**
 * Setup Database Script
 * Creates the database if it doesn't exist, then runs migrations
 */

const { execSync } = require('child_process');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('========================================');
  console.log('PhotonicTag Database Setup');
  console.log('========================================\n');

  // Parse the database URL
  const dbUrl = new URL(DATABASE_URL);
  const dbName = dbUrl.pathname.slice(1); // Remove leading slash

  // Create connection to postgres database (default database)
  const adminUrl = new URL(DATABASE_URL);
  adminUrl.pathname = '/postgres';

  const adminPool = new pg.Pool({
    connectionString: adminUrl.toString(),
  });

  try {
    console.log(`Checking if database '${dbName}' exists...`);

    // Check if database exists
    const result = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Creating database '${dbName}'...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully!\n`);
    } else {
      console.log(`✓ Database '${dbName}' already exists.\n`);
    }

    await adminPool.end();

    // Now run drizzle-kit push
    console.log('Pushing database schema...');
    execSync('npm run db:push', { stdio: 'inherit' });

    console.log('\n========================================');
    console.log('✓ Database setup complete!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error during database setup:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL is correct in .env file');
    console.error('3. PostgreSQL password is correct\n');
    process.exit(1);
  }
}

setupDatabase();
