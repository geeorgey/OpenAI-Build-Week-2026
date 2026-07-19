import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const narration = JSON.parse(await readFile(path.join(root, "narration.json"), "utf8"));
const timeline = JSON.parse(await readFile(path.join(root, "timeline.json"), "utf8"));

const splitLongText = (text, maxLength = 76) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks = [];

  for (const sentence of sentences.map((value) => value.trim())) {
    if (sentence.length <= maxLength) {
      chunks.push(sentence);
      continue;
    }

    const clauses = sentence.split(/(?<=[,;:])\s+/);
    let current = "";
    for (const clause of clauses) {
      if (`${current} ${clause}`.trim().length <= maxLength) {
        current = `${current} ${clause}`.trim();
      } else {
        if (current) chunks.push(current);
        current = clause;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks;
};

let sceneStartMs = 0;
const captions = [];

for (const scene of timeline) {
  const segment = narration.find((item) => item.id === scene.id);
  if (!segment) throw new Error(`Missing narration segment: ${scene.id}`);

  const chunks = splitLongText(segment.text);
  const audioStartMs = sceneStartMs + 450;
  const totalWeight = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  let cursorMs = audioStartMs;

  for (const chunk of chunks) {
    const durationMs = (scene.audioDuration * 1000 * chunk.length) / totalWeight;
    const endMs = cursorMs + durationMs;
    captions.push({
      text: chunk,
      startMs: Math.round(cursorMs),
      endMs: Math.round(endMs),
      timestampMs: Math.round(cursorMs),
      confidence: 1,
    });
    cursorMs = endMs;
  }

  sceneStartMs += scene.duration * 1000;
}

await writeFile(path.join(root, "public/captions.json"), `${JSON.stringify(captions, null, 2)}\n`);
console.log(`Wrote ${captions.length} English caption cues.`);
