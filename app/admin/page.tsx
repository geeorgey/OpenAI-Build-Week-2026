import type { Metadata } from "next";
import { getServerIdentity, isAdmin } from "../../lib/auth";
import { SurfaceNav } from "../components/SurfaceNav";
import { AdminLoginForm, AdminLogoutButton } from "./AdminAuth";
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
          <span className="surface-eyebrow">CONTROL ROOM / ID + PASSWORD</span>
          <h1 className="surface-title">管理画面は、<br />審査員と主催者だけに。</h1>
          <p className="surface-lead">Build Week審査用のIDとパスワードで保護しています。主催者と公式審査アドレスだけがアクセスできます。</p>
          <div className="join-panel" style={{ marginTop: 36, maxWidth: 660 }}>
            {identity ? (
              <div className="verified-banner" style={{ background: "#6a3329" }}>
                <span>!</span><div><b>このセッションには管理権限がありません</b><small>{identity.email} / {identity.provider.toUpperCase()}</small></div>
              </div>
            ) : null}
            <div className="admin-login-ids" aria-label="管理画面へログインできるID">
              <span>AUTHORIZED IDS</span>
              <code>y@lne.st</code>
              <code>testing@devpost.com</code>
              <code>build-week-event@openai.com</code>
            </div>
            <AdminLoginForm />
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
        <AdminLogoutButton />
        <AdminConsole />
      </div>
    </main>
  );
}
