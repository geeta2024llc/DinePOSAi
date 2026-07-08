const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load pg package dynamically
try {
  require.resolve('pg');
} catch (err) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️ "pg" package not found. Installing dynamically (temporary)...');
  try {
    execSync('npm install pg --no-save', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', '✅ "pg" installed successfully.');
  } catch (installErr) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to install "pg". Please install it manually: npm install pg');
    process.exit(1);
  }
}

const { Client } = require('pg');

// 2. Load environment variables from apps/api/.env
const envPath = path.join(__dirname, '..', 'apps', 'api', '.env');
let connectionString = process.env.DATABASE_URL;

if (!connectionString && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const matches = envContent.match(/^DATABASE_URL\s*=\s*["']?([^\s"']+)["']?/m);
  if (matches && matches[1]) {
    connectionString = matches[1];
  }
}

if (!connectionString) {
  console.log('\x1b[36m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\x1b[31m%s\x1b[0m', '❌ DATABASE_URL environment variable is not defined.');
  console.log('\x1b[33m%s\x1b[0m', 'Please define DATABASE_URL in apps/api/.env or set it in your shell.');
  console.log('\x1b[30m%s\x1b[0m', 'Example: DATABASE_URL=postgres://postgres:[pwd]@db.supabase.co:5432/postgres');
  console.log('\x1b[36m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
}

// 3. Load migration file (accept optional file argument, default to combined_migrations.sql)
const migrationFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'supabase', 'combined_migrations.sql');

if (!fs.existsSync(migrationFile)) {
  console.error('\x1b[31m%s\x1b[0m', `❌ Migration file not found at: ${migrationFile}`);
  process.exit(1);
}

console.log(`⌛ Loading migration file: ${path.basename(migrationFile)}`);
const sql = fs.readFileSync(migrationFile, 'utf8');

async function run() {
  console.log('\x1b[36m%s\x1b[0m', '🚀 Connecting to target PostgreSQL / Supabase database...');
  
  // Set SSL configuration to optional but active for cloud databases (like Supabase)
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com')
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log('\x1b[32m%s\x1b[0m', '✅ Database connection established.');
    
    console.log('\x1b[33m%s\x1b[0m', '⌛ Executing database schema migrations (this might take a few seconds)...');
    
    // Run migration
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('\x1b[32m%s\x1b[0m', '🎉 All migrations applied successfully!');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // ignore rollback errors if connection was lost
    }
    console.error('\x1b[31m%s\x1b[0m', '❌ Migration failed and was rolled back.');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
