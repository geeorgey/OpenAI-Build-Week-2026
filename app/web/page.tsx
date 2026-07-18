import type { Metadata } from "next";
import { DeckExperience } from "../components/DeckExperience";
import { PresentationGate } from "../components/PresentationGate";
import { slides } from "../data/slides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Web Experience",
  description: "Self-paced mode for New Era Presentation.",
};

type Props = {
  searchParams: Promise<{ slide?: string | string[] }>;
};

export default async function WebPage({ searchParams }: Props) {
  const { slide } = await searchParams;
  return <PresentationGate><DeckExperience mode="web" initialSlide={parseSlide(slide)} /></PresentationGate>;
}

function parseSlide(value: string | string[] | undefined) {
  const raw = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(slides.length - 1, Math.max(0, Math.trunc(raw) - 1));
}
