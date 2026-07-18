import { getIdentityFromRequest, isAdmin } from "../../../../lib/auth";
import { ensureDatabase, getDatabase, getRuntimeEnv } from "../../../../lib/db";

export async function POST(request: Request) {
  const identity = await getIdentityFromRequest(request);
  if (!isAdmin(identity)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json() as { subject?: string; body?: string; segment?: string };
  const subject = payload.subject?.trim() ?? "";
  const body = payload.body?.trim() ?? "";
  if (!subject || !body) return Response.json({ error: "件名と本文が必要です。" }, { status: 400 });

  const database = getDatabase();
  await ensureDatabase(database);
  const recipients = await database.prepare(
    `SELECT email, display_name AS displayName FROM users
     WHERE verified = 1 AND marketing_opt_in = 1 AND email IS NOT NULL
     LIMIT 50`,
  ).all<{ email: string; displayName: string }>();
  const runtime = getRuntimeEnv();
  if (!runtime.EMAIL_WORKER_URL || !runtime.EMAIL_WORKER_SECRET) {
    return Response.json({ error: "Cloudflare Email Worker が未設定です。" }, { status: 503 });
  }

  const campaign = await database.prepare(
    `INSERT INTO campaigns (subject, body, segment, status)
     VALUES (?, ?, ?, 'sending') RETURNING id`,
  ).bind(subject, body, payload.segment ?? "all_opted_in").first<{ id: number }>();
  const emailResponse = await fetch(runtime.EMAIL_WORKER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-new-era-secret": runtime.EMAIL_WORKER_SECRET,
    },
    body: JSON.stringify({
      type: "campaign",
      recipients: recipients.results,
      subject,
      body,
    }),
  });
  if (!emailResponse.ok) {
    await database.prepare("UPDATE campaigns SET status = 'failed' WHERE id = ?").bind(campaign?.id).run();
    return Response.json({ error: "メール配信に失敗しました。" }, { status: 502 });
  }

  await database.prepare(
    "UPDATE campaigns SET status = 'sent', sent_count = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).bind(recipients.results.length, campaign?.id).run();
  return Response.json({ message: `${recipients.results.length}人へ配信しました。` });
}
