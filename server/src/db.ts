import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set — copy server/.env.example to server/.env');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}
