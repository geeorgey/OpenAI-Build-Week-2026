import { slides } from "../../data/slides";
import { getIdentityFromRequest, isAdmin, upsertIdentity } from "../../../lib/auth";
import { requestHasPresentationAccess } from "../../../lib/access";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG } from "../../../lib/db";

export async function GET(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const database = getDatabase();
    await ensureDatabase(database);
    const result = await database.prepare(
      `SELECT
         c.id,
         c.slide_id AS slideId,
         COALESCE(u.display_name, c.guest_name, 'Guest') AS displayName,
         c.body,
         c.verified,
         c.provider,
         c.created_at AS createdAt
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.presentation_slug = ? AND c.visible = 1
       ORDER BY c.created_at ASC
       LIMIT 250`,
    ).bind(PRESENTATION_SLUG).all();

    return Response.json({
      comments: result.results.map((row) => ({
        ...row,
        verified: Boolean(row.verified),
      })),
    });
  } catch {
    return Response.json({ comments: [] });
  }
}

export async function POST(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const payload = await request.json() as {
      body?: string;
      displayName?: string;
      slideId?: string;
    };
    const body = payload.body?.trim() ?? "";
    const displayName = payload.displayName?.trim().slice(0, 40) || "Guest";
    const slideId = payload.slideId?.trim() ?? "";
    if (!body || body.length > 280) {
      return Response.json({ error: "コメントは1〜280文字で入力してください。" }, { status: 400 });
    }
    if (!slides.some((slide) => slide.id === slideId)) {
      return Response.json({ error: "不明なスライドです。" }, { status: 400 });
    }

    const database = getDatabase();
    await ensureDatabase(database);
    const identity = await getIdentityFromRequest(request);
    if (identity?.verified) await upsertIdentity(identity);

    const inserted = await database.prepare(
      `INSERT INTO comments (
         presentation_slug, slide_id, user_id, guest_name, body, verified, provider
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id, slide_id AS slideId, body, verified, provider, created_at AS createdAt`,
    ).bind(
      PRESENTATION_SLUG,
      slideId,
      identity?.verified ? identity.id : null,
      identity?.verified ? null : displayName,
      body,
      identity?.verified ? 1 : 0,
      identity?.provider ?? null,
    ).first<Record<string, unknown>>();

    return Response.json({
      comment: {
        ...inserted,
        displayName: identity?.verified ? identity.displayName : displayName,
        verified: Boolean(inserted?.verified),
      },
    }, { status: 201 });
  } catch {
    return Response.json({ error: "コメントを保存できませんでした。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const identity = await getIdentityFromRequest(request);
  if (!isAdmin(identity)) {
    return Response.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }
  const payload = await request.json() as { id?: number; visible?: boolean };
  if (!Number.isInteger(payload.id)) {
    return Response.json({ error: "Invalid comment id" }, { status: 400 });
  }
  const database = getDatabase();
  await ensureDatabase(database);
  await database.prepare("UPDATE comments SET visible = ? WHERE id = ?")
    .bind(payload.visible === false ? 0 : 1, payload.id)
    .run();
  return Response.json({ ok: true });
}
