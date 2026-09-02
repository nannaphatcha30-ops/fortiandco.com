import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.sqlite');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    pay TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    total INTEGER NOT NULL,
    items TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);
