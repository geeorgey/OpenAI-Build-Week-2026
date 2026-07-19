# OpenAI Build Week Demo Video

This folder contains the English-language submission video for New Era
Presentation.

## Final deliverable

- Runtime: `02:49` (`169` seconds)
- Format: H.264 video, AAC stereo audio
- Resolution: `1920 × 1080`
- Frame rate: `30 fps`
- Narration: OpenAI `gpt-4o-mini-tts`, `cedar` voice
- Captions: English, burned into the video
- Music: none
- Final file: `output/new-era-presentation-build-week-final.mp4`

The runtime stays below the OpenAI Build Week limit of three minutes. The video
demonstrates the working product and explains how Codex, GPT-5.6, ChatGPT Sites,
D1 persistence, and the Cloudflare email extension were used.

## Story

The demo begins with AI presentation fatigue, then shows the alternative:

1. Join from one QR code.
2. Participate as a guest or with a verified identity.
3. Send slide-linked comments and stamps from `/join`.
4. Keep the conversation synchronized with the active slide.
5. Let a live audience choose the next branch.
6. Remember individual participation on My Page.
7. Turn consented interest signals into a relevant follow-up.
8. Show the end-to-end build with Codex, GPT-5.6, ChatGPT Sites, and Cloudflare.

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

The finished file was verified at `169.000` seconds, `1920 × 1080`, `30 fps`,
H.264/AAC, 48 kHz stereo. The final narration was transcribed again with
`gpt-4o-mini-transcribe` to confirm that the spoken output matches the English
script.

The remaining external submission step is to upload the final MP4 as a public
YouTube video and add its URL to the Devpost entry.
