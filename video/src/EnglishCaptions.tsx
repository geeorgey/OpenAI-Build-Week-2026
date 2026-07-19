import type {Caption} from "@remotion/captions";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import captionsJson from "../public/captions.json";
import {palette} from "./config";

const captions = captionsJson as Caption[];

export const EnglishCaptions = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const cue = captions.find((caption) => caption.startMs <= timeMs && caption.endMs > timeMs);

  if (!cue) return null;

  const fadeIn = interpolate(timeMs, [cue.startMs, cue.startMs + 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(timeMs, [cue.endMs - 180, cue.endMs], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 80,
        right: 360,
        bottom: 28,
        left: 44,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${(1 - fadeIn) * 8}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          padding: "13px 24px 14px",
          color: palette.white,
          border: "1px solid rgba(255,255,255,.18)",
          borderRadius: 8,
          background: "rgba(6,7,10,.86)",
          boxShadow: "0 12px 42px rgba(0,0,0,.35)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 29,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
