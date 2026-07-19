import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const narrationPath = path.join(root, "video/narration.json");
const outputDir = path.join(root, "video/public/audio");
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not available.");
}

const segments = JSON.parse(await readFile(narrationPath, "utf8"));
await mkdir(outputDir, {recursive: true});

for (const [index, segment] of segments.entries()) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "cedar",
      response_format: "mp3",
      speed: 1.03,
      instructions:
        "Speak as a confident, warm product storyteller in natural global English. Keep a crisp medium-fast pace, articulate technical names clearly, and use brief pauses after short sentences. Avoid theatrical exaggeration.",
      input: segment.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`TTS request failed for ${segment.id}: ${response.status} ${message}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  const filename = `${segment.id}.mp3`;
  await writeFile(path.join(outputDir, filename), audio);
  console.log(`[${index + 1}/${segments.length}] ${filename}`);
}
