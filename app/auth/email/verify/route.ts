import { createVerifiedSession } from "../../../../lib/auth";
import { ensureDatabase, getDatabase, sha256 } from "../../../../lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Invalid link", { status: 400 });

  const database = getDatabase();
  await ensureDatabase(database);
  const tokenHash = await sha256(token);
  const magicLink = await database.prepare(
    `SELECT email, marketing_opt_in
     FROM magic_links
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
  ).bind(tokenHash).first<{ email: string; marketing_opt_in: number }>();
  if (!magicLink) return new Response("This link is invalid or expired.", { status: 400 });

  await database.prepare("UPDATE magic_links SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
  const session = await createVerifiedSession({
    email: magicLink.email,
    displayName: magicLink.email.split("@")[0],
    provider: "email",
    marketingOptIn: Boolean(magicLink.marketing_opt_in),
  });
  return new Response(null, {
    status: 302,
    headers: {
      location: "/mypage",
      "set-cookie": session.cookie,
    },
  });
}
