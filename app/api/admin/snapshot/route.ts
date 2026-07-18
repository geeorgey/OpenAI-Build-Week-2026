import { getIdentityFromRequest, isAdmin } from "../../../../lib/auth";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG } from "../../../../lib/db";

export async function GET(request: Request) {
  const identity = await getIdentityFromRequest(request);
  if (!isAdmin(identity)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const database = getDatabase();
  await ensureDatabase(database);
  const [presentation, comments, users, campaigns] = await Promise.all([
    database.prepare(
      "SELECT visibility, current_slide AS currentSlide FROM presentations WHERE slug = ?",
    ).bind(PRESENTATION_SLUG).first(),
    database.prepare(
      `SELECT c.id, c.slide_id AS slideId, COALESCE(u.display_name, c.guest_name, 'Guest') AS displayName,
        c.body, c.verified, c.visible
       FROM comments c LEFT JOIN users u ON u.id = c.user_id
       WHERE c.presentation_slug = ? ORDER BY c.created_at DESC LIMIT 250`,
    ).bind(PRESENTATION_SLUG).all(),
    database.prepare(
      `SELECT id, display_name AS displayName, email, provider, verified,
        marketing_opt_in AS marketingOptIn
       FROM users ORDER BY last_seen_at DESC LIMIT 250`,
    ).all(),
    database.prepare(
      `SELECT id, subject, status, sent_count AS sentCount, created_at AS createdAt
       FROM campaigns ORDER BY created_at DESC LIMIT 50`,
    ).all(),
  ]);
  return Response.json({
    presentation,
    comments: comments.results,
    users: users.results,
    campaigns: campaigns.results,
  });
}
