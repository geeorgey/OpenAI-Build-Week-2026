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
          {access.visibility === "private" ? "ただいま非公開です。" : "限られた人だけの、プレゼンです。"}
        </h1>
        <p className="surface-lead">
          {access.visibility === "private"
            ? "主催者が公開するまで、少しお待ちください。管理者は審査用IDとパスワードでログインできます。"
            : "主催者から共有されたパスワードを入力してください。"}
        </p>
        {access.visibility === "password"
          ? <AccessPrompt />
          : <Link className="primary-action" style={{ display: "inline-block", marginTop: 28 }} href="/admin">管理者ログイン</Link>}
      </div>
    </main>
  );
}
