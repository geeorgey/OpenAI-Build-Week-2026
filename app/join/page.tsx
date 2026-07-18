import type { Metadata } from "next";
import { JoinExperience } from "../components/JoinExperience";
import { PresentationGate } from "../components/PresentationGate";
import { SurfaceNav } from "../components/SurfaceNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join",
  description: "Join the live New Era Presentation.",
};

export default function JoinPage() {
  return (
    <PresentationGate>
      <main className="app-surface">
        <SurfaceNav />
        <div className="surface-shell">
          <span className="surface-eyebrow">LIVE PARTICIPATION / JOIN</span>
          <h1 className="surface-title">いまのスライドに、<br />あなたの反応を。</h1>
          <p className="surface-lead">スタンプもコメントも、投稿された瞬間のスライドに結びつきます。</p>
          <JoinExperience />
        </div>
      </main>
    </PresentationGate>
  );
}
