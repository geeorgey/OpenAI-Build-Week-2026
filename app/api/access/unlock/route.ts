import { ensureDatabase, getDatabase, PRESENTATION_SLUG, sha256 } from "../../../../lib/db";

export async function POST(request: Request) {
  const payload = await request.json() as { password?: string };
  const password = payload.password ?? "";
  const database = getDatabase();
  await ensureDatabase(database);
  const record = await database.prepare(
    "SELECT visibility, password_hash AS passwordHash FROM presentations WHERE slug = ?",
  ).bind(PRESENTATION_SLUG).first<{ visibility: string; passwordHash: string | null }>();
  if (!record || record.visibility !== "password" || !record.passwordHash) {
    return Response.json({ error: "This presentation is not password protected." }, { status: 400 });
  }
  const submittedHash = await sha256(password);
  if (submittedHash !== record.passwordHash) {
    return Response.json({ error: "Invalid password" }, { status: 403 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": `nep_access=${encodeURIComponent(record.passwordHash)}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400`,
    },
  });
}
