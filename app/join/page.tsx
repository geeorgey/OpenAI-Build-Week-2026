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
          <h1 className="surface-title">React to the slide.<br />Shape the room.</h1>
          <p className="surface-lead">Every stamp, comment, and vote stays connected to the slide that sparked it.</p>
          <JoinExperience />
        </div>
      </main>
    </PresentationGate>
  );
}
