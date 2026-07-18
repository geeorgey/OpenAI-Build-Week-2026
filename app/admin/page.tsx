import type { Metadata } from "next";
import Link from "next/link";
import { getServerIdentity, isAdmin } from "../../lib/auth";
import { SurfaceNav } from "../components/SurfaceNav";
import { AdminConsole } from "./AdminConsole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control Room",
  description: "Admin control room for New Era Presentation.",
};

export default async function AdminPage() {
  const identity = await getServerIdentity();
  const allowed = isAdmin(identity);

  if (!allowed) {
    return (
      <main className="app-surface">
        <SurfaceNav />
        <div className="surface-shell">
          <span className="surface-eyebrow">CONTROL ROOM / GOOGLE ONLY</span>
          <h1 className="surface-title">管理画面は、<br />信頼境界の内側に。</h1>
          <p className="surface-lead">Googleで認証され、メールアドレスが y@lne.st のアカウントだけがアクセスできます。</p>
          <div className="join-panel" style={{ marginTop: 36, maxWidth: 660 }}>
            {identity ? (
              <>
                <div className="verified-banner" style={{ background: "#6a3329" }}>
                  <span>!</span><div><b>アクセスできません</b><small>{identity.email} / {identity.provider.toUpperCase()}</small></div>
                </div>
                <p>この管理画面には Google認証済みの y@lne.st が必要です。</p>
              </>
            ) : (
              <Link className="identity-option" href="/auth/google/start">
                <span>G</span><div><b>Googleで管理者認証</b><small>y@lne.st のアカウントを選択</small></div><em>ADMIN ONLY</em>
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-surface">
      <SurfaceNav />
      <div className="surface-shell">
        <span className="surface-eyebrow">CONTROL ROOM / {identity.email}</span>
        <h1 className="surface-title">公開、対話、配信。<br />全部ここから。</h1>
        <AdminConsole />
      </div>
    </main>
  );
}
