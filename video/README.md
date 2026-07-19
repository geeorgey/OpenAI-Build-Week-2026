# OpenAI Build Week Demo Video

This folder contains the English-language submission video for New Era
Presentation.

## Final deliverable

- Runtime: `02:40.13` (`160.13` seconds)
- Format: H.264 video, AAC stereo audio
- Resolution: `1920 × 1080`
- Frame rate: `30 fps`
- Narration: OpenAI `gpt-4o-mini-tts`, `cedar` voice
- Captions: English, burned into the video
- Music: none
- Final file: `output/new-era-presentation-build-week-final.mp4`

The runtime stays below the OpenAI Build Week limit of three minutes. The video
reveals that this is not a deck hosted on Sites: it is one live Sites product
whose presenter, participant, web, My Page, and admin experiences share state.
It also explains how Codex, GPT-5.6, ChatGPT Sites, D1 persistence, and the
Cloudflare email extension were used.

## Story

The demo begins with AI presentation fatigue, then shows the alternative:

1. Establish the problem: AI made slides cheap, but not attention.
2. Reframe the medium around shared time between a presenter and an audience.
3. Join from one QR code and participate with guest or verified identity.
4. Send slide-linked comments, stamps, and votes from `/join`.
5. Let the room choose the next branch and keep the conversation synchronized.
6. Reveal the product: one Sites project, five experiences, one shared state.
7. Follow one action through D1 to PRESENT, MY PAGE, and ADMIN.
8. Turn remembered participation into consented, relevant follow-up.
9. Show the end-to-end build with Codex, GPT-5.6, GPT Image 2, ChatGPT Sites,
   and the Cloudflare email extension.

The narration source and complete storyboard are in
[`script.md`](./script.md).

## Generate narration

The project-level `.env` file must contain `OPENAI_API_KEY`.

```bash
node --env-file=../.env scripts/generate-tts.mjs
node scripts/build-captions.mjs
```

The key is used only for production of the submission asset. It is never exposed
to the website or committed to the repository.

## Preview and render

```bash
npm install
npm run start
npm run render
```

The render command creates the unnormalized master. The submitted file is the
audio-normalized `-final.mp4` version listed above.

## Verification

The finished file was verified at `160.133` seconds, `1920 × 1080`, `30 fps`,
H.264/AAC, 48 kHz stereo, and approximately `-16.3 LUFS`. The final narration
was transcribed again with `gpt-4o-mini-transcribe` to confirm that the spoken
output matches the English script.

The final public YouTube demo is:
https://www.youtube.com/watch?v=oDUv_vl-CeQ
