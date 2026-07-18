import { getIdentityFromRequest, isAdmin } from "../../../lib/auth";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG, sha256 } from "../../../lib/db";
import { slides } from "../../data/slides";

export async function GET() {
  try {
    const database = getDatabase();
    await ensureDatabase(database);
    const presentation = await database.prepare(
      `SELECT slug, title, visibility, current_slide AS currentSlide, updated_at AS updatedAt
       FROM presentations WHERE slug = ?`,
    ).bind(PRESENTATION_SLUG).first();
    return Response.json({ presentation });
  } catch {
    return Response.json({
      presentation: {
        slug: PRESENTATION_SLUG,
        title: "New Era Presentation",
        visibility: "public",
        currentSlide: 1,
      },
    });
  }
}

export async function PATCH(request: Request) {
  const identity = await getIdentityFromRequest(request);
  if (!isAdmin(identity)) {
    return Response.json({ error: "管理者IDとパスワードでのログインが必要です。" }, { status: 403 });
  }
  const payload = await request.json() as {
    visibility?: "public" | "password" | "private";
    password?: string;
    currentSlide?: number;
  };
  const database = getDatabase();
  await ensureDatabase(database);

  if (payload.visibility) {
    const allowed = new Set(["public", "password", "private"]);
    if (!allowed.has(payload.visibility)) {
      return Response.json({ error: "Invalid visibility" }, { status: 400 });
    }
    const passwordHash = payload.visibility === "password" && payload.password
      ? await sha256(payload.password)
      : null;
    await database.prepare(
      `UPDATE presentations
       SET visibility = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE slug = ?`,
    ).bind(payload.visibility, passwordHash, PRESENTATION_SLUG).run();
  }

  if (Number.isInteger(payload.currentSlide)) {
    const currentSlide = Math.min(slides.length, Math.max(1, payload.currentSlide!));
    await database.prepare(
      "UPDATE presentations SET current_slide = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
    ).bind(currentSlide, PRESENTATION_SLUG).run();
  }

  return Response.json({ ok: true });
}
