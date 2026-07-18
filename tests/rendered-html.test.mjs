import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("build emits the deployable Sites worker", async () => {
  await access(new URL("dist/server/index.js", root));
  await access(new URL("dist/.openai/hosting.json", root));
});

test("the deck carries the Build Week story and dual-mode interaction", async () => {
  const [slides, deck, layout] = await Promise.all([
    readFile(new URL("app/data/slides.ts", root), "utf8"),
    readFile(new URL("app/components/DeckExperience.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(slides, /THE AI PRESENTATION FATIGUE/);
  assert.match(slides, /CODEX × GPT IMAGE 2/);
  assert.match(slides, /FROM A PRESENTATION TO A RELATIONSHIP/);
  assert.match(deck, /mode="present"|mode: Mode/);
  assert.match(deck, /\/api\/comments/);
  assert.match(deck, /slideId/);
  assert.match(layout, /New Era Presentation/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
});

test("authentication, admin boundaries, and Cloudflare email are wired", async () => {
  const [admin, google, emailWorker, hosting, migration] = await Promise.all([
    readFile(new URL("app/admin/page.tsx", root), "utf8"),
    readFile(new URL("app/auth/google/callback/route.ts", root), "utf8"),
    readFile(new URL("cloudflare-email-worker/src/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("drizzle/0000_married_bloodaxe.sql", root), "utf8"),
  ]);
  assert.match(admin, /y@lne\.st/);
  assert.match(google, /email_verified/);
  assert.match(emailWorker, /newEraPresentation@lvnsk\.jp/);
  assert.match(emailWorker, /List-Unsubscribe/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(migration, /CREATE TABLE `comments`/);
});
