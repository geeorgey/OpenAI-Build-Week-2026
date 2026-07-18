import { cookies, headers } from "next/headers";
import { ensureDatabase, getDatabase, randomToken, sha256 } from "./db";

export type Identity = {
  id: string;
  email: string | null;
  displayName: string;
  provider: "guest" | "email" | "google" | "chatgpt";
  verified: boolean;
  marketingOptIn: boolean;
};

const SESSION_COOKIE = "nep_session";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function parseCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const item of cookieHeader.split(";")) {
    const [key, ...rest] = item.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function getIdentityFromRequest(request: Request): Promise<Identity | null> {
  const chatGptEmail = request.headers.get("oai-authenticated-user-email");
  if (chatGptEmail) {
    const encodedName = request.headers.get("oai-authenticated-user-full-name");
    const name = encodedName ? safeDecode(encodedName) : chatGptEmail;
    return {
      id: `chatgpt:${chatGptEmail.toLowerCase()}`,
      email: chatGptEmail.toLowerCase(),
      displayName: name ?? chatGptEmail,
      provider: "chatgpt",
      verified: true,
      marketingOptIn: false,
    };
  }

  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!token) return null;
  return getIdentityByToken(token);
}

export async function getServerIdentity(): Promise<Identity | null> {
  const requestHeaders = await headers();
  const chatGptEmail = requestHeaders.get("oai-authenticated-user-email");
  if (chatGptEmail) {
    const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
    const name = encodedName ? safeDecode(encodedName) : chatGptEmail;
    return {
      id: `chatgpt:${chatGptEmail.toLowerCase()}`,
      email: chatGptEmail.toLowerCase(),
      displayName: name ?? chatGptEmail,
      provider: "chatgpt",
      verified: true,
      marketingOptIn: false,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getIdentityByToken(token);
}

async function getIdentityByToken(token: string): Promise<Identity | null> {
  const database = getDatabase();
  await ensureDatabase(database);
  const tokenHash = await sha256(token);
  const row = await database.prepare(
    `SELECT u.id, u.email, u.display_name, u.provider, u.verified, u.marketing_opt_in
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
  ).bind(tokenHash).first<{
    id: string;
    email: string | null;
    display_name: string;
    provider: Identity["provider"];
    verified: number;
    marketing_opt_in: number;
  }>();
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    provider: row.provider,
    verified: Boolean(row.verified),
    marketingOptIn: Boolean(row.marketing_opt_in),
  };
}

export async function createVerifiedSession(input: {
  email: string;
  displayName: string;
  provider: "email" | "google" | "chatgpt";
  marketingOptIn?: boolean;
}) {
  const database = getDatabase();
  await ensureDatabase(database);
  const email = input.email.trim().toLowerCase();
  const existing = await database.prepare(
    "SELECT id, marketing_opt_in FROM users WHERE provider = ? AND email = ? LIMIT 1",
  ).bind(input.provider, email).first<{ id: string; marketing_opt_in: number }>();
  const userId = existing?.id ?? `${input.provider}:${crypto.randomUUID()}`;
  const marketingOptIn = input.marketingOptIn || Boolean(existing?.marketing_opt_in);

  await database.prepare(
    `INSERT INTO users (id, email, display_name, provider, verified, marketing_opt_in, last_seen_at)
     VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       verified = 1,
       marketing_opt_in = MAX(users.marketing_opt_in, excluded.marketing_opt_in),
       last_seen_at = CURRENT_TIMESTAMP`,
  ).bind(userId, email, input.displayName, input.provider, marketingOptIn ? 1 : 0).run();

  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + THIRTY_DAYS).toISOString();
  await database.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
  ).bind(tokenHash, userId, expiresAt).run();

  return {
    token,
    cookie: sessionCookie(token),
    identity: {
      id: userId,
      email,
      displayName: input.displayName,
      provider: input.provider,
      verified: true,
      marketingOptIn,
    } satisfies Identity,
  };
}

export async function upsertIdentity(identity: Identity) {
  if (!identity.verified || !identity.email) return;
  const database = getDatabase();
  await ensureDatabase(database);
  await database.prepare(
    `INSERT INTO users (id, email, display_name, provider, verified, marketing_opt_in, last_seen_at)
     VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       verified = 1,
       last_seen_at = CURRENT_TIMESTAMP`,
  ).bind(
    identity.id,
    identity.email,
    identity.displayName,
    identity.provider,
    identity.marketingOptIn ? 1 : 0,
  ).run();
}

export function isAdmin(identity: Identity | null) {
  return Boolean(
    identity &&
    identity.provider === "google" &&
    identity.verified &&
    identity.email?.toLowerCase() === "y@lne.st",
  );
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${THIRTY_DAYS / 1000}`;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
