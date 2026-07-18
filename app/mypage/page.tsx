import type { Metadata } from "next";
import Link from "next/link";
import { getServerIdentity, upsertIdentity } from "../../lib/auth";
import { ensureDatabase, getDatabase } from "../../lib/db";
import { SurfaceNav } from "../components/SurfaceNav";
import { slides } from "../data/slides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Presentation Memory",
  description: "Your verified reactions and comments.",
};

export default async function MyPage() {
  const identity = await getServerIdentity();

  if (!identity?.verified) {
    return (
      <main className="app-surface">
        <SurfaceNav />
        <div className="surface-shell">
          <span className="surface-eyebrow">MY PRESENTATION MEMORY</span>
          <h1 className="surface-title">思考の履歴は、<br />認証した人のもの。</h1>
          <p className="surface-lead">Google、ChatGPT、またはメールで認証すると、スタンプとコメントを自分の記憶として保存できます。</p>
          <div className="join-panel" style={{ marginTop: 36, maxWidth: 660 }}>
            <div className="identity-options">
              <Link className="identity-option" href="/auth/google/start"><span>G</span><div><b>Google で認証</b><small>Googleアカウントで続ける</small></div><em>✓ VERIFIED</em></Link>
              <Link className="identity-option" href="/auth/chatgpt/complete"><span>◉</span><div><b>ChatGPT で認証</b><small>Sign in with ChatGPT</small></div><em>✓ VERIFIED</em></Link>
              <Link className="identity-option" href="/join"><span>@</span><div><b>メールで認証</b><small>/join からマジックリンクを受け取る</small></div><em>✓ VERIFIED</em></Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  await upsertIdentity(identity);
  const database = getDatabase();
  await ensureDatabase(database);
  const [commentsResult, reactionsResult] = await Promise.all([
    database.prepare(
      `SELECT slide_id AS slideId, body, created_at AS createdAt
       FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    ).bind(identity.id).all<{ slideId: string; body: string; createdAt: string }>(),
    database.prepare(
      `SELECT slide_id AS slideId, stamp, created_at AS createdAt
       FROM reactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    ).bind(identity.id).all<{ slideId: string; stamp: string; createdAt: string }>(),
  ]);
  const activities = [
    ...commentsResult.results.map((item) => ({ ...item, type: "comment" as const })),
    ...reactionsResult.results.map((item) => ({ ...item, type: "reaction" as const })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="app-surface">
      <SurfaceNav />
      <div className="surface-shell">
        <span className="surface-eyebrow">MY PRESENTATION MEMORY / VERIFIED</span>
        <h1 className="surface-title">{identity.displayName}さんの<br />プレゼン記憶。</h1>
        <div className="verified-banner" style={{ maxWidth: 560 }}>
          <span>✓</span>
          <div><b>{identity.email}</b><small>{identity.provider.toUpperCase()} VERIFIED</small></div>
        </div>

        <div className="profile-grid">
          <section className="profile-panel">
            <span className="panel-kicker">STAMPS</span>
            <strong className="panel-number">{reactionsResult.results.length}</strong>
            <p>スライドに置いたリアクション</p>
          </section>
          <section className="profile-panel">
            <span className="panel-kicker">COMMENTS</span>
            <strong className="panel-number">{commentsResult.results.length}</strong>
            <p>文脈と一緒に残したコメント</p>
          </section>
          <section className="profile-panel full">
            <span className="panel-kicker">YOUR TIMELINE</span>
            <h2>どこで、何を感じたか。</h2>
            <div className="activity-list">
              {activities.length ? activities.map((item, index) => {
                const slideIndex = slides.findIndex((slide) => slide.id === item.slideId);
                const slide = slides[Math.max(0, slideIndex)];
                return (
                  <Link className="activity-item" href={`/web?slide=${slideIndex + 1}`} key={`${item.type}-${item.createdAt}-${index}`}>
                    <span>{item.type === "reaction" ? item.stamp : "💬"}</span>
                    <div>
                      <b>SLIDE {String(slideIndex + 1).padStart(2, "0")} · {slide.chapter}</b>
                      <p>{item.type === "comment" ? item.body : `${item.stamp} を置きました`}</p>
                    </div>
                    <small>{item.createdAt.slice(0, 16).replace("T", " ")}</small>
                  </Link>
                );
              }) : <p>認証後のスタンプとコメントが、ここに時系列で並びます。</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
