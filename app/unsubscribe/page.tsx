import type { Metadata } from "next";
import Link from "next/link";
import { ensureDatabase, getDatabase, getRuntimeEnv } from "../../lib/db";
import { SurfaceNav } from "../components/SurfaceNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email Preferences",
};

type Props = {
  searchParams: Promise<{ email?: string; token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const { email = "", token = "" } = await searchParams;
  const runtime = getRuntimeEnv();
  const expected = runtime.EMAIL_WORKER_SECRET
    ? await sign(email.toLowerCase(), runtime.EMAIL_WORKER_SECRET)
    : "";
  const valid = Boolean(email && token && expected && timingSafeEqual(token, expected));
  if (valid) {
    const database = getDatabase();
    await ensureDatabase(database);
    await database.prepare("UPDATE users SET marketing_opt_in = 0 WHERE lower(email) = ?")
      .bind(email.toLowerCase())
      .run();
  }

  return (
    <main className="app-surface">
      <SurfaceNav />
      <div className="surface-shell">
        <span className="surface-eyebrow">EMAIL PREFERENCES</span>
        <h1 className="surface-title">{valid ? "配信を停止しました。" : "リンクを確認できませんでした。"}</h1>
        <p className="surface-lead">
          {valid
            ? `${email} へのマーケティングメールは今後配信されません。認証や重要なサービス通知は対象外です。`
            : "配信停止リンクの有効性を確認できませんでした。最新のメールに記載されたリンクをお使いください。"}
        </p>
        <Link className="primary-action" style={{ display: "inline-block", marginTop: 28 }} href="/">プレゼンに戻る</Link>
      </div>
    </main>
  );
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
