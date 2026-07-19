export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const scenes = [
  {id: "01-attention", durationInFrames: 633, audio: "audio/01-attention.mp3"},
  {id: "02-shared", durationInFrames: 446, audio: "audio/02-shared.mp3"},
  {id: "03-participate", durationInFrames: 607, audio: "audio/03-participate.mp3"},
  {id: "04-shape", durationInFrames: 418, audio: "audio/04-shape.mp3"},
  {id: "05-reveal", durationInFrames: 565, audio: "audio/05-reveal.mp3"},
  {id: "06-proof", durationInFrames: 549, audio: "audio/06-proof.mp3"},
  {id: "07-relationship", durationInFrames: 540, audio: "audio/07-relationship.mp3"},
  {id: "08-build", durationInFrames: 677, audio: "audio/08-build.mp3"},
  {id: "09-close", durationInFrames: 369, audio: "audio/09-close.mp3"},
] as const;

export const TOTAL_FRAMES = scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);

export const palette = {
  black: "#07080c",
  panel: "#14161b",
  paper: "#f2eee6",
  white: "#f8f7f2",
  muted: "#9a9d98",
  lime: "#c9ff3d",
  yellow: "#ffd84a",
  magenta: "#ff4db8",
  cyan: "#58e6df",
  orange: "#ff8a62",
};
