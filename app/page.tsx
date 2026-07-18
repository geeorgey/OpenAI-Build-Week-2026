import type { Metadata } from "next";
import { DeckExperience } from "./components/DeckExperience";
import { PresentationGate } from "./components/PresentationGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Era Presentation — OpenAI Build Week",
  description:
    "A presentation that remembers every reaction, question, and participant.",
};

export default function Home() {
  return <PresentationGate><DeckExperience mode="present" /></PresentationGate>;
}
