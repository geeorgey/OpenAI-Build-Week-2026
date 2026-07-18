import Link from "next/link";
import { SurfaceNav } from "./SurfaceNav";

export type LegalSection = {
  heading: string;
  body: React.ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="app-surface legal-surface">
      <SurfaceNav />
      <article className="legal-shell">
        <header className="legal-hero">
          <span className="surface-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <small>Last updated: {updated}</small>
        </header>
        <div className="legal-grid">
          {sections.map((section, index) => (
            <section className="legal-card" key={section.heading}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.heading}</h2>
                <div>{section.body}</div>
              </div>
            </section>
          ))}
        </div>
        <footer className="legal-footer">
          <p>Questions: <a href="mailto:newEraPresentation@lvnsk.jp">newEraPresentation@lvnsk.jp</a></p>
          <Link href="/">Return to the presentation →</Link>
        </footer>
      </article>
    </main>
  );
}
