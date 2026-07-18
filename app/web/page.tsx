import type { Metadata } from "next";
import { DeckExperience } from "../components/DeckExperience";
import { PresentationGate } from "../components/PresentationGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Web Experience",
  description: "Self-paced mode for New Era Presentation.",
};

export default function WebPage() {
  return <PresentationGate><DeckExperience mode="web" /></PresentationGate>;
}
