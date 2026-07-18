import { slides } from "../../data/slides";
import { getIdentityFromRequest, upsertIdentity } from "../../../lib/auth";
import { requestHasPresentationAccess } from "../../../lib/access";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG } from "../../../lib/db";

const allowedStamps = new Set(["🔥", "💡", "👏", "❓"]);

export async function GET(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const database = getDatabase();
    await ensureDatabase(database);
    const result = await database.prepare(
      `SELECT slide_id AS slideId, stamp, COUNT(*) AS count
       FROM reactions
       WHERE presentation_slug = ?
       GROUP BY slide_id, stamp`,
    ).bind(PRESENTATION_SLUG).all();
    return Response.json({ reactions: result.results });
  } catch {
    return Response.json({ reactions: [] });
  }
}

export async function POST(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const payload = await request.json() as {
      slideId?: string;
      stamp?: string;
      visitorId?: string;
    };
    const slideId = payload.slideId?.trim() ?? "";
    const stamp = payload.stamp?.trim() ?? "";
    const visitorId = payload.visitorId?.trim().slice(0, 80) ?? "";
    if (!slides.some((slide) => slide.id === slideId) || !allowedStamps.has(stamp) || !visitorId) {
      return Response.json({ error: "Invalid reaction" }, { status: 400 });
    }

    const database = getDatabase();
    await ensureDatabase(database);
    const identity = await getIdentityFromRequest(request);
    if (identity?.verified) await upsertIdentity(identity);
    await database.prepare(
      `INSERT INTO reactions (presentation_slug, slide_id, user_id, visitor_id, stamp)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(PRESENTATION_SLUG, slideId, identity?.id ?? null, visitorId, stamp).run();
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Reaction could not be saved" }, { status: 500 });
  }
}
