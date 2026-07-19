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
          <h1 className="surface-title">The control room is<br />for reviewers and hosts.</h1>
          <p className="surface-lead">This Build Week control room is protected by an allowlisted ID and judging password.</p>
          <div className="join-panel" style={{ marginTop: 36, maxWidth: 660 }}>
            {identity ? (
              <div className="verified-banner" style={{ background: "#6a3329" }}>
                <span>!</span><div><b>This session does not have admin access</b><small>{identity.email} / {identity.provider.toUpperCase()}</small></div>
              </div>
            ) : null}
            <div className="admin-login-ids" aria-label="Authorized control room IDs">
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
        <h1 className="surface-title">Publishing, conversation,<br />and follow-up. One room.</h1>
        <AdminLogoutButton />
        <AdminConsole />
      </div>
    </main>
  );
}
