import { ensureDatabase, getDatabase, getRuntimeEnv, randomToken, sha256 } from "../../../../../lib/db";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { email?: string; marketingOptIn?: boolean };
    const email = payload.email?.trim().toLowerCase() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
    }

    const database = getDatabase();
    await ensureDatabase(database);
    const token = randomToken();
    const tokenHash = await sha256(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await database.prepare(
      "INSERT INTO magic_links (token_hash, email, marketing_opt_in, expires_at) VALUES (?, ?, ?, ?)",
    ).bind(tokenHash, email, payload.marketingOptIn ? 1 : 0, expiresAt).run();

    const runtime = getRuntimeEnv();
    const baseUrl = runtime.APP_BASE_URL || new URL(request.url).origin;
    const magicLink = `${baseUrl}/auth/email/verify?token=${encodeURIComponent(token)}`;
    if (!runtime.EMAIL_WORKER_URL || !runtime.EMAIL_WORKER_SECRET) {
      return Response.json({
        error: "メール送信基盤の公開設定がまだ完了していません。",
        ready: false,
      }, { status: 503 });
    }

    const emailResponse = await fetch(runtime.EMAIL_WORKER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-new-era-secret": runtime.EMAIL_WORKER_SECRET,
      },
      body: JSON.stringify({
        type: "magic_link",
        to: email,
        magicLink,
      }),
    });
    if (!emailResponse.ok) {
      return Response.json({ error: "認証メールを送信できませんでした。" }, { status: 502 });
    }

    return Response.json({ ok: true, message: "認証リンクをメールで送りました。" });
  } catch {
    return Response.json({ error: "認証メールを準備できませんでした。" }, { status: 500 });
  }
}
