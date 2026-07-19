import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("build emits the deployable Sites worker", async () => {
  await access(new URL("dist/server/index.js", root));
  await access(new URL("dist/.openai/hosting.json", root));
});

test("the deck carries the Build Week story and dual-mode interaction", async () => {
  const [slides, deck, join, branchApi, branching, home, web, layout, styles, migration] = await Promise.all([
    readFile(new URL("app/data/slides.ts", root), "utf8"),
    readFile(new URL("app/components/DeckExperience.tsx", root), "utf8"),
    readFile(new URL("app/components/JoinExperience.tsx", root), "utf8"),
    readFile(new URL("app/api/branch-votes/route.ts", root), "utf8"),
    readFile(new URL("lib/branching.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/web/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("drizzle/0002_curved_mentallo.sql", root), "utf8"),
  ]);
  assert.match(slides, /THE AI PRESENTATION FATIGUE/);
  assert.match(slides, /プレゼンテーションは、\\n新時代へ。\\n観るものから、\\n参加するものへ。/);
  assert.match(slides, /QRから参加し、リアクションと対話がスライドに同期する。/);
  assert.match(slides, /CODEX × GPT IMAGE 2/);
  assert.match(slides, /FROM A PRESENTATION TO A RELATIONSHIP/);
  assert.match(deck, /mode="present"|mode: Mode/);
  assert.match(deck, /initialSlide/);
  assert.match(deck, /\/api\/comments/);
  assert.match(deck, /slideId/);
  assert.match(slides, /THE ROOM CHOOSES THE NEXT PATH/);
  assert.match(deck, /<InteractionRail[\s\S]*readOnly=\{mode === "present"\}/);
  assert.match(deck, /\{!readOnly && \(\s*<>[\s\S]*className="rail-actions"[\s\S]*className="stamp-row"[\s\S]*className=\{`composer/);
  assert.match(deck, /\/web\?slide=/);
  assert.match(deck, /BRANCH_REJOIN_SLIDE_ID/);
  assert.match(deck, /resolveBranchWinner/);
  assert.match(home, /showGoogleBranding/);
  assert.doesNotMatch(web, /showGoogleBranding/);
  assert.match(deck, /showGoogleBranding && activeSlide === 0/);
  assert.match(deck, /New Era Presentation is a participatory presentation medium where audiences join by QR code to react,/);
  assert.match(deck, /titleMotionVariants = \["drop", "mosaic", "slice", "rise", "focus", "scatter"\]/);
  assert.match(deck, /data-title-motion=\{variant\}/);
  assert.match(deck, /swipeStartRef = useRef/);
  assert.match(deck, /Math\.abs\(deltaX\) >= 48/);
  assert.match(deck, /Math\.abs\(deltaX\) > Math\.abs\(deltaY\) \* 1\.25/);
  assert.match(deck, /onTouchStart=\{onStageTouchStart\}/);
  assert.match(deck, /onTouchEnd=\{onStageTouchEnd\}/);
  assert.match(deck, /deltaX < 0[\s\S]*void advance\(\)[\s\S]*goBack\(\)/);
  assert.match(deck, /className="mobile-chat-trigger"/);
  assert.match(deck, /aria-expanded=\{composerOpen\}/);
  assert.match(deck, /className=\{`composer \$\{composerOpen \? "is-mobile-open" : ""\}`\}/);
  assert.match(deck, /setComposerOpenSlide\(null\)/);
  assert.match(styles, /\.composer\.is-mobile-open/);
  assert.match(styles, /\.theme-choice \.slide-content[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.branch-options[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@keyframes titleDrop/);
  assert.match(styles, /@keyframes titleMosaic/);
  assert.match(styles, /@keyframes titleSlice/);
  assert.match(styles, /@keyframes titleRise/);
  assert.match(styles, /@keyframes titleFocus/);
  assert.match(styles, /@keyframes titleScatter/);
  assert.match(join, /\/api\/branch-votes/);
  assert.match(join, /CHOOSE THE NEXT PATH/);
  assert.match(branchApi, /ON CONFLICT\(presentation_slug, slide_id, visitor_id\)/);
  assert.match(branching, /count > highestCount/);
  assert.match(migration, /CREATE TABLE `branch_votes`/);
  assert.match(layout, /New Era Presentation/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.match(styles, /\.join-qr svg[\s\S]*width:\s*100%[\s\S]*height:\s*100%/);
  assert.match(styles, /\.interaction-rail\.is-read-only[\s\S]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/);
  assert.match(styles, /touch-action:\s*pan-y/);
  assert.match(styles, /overscroll-behavior-x:\s*contain/);
  assert.doesNotMatch(styles, /\.deck-shell\.is-present-mode/);
});

test("authentication, admin boundaries, and Cloudflare email are wired", async () => {
  const [admin, adminAuth, auth, google, emailWorker, hosting, migration, readme] = await Promise.all([
    readFile(new URL("app/admin/page.tsx", root), "utf8"),
    readFile(new URL("app/api/auth/admin/login/route.ts", root), "utf8"),
    readFile(new URL("lib/auth.ts", root), "utf8"),
    readFile(new URL("app/auth/google/callback/route.ts", root), "utf8"),
    readFile(new URL("cloudflare-email-worker/src/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("drizzle/0000_married_bloodaxe.sql", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
  ]);
  assert.match(admin, /ID \+ PASSWORD/);
  assert.match(adminAuth, /ADMIN_PASSWORD/);
  assert.match(auth, /testing@devpost\.com/);
  assert.match(auth, /build-week-event@openai\.com/);
  assert.match(auth, /identity\.provider === "admin"/);
  assert.match(auth, /ADMIN_SESSION_TTL/);
  assert.match(google, /email_verified/);
  assert.match(google, /location: "\/mypage"/);
  assert.match(emailWorker, /newEraPresentation@lvnsk\.jp/);
  assert.match(emailWorker, /List-Unsubscribe/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(migration, /CREATE TABLE `comments`/);
  assert.doesNotMatch(readme, /Shared password:/);
});
