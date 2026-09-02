import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error(
    'No Postgres connection string found. Set DATABASE_URL (Vercel: add the Neon/Postgres ' +
      'storage integration in your project dashboard, or run `vercel env pull` for local dev).'
  );
}

export const sql = neon(connectionString);

let schemaReady = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        pay TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        total INTEGER NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;
  }
  return schemaReady;
}
