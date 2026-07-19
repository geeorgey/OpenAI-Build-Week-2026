import { requestHasPresentationAccess } from "../../../lib/access";
import { getIdentityFromRequest, upsertIdentity } from "../../../lib/auth";
import { BRANCH_SLIDE_ID, branchOptions } from "../../../lib/branching";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG } from "../../../lib/db";

async function getVoteState(visitorId?: string) {
  const database = getDatabase();
  const [countsResult, selectedResult] = await Promise.all([
    database.prepare(
      `SELECT option_id AS optionId, COUNT(*) AS count
       FROM branch_votes
       WHERE presentation_slug = ? AND slide_id = ?
         AND updated_at >= (
           SELECT updated_at FROM presentations WHERE slug = ?
         )
       GROUP BY option_id`,
    ).bind(PRESENTATION_SLUG, BRANCH_SLIDE_ID, PRESENTATION_SLUG).all<{ optionId: string; count: number }>(),
    visitorId
      ? database.prepare(
        `SELECT option_id AS optionId
         FROM branch_votes
         WHERE presentation_slug = ? AND slide_id = ? AND visitor_id = ?
           AND updated_at >= (
             SELECT updated_at FROM presentations WHERE slug = ?
           )
         LIMIT 1`,
      ).bind(PRESENTATION_SLUG, BRANCH_SLIDE_ID, visitorId, PRESENTATION_SLUG).first<{ optionId: string }>()
      : Promise.resolve(null),
  ]);
  const counts = Object.fromEntries(branchOptions.map((option) => [option.id, 0]));
  for (const row of countsResult.results) {
    if (row.optionId in counts) counts[row.optionId] = Number(row.count) || 0;
  }
  return {
    counts,
    total: Object.values(counts).reduce((sum, count) => sum + count, 0),
    selectedOptionId: selectedResult?.optionId ?? null,
  };
}

export async function GET(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const visitorId = new URL(request.url).searchParams.get("visitorId")?.trim().slice(0, 80);
    const database = getDatabase();
    await ensureDatabase(database);
    return Response.json(await getVoteState(visitorId));
  } catch {
    return Response.json({
      counts: Object.fromEntries(branchOptions.map((option) => [option.id, 0])),
      total: 0,
      selectedOptionId: null,
    });
  }
}

export async function POST(request: Request) {
  try {
    if (!await requestHasPresentationAccess(request)) {
      return Response.json({ error: "Presentation is not available." }, { status: 403 });
    }
    const payload = await request.json() as {
      optionId?: string;
      visitorId?: string;
    };
    const optionId = payload.optionId?.trim() ?? "";
    const visitorId = payload.visitorId?.trim().slice(0, 80) ?? "";
    if (!branchOptions.some((option) => option.id === optionId) || !visitorId) {
      return Response.json({ error: "Invalid branch vote" }, { status: 400 });
    }

    const database = getDatabase();
    await ensureDatabase(database);
    const identity = await getIdentityFromRequest(request);
    if (identity?.verified) await upsertIdentity(identity);
    await database.prepare(
      `INSERT INTO branch_votes
       (presentation_slug, slide_id, option_id, visitor_id, user_id)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(presentation_slug, slide_id, visitor_id) DO UPDATE SET
         option_id = excluded.option_id,
         user_id = excluded.user_id,
         updated_at = CURRENT_TIMESTAMP`,
    ).bind(PRESENTATION_SLUG, BRANCH_SLIDE_ID, optionId, visitorId, identity?.id ?? null).run();

    return Response.json(await getVoteState(visitorId), { status: 201 });
  } catch {
    return Response.json({ error: "Vote could not be saved" }, { status: 500 });
  }
}
