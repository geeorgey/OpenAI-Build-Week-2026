import {readFile, writeFile} from "node:fs/promises";
import {basename, resolve} from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  throw new Error(
    "Usage: node --env-file=.env video/scripts/transcribe-final.mjs <audio-file> [output-file]",
  );
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set.");
}

const absoluteInputPath = resolve(inputPath);
const audio = await readFile(absoluteInputPath);
const form = new FormData();

form.append("model", "gpt-4o-mini-transcribe");
form.append("language", "en");
form.append(
  "file",
  new Blob([audio], {type: "audio/mpeg"}),
  basename(absoluteInputPath),
);

const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: form,
});

if (!response.ok) {
  throw new Error(
    `Transcription failed (${response.status}): ${await response.text()}`,
  );
}

const result = await response.json();
const transcript = `${result.text.trim()}\n`;

if (outputPath) {
  await writeFile(resolve(outputPath), transcript, "utf8");
}

process.stdout.write(transcript);
