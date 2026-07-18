import { env } from "cloudflare:workers";

export const PRESENTATION_SLUG = "build-week";

type RuntimeEnv = {
  DB?: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  EMAIL_WORKER_URL?: string;
  EMAIL_WORKER_SECRET?: string;
  APP_BASE_URL?: string;
  ADMIN_PASSWORD?: string;
};

export function getRuntimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
}

export function getDatabase(): D1Database {
  const database = getRuntimeEnv().DB;
  if (!database) {
    throw new Error("D1 database binding is unavailable.");
  }
  return database;
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS presentations (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public',
    password_hash TEXT,
    current_slide INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_provider_email_idx ON users(provider, email)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS magic_links (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presentation_slug TEXT NOT NULL DEFAULT 'build-week',
    slide_id TEXT NOT NULL,
    user_id TEXT,
    guest_name TEXT,
    body TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    provider TEXT,
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS comments_slide_idx ON comments(presentation_slug, slide_id, visible, created_at)`,
  `CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presentation_slug TEXT NOT NULL DEFAULT 'build-week',
    slide_id TEXT NOT NULL,
    user_id TEXT,
    visitor_id TEXT NOT NULL,
    stamp TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS reactions_slide_idx ON reactions(presentation_slug, slide_id, stamp)`,
  `CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    segment TEXT NOT NULL DEFAULT 'all_opted_in',
    status TEXT NOT NULL DEFAULT 'draft',
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TEXT
  )`,
];

let initialization: Promise<void> | null = null;

export async function ensureDatabase(database = getDatabase()) {
  if (!initialization) {
    initialization = (async () => {
      await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
      await database.prepare(
        `INSERT OR IGNORE INTO presentations (slug, title, visibility, current_slide)
         VALUES (?, ?, 'public', 1)`,
      ).bind(PRESENTATION_SLUG, "New Era Presentation").run();
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
}

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
