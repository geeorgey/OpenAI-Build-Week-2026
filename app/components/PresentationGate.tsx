import Link from "next/link";
import { getServerAccessState } from "../../lib/access";
import { AccessPrompt } from "./AccessPrompt";
import { SurfaceNav } from "./SurfaceNav";

export async function PresentationGate({ children }: { children: React.ReactNode }) {
  const access = await getServerAccessState();
  if (access.allowed) return children;

  return (
    <main className="app-surface">
      <SurfaceNav />
      <div className="surface-shell">
        <span className="surface-eyebrow">NEW ERA PRESENTATION / ACCESS</span>
        <h1 className="surface-title">
          {access.visibility === "private" ? "This presentation is private." : "This presentation has limited access."}
        </h1>
        <p className="surface-lead">
          {access.visibility === "private"
            ? "Please wait until the host publishes it. Admins can enter with an allowlisted ID and judging password."
            : "Enter the password shared by the host."}
        </p>
        {access.visibility === "password"
          ? <AccessPrompt />
          : <Link className="primary-action" style={{ display: "inline-block", marginTop: 28 }} href="/admin">ADMIN LOGIN</Link>}
      </div>
    </main>
  );
}
