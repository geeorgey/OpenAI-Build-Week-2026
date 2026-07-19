export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const scenes = [
  {id: "01-hook", durationInFrames: 502, audio: "audio/01-hook.mp3"},
  {id: "02-idea", durationInFrames: 484, audio: "audio/02-idea.mp3"},
  {id: "03-join", durationInFrames: 462, audio: "audio/03-join.mp3"},
  {id: "04-react", durationInFrames: 771, audio: "audio/04-react.mp3"},
  {id: "05-branch", durationInFrames: 569, audio: "audio/05-branch.mp3"},
  {id: "06-remember", durationInFrames: 707, audio: "audio/06-remember.mp3"},
  {id: "07-build", durationInFrames: 1086, audio: "audio/07-build.mp3"},
  {id: "08-close", durationInFrames: 489, audio: "audio/08-close.mp3"},
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
