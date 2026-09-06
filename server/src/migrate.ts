import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL in server/.env');
    process.exit(1);
  }

  // Connect to maintenance DB to create bazaar if needed
  const parsed = new URL(url);
  const dbName = parsed.pathname.replace(/^\//, '') || 'bazaar';
  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';

  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database exists: ${dbName}`);
  }
  await admin.end();

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query(schema);
  await client.end();
  console.log('Schema applied successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
