import {Audio} from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {EnglishCaptions} from "./EnglishCaptions";
import {palette, scenes} from "./config";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SceneFrame = ({
  children,
  durationInFrames,
  accent,
  section,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  accent: string;
  section: string;
}) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 10], [0, 1], clamp),
    interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp),
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: palette.black,
        boxShadow: `inset 0 3px 0 ${accent}`,
        opacity,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          zIndex: 70,
          top: 29,
          left: 660,
          width: 600,
          color: "rgba(255,255,255,.58)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textAlign: "center",
        }}
      >
        OPENAI BUILD WEEK 2026 · <span style={{color: accent}}>{section}</span>
      </div>
    </AbsoluteFill>
  );
};

const Screen = ({
  src,
  frame,
  durationInFrames,
  zoom = 1,
  x = 0,
  origin = "center center",
}: {
  src: string;
  frame: number;
  durationInFrames: number;
  zoom?: number;
  x?: number;
  origin?: string;
}) => {
  const drift = interpolate(frame, [0, durationInFrames], [0, 18], clamp);
  return (
    <Img
      src={staticFile(`screens/${src}`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `translateX(${x}px) scale(${zoom + drift / 1000})`,
        transformOrigin: origin,
      }}
    />
  );
};

const CrossfadeScreens = ({
  first,
  second,
  changeAt,
  durationInFrames,
  zoom = 1,
}: {
  first: string;
  second: string;
  changeAt: number;
  durationInFrames: number;
  zoom?: number;
}) => {
  const frame = useCurrentFrame();
  const secondOpacity = interpolate(frame, [changeAt - 12, changeAt + 12], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill>
      <Screen src={first} frame={frame} durationInFrames={durationInFrames} zoom={zoom} />
      <AbsoluteFill style={{opacity: secondOpacity}}>
        <Screen src={second} frame={frame} durationInFrames={durationInFrames} zoom={zoom} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type CommentSpec = {
  name: string;
  text: string;
  start: number;
  verified?: boolean;
  accent: string;
};

const CommentCard = ({
  spec,
  index,
  frame,
}: {
  spec: CommentSpec;
  index: number;
  frame: number;
}) => {
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - spec.start,
    fps,
    config: {damping: 20, stiffness: 180},
    durationInFrames: 24,
  });
  const opacity = interpolate(frame, [spec.start, spec.start + 8], [0, 1], clamp);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        gap: 10,
        padding: "12px 12px 13px",
        color: "#17191d",
        border: "1px solid rgba(0,0,0,.13)",
        background: "#fff",
        boxShadow: "0 10px 24px rgba(0,0,0,.08)",
        opacity,
        transform: `translateX(${(1 - entrance) * 46}px)`,
      }}
    >
      <div
        style={{
          display: "grid",
          width: 34,
          height: 34,
          placeItems: "center",
          color: palette.black,
          borderRadius: "50%",
          background: spec.accent,
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {spec.name.slice(0, 1)}
      </div>
      <div>
        <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900}}>
          {spec.name}
          {spec.verified ? (
            <span style={{color: "#218b54", fontSize: 8, letterSpacing: ".08em"}}>VERIFIED</span>
          ) : null}
        </div>
        <div style={{marginTop: 6, fontSize: 12, lineHeight: 1.35}}>{spec.text}</div>
        <div
          style={{
            marginTop: 7,
            color: "rgba(0,0,0,.42)",
            fontFamily: "monospace",
            fontSize: 8,
            letterSpacing: ".1em",
          }}
        >
          SLIDE {String(index + 5).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
};

const RailOverlay = ({
  frame,
  slideLabel,
  comments = [],
  activeColor,
}: {
  frame: number;
  slideLabel: string;
  comments?: CommentSpec[];
  activeColor: string;
}) => (
  <div
    style={{
      position: "absolute",
      zIndex: 35,
      top: 208,
      right: 0,
      bottom: 0,
      width: 320,
      overflow: "hidden",
      borderLeft: "1px solid rgba(0,0,0,.18)",
      background: palette.paper,
      fontFamily: "Arial, Helvetica, sans-serif",
    }}
  >
    <div
      style={{
        height: 130,
        padding: "22px 18px",
        color: palette.white,
        background: palette.panel,
      }}
    >
      <div style={{color: "rgba(255,255,255,.52)", fontFamily: "monospace", fontSize: 9, letterSpacing: ".12em"}}>
        ACTIVE SLIDE
      </div>
      <div style={{marginTop: 12, fontSize: 15, fontWeight: 900}}>{slideLabel}</div>
      <div style={{marginTop: 12, height: 2, background: "rgba(255,255,255,.12)"}}>
        <div
          style={{
            width: `${interpolate(frame, [0, 160], [10, 100], clamp)}%`,
            height: "100%",
            background: activeColor,
          }}
        />
      </div>
    </div>
    <div style={{display: "grid", gap: 10, padding: 14}}>
      {comments.length ? (
        comments.map((comment, index) => (
          <CommentCard key={`${comment.name}-${index}`} spec={comment} index={index} frame={frame} />
        ))
      ) : (
        <div
          style={{
            display: "grid",
            minHeight: 250,
            placeItems: "center",
            color: "rgba(0,0,0,.38)",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "grid",
                width: 54,
                height: 54,
                margin: "0 auto 14px",
                placeItems: "center",
                border: "1px dashed rgba(0,0,0,.28)",
                borderRadius: "50%",
                fontSize: 25,
              }}
            >
              +
            </div>
            <div style={{fontSize: 11}}>Waiting for the room to respond.</div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const StampBurst = ({
  symbol,
  start,
  x,
  y,
  size,
  frame,
}: {
  symbol: string;
  start: number;
  x: number;
  y: number;
  size: number;
  frame: number;
}) => {
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - start,
    fps,
    durationInFrames: 24,
    config: {damping: 13, stiffness: 190},
  });
  const opacity = Math.min(
    interpolate(frame, [start, start + 7], [0, 1], clamp),
    interpolate(frame, [start + 70, start + 100], [1, 0], clamp),
  );
  const drift = interpolate(frame, [start, start + 100], [0, -130], clamp);
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 45,
        left: x,
        top: y + drift,
        fontSize: size,
        opacity,
        transform: `scale(${entrance}) rotate(${(1 - entrance) * -18}deg)`,
        filter: "drop-shadow(0 12px 24px rgba(0,0,0,.35))",
      }}
    >
      {symbol}
    </div>
  );
};

const PhoneJoin = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame: frame - 28, fps, config: {damping: 18, stiffness: 150}, durationInFrames: 32});
  const scanY = interpolate(frame % 90, [0, 90], [132, 292]);
  const methods = [
    ["G", "Guest access", "INSTANT"],
    ["@", "Email verified", "VERIFIED"],
    ["●", "Google verified", "VERIFIED"],
    ["◉", "ChatGPT verified", "VERIFIED"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 48,
        top: 124,
        right: 360,
        width: 410,
        height: 760,
        overflow: "hidden",
        color: palette.white,
        border: "5px solid #2a2d33",
        borderRadius: 46,
        background: "#101217",
        boxShadow: "0 42px 100px rgba(0,0,0,.48)",
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 90}px) rotate(${(1 - entrance) * 4}deg)`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{height: 34, background: "#090a0d"}} />
      <div style={{padding: "28px 24px"}}>
        <div style={{color: palette.yellow, fontFamily: "monospace", fontSize: 11, letterSpacing: ".16em"}}>LIVE / JOIN</div>
        <div style={{marginTop: 12, fontSize: 34, fontWeight: 900, letterSpacing: "-.04em"}}>Join the room.</div>
        <div style={{marginTop: 8, color: "rgba(255,255,255,.58)", fontSize: 14}}>Choose your path into the live conversation.</div>
        <div
          style={{
            position: "relative",
            height: 170,
            marginTop: 24,
            overflow: "hidden",
            border: "1px solid rgba(255,216,74,.26)",
            background:
              "linear-gradient(90deg, rgba(255,216,74,.08) 1px, transparent 1px), linear-gradient(rgba(255,216,74,.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div style={{position: "absolute", top: scanY - 132, right: 0, left: 0, height: 2, background: palette.yellow, boxShadow: `0 0 24px ${palette.yellow}`}} />
          <div style={{display: "grid", height: "100%", placeItems: "center", fontFamily: "monospace", fontSize: 13, letterSpacing: ".15em"}}>
            QR CONNECTED
          </div>
        </div>
        <div style={{display: "grid", gap: 9, marginTop: 18}}>
          {methods.map(([icon, label, status], index) => {
            const row = spring({frame: frame - (64 + index * 10), fps, config: {damping: 200}, durationInFrames: 20});
            return (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr auto",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 13px",
                  color: "#15171b",
                  background: palette.paper,
                  opacity: row,
                  transform: `translateX(${(1 - row) * 30}px)`,
                }}
              >
                <div style={{display: "grid", width: 30, height: 30, placeItems: "center", border: "1px solid rgba(0,0,0,.15)", borderRadius: "50%", fontWeight: 900}}>
                  {icon}
                </div>
                <div style={{fontSize: 13, fontWeight: 900}}>{label}</div>
                <div style={{color: status === "VERIFIED" ? "#218b54" : "#6c706d", fontFamily: "monospace", fontSize: 8}}>{status}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const VotePanel = () => {
  const frame = useCurrentFrame();
  const choices = [
    {id: "A", label: "Live operations", final: 7},
    {id: "B", label: "Personal memory", final: 12},
    {id: "C", label: "Relationship marketing", final: 28},
    {id: "D", label: "Codex + Sites build", final: 9},
  ];
  const total = choices.reduce((sum, choice) => sum + choice.final, 0);
  const showWinner = frame > 330;
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 46,
        top: 210,
        right: 372,
        width: 590,
        padding: 18,
        color: palette.white,
        border: "1px solid rgba(255,216,74,.42)",
        background: "rgba(6,7,10,.93)",
        boxShadow: "0 28px 80px rgba(0,0,0,.45)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span style={{color: palette.yellow, fontFamily: "monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".14em"}}>LIVE VOTE</span>
        <span style={{color: "rgba(255,255,255,.55)", fontFamily: "monospace", fontSize: 10}}>
          {Math.round(interpolate(frame, [45, 320], [0, total], clamp))} votes
        </span>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16}}>
        {choices.map((choice, index) => {
          const count = Math.round(interpolate(frame, [55 + index * 24, 300 + index * 8], [0, choice.final], clamp));
          const selected = choice.id === "C" && showWinner;
          return (
            <div
              key={choice.id}
              style={{
                padding: 14,
                color: selected ? palette.black : palette.white,
                border: `1px solid ${selected ? palette.yellow : "rgba(255,255,255,.18)"}`,
                background: selected ? palette.yellow : "rgba(255,255,255,.05)",
              }}
            >
              <div style={{display: "flex", alignItems: "center", gap: 11}}>
                <div
                  style={{
                    display: "grid",
                    width: 34,
                    height: 34,
                    placeItems: "center",
                    color: selected ? palette.yellow : palette.black,
                    borderRadius: "50%",
                    background: selected ? palette.black : palette.yellow,
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {choice.id}
                </div>
                <div style={{fontSize: 13, fontWeight: 900}}>{choice.label}</div>
                <div style={{marginLeft: "auto", fontFamily: "monospace", fontSize: 16, fontWeight: 900}}>{count}</div>
              </div>
              <div style={{height: 4, marginTop: 12, background: selected ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.12)"}}>
                <div
                  style={{
                    width: `${(count / Math.max(choice.final, 1)) * 100}%`,
                    height: "100%",
                    background: selected ? palette.black : palette.yellow,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{minHeight: 26, marginTop: 12, color: showWinner ? palette.yellow : "rgba(255,255,255,.48)", fontSize: 11, fontWeight: 800}}>
        {showWinner ? "THE ROOM CHOSE C · RELATIONSHIP MARKETING →" : "The next slide follows the room’s top vote."}
      </div>
    </div>
  );
};

const WebChoicePreview = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame: frame - 360, fps, config: {damping: 200}, durationInFrames: 22});
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 47,
        left: 58,
        bottom: 118,
        width: 560,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.28)",
        background: palette.black,
        boxShadow: "0 24px 70px rgba(0,0,0,.4)",
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px)`,
      }}
    >
      <div style={{display: "flex", justifyContent: "space-between", padding: "10px 13px", color: palette.white, background: "#181a1f", fontFamily: "monospace", fontSize: 10}}>
        <span>WEB MODE</span>
        <span style={{color: palette.yellow}}>CLICK TO CHOOSE</span>
      </div>
      <Img src={staticFile("screens/slide-07-web.png")} style={{display: "block", width: "100%"}} />
    </div>
  );
};

const MemorySignals = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [
    {stamp: "🔥", title: "Slide 05 · Resonated", note: "Audience as part of the story", start: 40},
    {stamp: "💡", title: "Slide 08 · Insight", note: "Relationship marketing", start: 75},
    {stamp: "❓", title: "Slide 12 · Question", note: "How the Sites build works", start: 110},
  ];
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 46,
        top: 215,
        right: 372,
        width: 510,
        padding: 18,
        color: "#15171b",
        border: "1px solid rgba(0,0,0,.16)",
        background: palette.paper,
        boxShadow: "0 28px 80px rgba(0,0,0,.38)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{fontFamily: "monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".12em"}}>MY PAGE / SAVED MOMENTS</div>
      <div style={{display: "grid", gap: 9, marginTop: 15}}>
        {items.map((item) => {
          const entrance = spring({frame: frame - item.start, fps, config: {damping: 200}, durationInFrames: 18});
          return (
            <div
              key={item.title}
              style={{
                display: "grid",
                gridTemplateColumns: "38px 1fr",
                gap: 12,
                padding: 12,
                border: "1px solid rgba(0,0,0,.12)",
                background: "#fff",
                opacity: entrance,
                transform: `translateX(${(1 - entrance) * 28}px)`,
              }}
            >
              <div style={{display: "grid", width: 38, height: 38, placeItems: "center", borderRadius: "50%", background: "#f4f0e8", fontSize: 20}}>{item.stamp}</div>
              <div>
                <div style={{fontSize: 12, fontWeight: 900}}>{item.title}</div>
                <div style={{marginTop: 5, color: "rgba(0,0,0,.52)", fontSize: 11}}>{item.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BuildPipeline = () => {
  const frame = useCurrentFrame();
  const steps = ["CONCEPT", "UI + MOTION", "ROUTES + D1", "AUTH", "DEPLOY"];
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 47,
        right: 372,
        bottom: 112,
        left: 70,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        padding: 12,
        border: "1px solid rgba(201,255,61,.24)",
        background: "rgba(5,7,8,.9)",
        boxShadow: "0 22px 70px rgba(0,0,0,.34)",
      }}
    >
      {steps.map((step, index) => {
        const active = frame >= 100 + index * 115;
        const progress = interpolate(frame, [80 + index * 115, 125 + index * 115], [0, 1], clamp);
        return (
          <div
            key={step}
            style={{
              position: "relative",
              padding: "15px 14px",
              color: active ? palette.black : "rgba(255,255,255,.5)",
              border: "1px solid rgba(255,255,255,.12)",
              background: active ? palette.lime : "rgba(255,255,255,.04)",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: ".08em",
              transform: `translateY(${(1 - progress) * 12}px)`,
            }}
          >
            <span style={{opacity: active ? 0.55 : 0.35}}>0{index + 1}</span>
            <div style={{marginTop: 7}}>{step}</div>
          </div>
        );
      })}
    </div>
  );
};

const HookScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[0].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.lime} section="THE IDEA">
      <CrossfadeScreens
        first="slide-00-manifesto.png"
        second="slide-01-fatigue.png"
        changeAt={245}
        durationInFrames={duration}
      />
      <RailOverlay frame={frame} slideLabel={frame < 245 ? "01 · THE IDEA" : "02 · THE PROBLEM"} activeColor={frame < 245 ? palette.lime : palette.orange} />
    </SceneFrame>
  );
};

const IdeaScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[1].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.cyan} section="THE ANTITHESIS">
      <Screen src="slide-02-shared.png" frame={frame} durationInFrames={duration} />
      <RailOverlay frame={frame} slideLabel="03 · THE IDEA" activeColor={palette.cyan} />
    </SceneFrame>
  );
};

const JoinScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[2].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.yellow} section="LIVE / JOIN">
      <Screen src="slide-03-join.png" frame={frame} durationInFrames={duration} />
      <RailOverlay frame={frame} slideLabel="04 · THE EXPERIENCE" activeColor={palette.yellow} />
      <PhoneJoin />
    </SceneFrame>
  );
};

const ReactScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[3].durationInFrames;
  const changed = frame > 405;
  const comments: CommentSpec[] = changed
    ? [
        {name: "Sofia", text: "The conversation moved with the slide.", start: 420, verified: true, accent: palette.cyan},
        {name: "Leo", text: "Now the context stays readable.", start: 505, verified: true, accent: palette.orange},
      ]
    : [
        {name: "Maya", text: "The audience is part of the story.", start: 65, verified: true, accent: palette.magenta},
        {name: "Ken", text: "Can discussion follow each slide?", start: 155, accent: palette.yellow},
        {name: "Sofia", text: "This feels genuinely live.", start: 245, verified: true, accent: palette.cyan},
        {name: "Leo", text: "I want to remember this moment.", start: 330, verified: true, accent: palette.orange},
      ];
  const bursts = [
    {symbol: "🔥", start: 90, x: 990, y: 560, size: 64},
    {symbol: "💡", start: 170, x: 1210, y: 430, size: 62},
    {symbol: "👏", start: 255, x: 780, y: 510, size: 68},
    {symbol: "❓", start: 335, x: 1120, y: 650, size: 66},
    {symbol: "🔥", start: 465, x: 900, y: 540, size: 58},
    {symbol: "👏", start: 545, x: 1240, y: 500, size: 64},
  ];
  return (
    <SceneFrame durationInFrames={duration} accent={palette.magenta} section="REAL-TIME RESPONSE">
      <CrossfadeScreens
        first="slide-04-interaction.png"
        second="slide-05-context.png"
        changeAt={405}
        durationInFrames={duration}
      />
      <RailOverlay
        frame={frame}
        slideLabel={changed ? "06 · THE EXPERIENCE" : "05 · THE EXPERIENCE"}
        comments={comments}
        activeColor={changed ? palette.cyan : palette.magenta}
      />
      {bursts.map((burst, index) => <StampBurst key={`${burst.symbol}-${index}`} {...burst} frame={frame} />)}
      {changed ? (
        <div
          style={{
            position: "absolute",
            zIndex: 46,
            top: 122,
            left: 650,
            padding: "12px 18px",
            color: palette.black,
            background: palette.cyan,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".1em",
          }}
        >
          SLIDE CHANGED → CONVERSATION FOLLOWED
        </div>
      ) : null}
    </SceneFrame>
  );
};

const BranchScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[4].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.yellow} section="THE ROOM CHOOSES">
      <Screen src="slide-07-branch.png" frame={frame} durationInFrames={duration} />
      <RailOverlay frame={frame} slideLabel="08 · THE PARTICIPATION" activeColor={palette.yellow} />
      <VotePanel />
      <WebChoicePreview />
    </SceneFrame>
  );
};

const RememberScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[5].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.orange} section="FROM MEMORY TO RELATIONSHIP">
      <CrossfadeScreens
        first="slide-08-memory.png"
        second="slide-10-marketing.png"
        changeAt={350}
        durationInFrames={duration}
      />
      <RailOverlay frame={frame} slideLabel={frame < 350 ? "09 · THE PRODUCT" : "11 · THE PRODUCT"} activeColor={palette.orange} />
      {frame < 390 ? <MemorySignals /> : (
        <div
          style={{
            position: "absolute",
            zIndex: 47,
            top: 235,
            right: 372,
            width: 520,
            padding: 22,
            color: palette.white,
            border: "1px solid rgba(255,138,98,.42)",
            background: "rgba(9,8,8,.92)",
            boxShadow: "0 28px 80px rgba(0,0,0,.4)",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div style={{color: palette.orange, fontFamily: "monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".12em"}}>CONSENTED INTEREST SIGNALS</div>
          <div style={{marginTop: 15, fontSize: 26, fontWeight: 900, letterSpacing: "-.04em"}}>Presentation → Segment → Follow-up</div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18}}>
            {["LIVE EXPERIENCE", "MEMORY", "RELATIONSHIP", "BUILD"].map((label, index) => (
              <span key={label} style={{padding: "9px 11px", color: index === 2 ? palette.black : palette.white, border: "1px solid rgba(255,255,255,.18)", background: index === 2 ? palette.orange : "rgba(255,255,255,.05)", fontSize: 10, fontWeight: 900}}>
                {label}
              </span>
            ))}
          </div>
          <div style={{marginTop: 18, padding: 14, color: "#17191d", background: palette.paper, fontSize: 12, lineHeight: 1.45}}>
            “You reacted to the relationship loop. Here is the branch you did not see live.”
          </div>
        </div>
      )}
    </SceneFrame>
  );
};

const BuildScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[6].durationInFrames;
  const secondOpacity = interpolate(frame, [345, 370], [0, 1], clamp);
  const thirdOpacity = interpolate(frame, [700, 725], [0, 1], clamp);
  return (
    <SceneFrame durationInFrames={duration} accent={palette.lime} section="THE BUILD">
      <Screen src="slide-11-build.png" frame={frame} durationInFrames={duration} />
      <AbsoluteFill style={{opacity: secondOpacity}}>
        <Screen src="slide-13-cloudflare.png" frame={frame} durationInFrames={duration} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: thirdOpacity}}>
        <Screen src="slide-15-buildweek.png" frame={frame} durationInFrames={duration} />
      </AbsoluteFill>
      <RailOverlay
        frame={frame}
        slideLabel={frame < 355 ? "12 · THE BUILD" : frame < 710 ? "14 · THE BUILD" : "16 · THE ENTRY"}
        activeColor={frame < 355 ? palette.lime : frame < 710 ? palette.orange : palette.magenta}
      />
      <BuildPipeline />
      <div
        style={{
          position: "absolute",
          zIndex: 47,
          top: 98,
          left: 70,
          display: "flex",
          gap: 8,
          color: palette.white,
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 900,
        }}
      >
        {["CODEX", "GPT-5.6", "CHATGPT SITES"].map((label, index) => (
          <span key={label} style={{padding: "9px 12px", color: index === 1 ? palette.black : palette.white, border: "1px solid rgba(255,255,255,.18)", background: index === 1 ? palette.lime : "rgba(6,7,10,.72)"}}>
            {label}
          </span>
        ))}
      </div>
    </SceneFrame>
  );
};

const CloseScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[7].durationInFrames;
  const words = ["SCAN", "JOIN", "REACT", "REMEMBER", "RELATE"];
  return (
    <SceneFrame durationInFrames={duration} accent={palette.yellow} section="THE ASK">
      <Screen
        src="slide-17-finale.png"
        frame={frame}
        durationInFrames={duration}
        zoom={1.22}
        origin="left center"
      />
      <div
        style={{
          position: "absolute",
          zIndex: 48,
          right: 80,
          bottom: 170,
          display: "flex",
          gap: 8,
        }}
      >
        {words.map((word, index) => {
          const entrance = interpolate(frame, [75 + index * 18, 95 + index * 18], [0, 1], clamp);
          return (
            <div
              key={word}
              style={{
                padding: "12px 14px",
                color: index === words.length - 1 ? palette.black : palette.white,
                border: "1px solid rgba(255,255,255,.18)",
                background: index === words.length - 1 ? palette.yellow : "rgba(6,7,10,.78)",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 900,
                opacity: entrance,
                transform: `translateY(${(1 - entrance) * 18}px)`,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          zIndex: 48,
          right: 80,
          bottom: 105,
          color: palette.white,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        new-era-presentation.lvnsk.jp
      </div>
      <div
        style={{
          position: "absolute",
          zIndex: 48,
          right: 80,
          bottom: 75,
          color: "rgba(255,255,255,.45)",
          fontFamily: "monospace",
          fontSize: 9,
          letterSpacing: ".08em",
        }}
      >
        NARRATION GENERATED WITH OPENAI TEXT TO SPEECH
      </div>
    </SceneFrame>
  );
};

const sceneComponents = [
  HookScene,
  IdeaScene,
  JoinScene,
  ReactScene,
  BranchScene,
  RememberScene,
  BuildScene,
  CloseScene,
] as const;

export const NewEraBuildWeek = () => (
  <AbsoluteFill style={{background: palette.black}}>
    <Series>
      {scenes.map((scene, index) => {
        const SceneComponent = sceneComponents[index];
        return (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
            premountFor={30}
          >
            <SceneComponent />
            <Sequence from={14} premountFor={30}>
              <Audio src={staticFile(scene.audio)} />
            </Sequence>
          </Series.Sequence>
        );
      })}
    </Series>
    <EnglishCaptions />
  </AbsoluteFill>
);
