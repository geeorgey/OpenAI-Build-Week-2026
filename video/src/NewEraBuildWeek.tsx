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
      src={staticFile(`screens-v2/${src}`)}
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

const SitesRevealBanner = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const surfaces = ["PRESENT", "WEB", "JOIN", "MY PAGE", "ADMIN"];

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 48,
        right: 370,
        bottom: 96,
        left: 54,
        display: "grid",
        gridTemplateColumns: "260px repeat(5, 1fr)",
        gap: 8,
        padding: 10,
        border: "1px solid rgba(201,255,61,.3)",
        background: "rgba(5,7,9,.92)",
        boxShadow: "0 24px 80px rgba(0,0,0,.42)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{padding: "14px 16px", color: palette.black, background: palette.lime}}>
        <div style={{fontFamily: "monospace", fontSize: 9, fontWeight: 900, letterSpacing: ".1em"}}>ONE SITES PROJECT</div>
        <div style={{marginTop: 7, fontSize: 18, fontWeight: 900}}>ONE SHARED STATE</div>
      </div>
      {surfaces.map((surface, index) => {
        const entrance = spring({
          frame: frame - (75 + index * 18),
          fps,
          config: {damping: 200},
          durationInFrames: 22,
        });
        return (
          <div
            key={surface}
            style={{
              display: "grid",
              placeItems: "center",
              padding: 12,
              color: palette.white,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(255,255,255,.05)",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 900,
              opacity: entrance,
              transform: `translateY(${(1 - entrance) * 18}px)`,
            }}
          >
            {surface}
          </div>
        );
      })}
    </div>
  );
};

const StateProofStrip = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const targets = [
    {label: "PRESENT · RESPOND NOW", src: "05-interaction.jpg", start: 160},
    {label: "MY PAGE · REMEMBER", src: "mypage-english.jpg", start: 235},
    {label: "ADMIN · UNDERSTAND", src: "admin-english.jpg", start: 310},
  ];
  const sourceEntrance = spring({frame: frame - 35, fps, config: {damping: 200}, durationInFrames: 22});
  const d1Entrance = spring({frame: frame - 105, fps, config: {damping: 16, stiffness: 170}, durationInFrames: 28});

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 48,
        right: 370,
        bottom: 88,
        left: 50,
        display: "grid",
        gridTemplateColumns: "330px 110px 145px 110px 1fr",
        alignItems: "center",
        gap: 0,
        minHeight: 228,
        padding: 18,
        border: "1px solid rgba(88,230,223,.34)",
        background: "rgba(4,8,11,.94)",
        boxShadow: "0 28px 90px rgba(0,0,0,.46)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{opacity: sourceEntrance, transform: `translateX(${(1 - sourceEntrance) * -32}px)`}}>
        <div style={{overflow: "hidden", height: 126, border: "1px solid rgba(255,255,255,.2)"}}>
          <Img
            src={staticFile("screens-v2/join-english.jpg")}
            style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%"}}
          />
        </div>
        <div style={{padding: "10px 12px", color: palette.black, background: palette.cyan, fontFamily: "monospace", fontSize: 10, fontWeight: 900}}>
          /JOIN · COMMENT ENTERS
        </div>
      </div>
      <div style={{height: 2, background: "rgba(88,230,223,.24)"}}>
        <div style={{width: `${interpolate(frame, [70, 125], [0, 100], clamp)}%`, height: "100%", background: palette.cyan}} />
      </div>
      <div
        style={{
          display: "grid",
          width: 112,
          height: 112,
          placeItems: "center",
          color: palette.black,
          borderRadius: "50%",
          background: palette.cyan,
          boxShadow: `0 0 70px rgba(88,230,223,${d1Entrance * .35})`,
          opacity: d1Entrance,
          transform: `scale(${d1Entrance})`,
        }}
      >
        <div style={{textAlign: "center"}}>
          <div style={{fontFamily: "monospace", fontSize: 8, fontWeight: 900}}>SITES</div>
          <div style={{fontSize: 29, fontWeight: 900}}>D1</div>
          <div style={{fontFamily: "monospace", fontSize: 7}}>SHARED STATE</div>
        </div>
      </div>
      <div style={{height: 2, background: "rgba(88,230,223,.24)"}}>
        <div style={{width: `${interpolate(frame, [125, 185], [0, 100], clamp)}%`, height: "100%", background: palette.cyan}} />
      </div>
      <div style={{display: "grid", gap: 7}}>
        {targets.map((target) => {
          const entrance = spring({frame: frame - target.start, fps, config: {damping: 200}, durationInFrames: 22});
          return (
            <div
              key={target.label}
              style={{
                display: "grid",
                gridTemplateColumns: "126px 1fr",
                alignItems: "center",
                gap: 12,
                boxSizing: "border-box",
                minHeight: 62,
                padding: 8,
                border: "1px solid rgba(255,255,255,.16)",
                background: "rgba(255,255,255,.055)",
                opacity: entrance,
                transform: `translateX(${(1 - entrance) * 34}px)`,
              }}
            >
              <div style={{height: 44, overflow: "hidden"}}>
                <Img src={staticFile(`screens-v2/${target.src}`)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              </div>
              <div style={{color: palette.white, fontFamily: "monospace", fontSize: 9, fontWeight: 900}}>{target.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BuildMetrics = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const metrics = [
    ["05", "PRODUCT SURFACES"],
    ["11", "API ROUTES"],
    ["08", "D1 TABLES"],
    ["04", "IDENTITY PATHS"],
    ["01", "DEPLOYED PRODUCT"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 48,
        top: 185,
        right: 376,
        width: 610,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 9,
        padding: 12,
        color: palette.white,
        border: "1px solid rgba(201,255,61,.28)",
        background: "rgba(5,7,9,.92)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {metrics.map(([value, label], index) => {
        const entrance = spring({frame: frame - (55 + index * 24), fps, config: {damping: 200}, durationInFrames: 20});
        const final = index === metrics.length - 1;
        return (
          <div
            key={label}
            style={{
              gridColumn: final ? "1 / 3" : undefined,
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              minHeight: final ? 76 : 116,
              padding: 15,
              color: final ? palette.black : palette.white,
              border: "1px solid rgba(255,255,255,.14)",
              background: final ? palette.lime : "rgba(255,255,255,.05)",
              opacity: entrance,
              transform: `translateY(${(1 - entrance) * 18}px)`,
            }}
          >
            <strong style={{fontSize: final ? 42 : 54, lineHeight: .8, letterSpacing: "-.07em"}}>{value}</strong>
            <span style={{fontFamily: "monospace", fontSize: 9, fontWeight: 900}}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const AttentionScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[0].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.orange} section="ATTENTION IS SCARCE">
      <CrossfadeScreens
        first="01-manifesto.jpg"
        second="02-fatigue.jpg"
        changeAt={280}
        durationInFrames={duration}
      />
      <RailOverlay frame={frame} slideLabel={frame < 280 ? "01 · THE IDEA" : "02 · THE PROBLEM"} activeColor={frame < 280 ? palette.lime : palette.orange} />
      <div
        style={{
          position: "absolute",
          zIndex: 48,
          left: 68,
          bottom: 98,
          display: "flex",
          gap: 8,
          color: palette.white,
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        <span style={{padding: "11px 14px", color: palette.black, background: palette.orange}}>SLIDES BECAME CHEAP</span>
        <span style={{padding: "11px 14px", border: `1px solid ${palette.orange}`, background: "rgba(5,7,9,.82)"}}>ATTENTION DID NOT</span>
      </div>
    </SceneFrame>
  );
};

const SharedScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[1].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.cyan} section="MAKE SHARED TIME">
      <Screen src="03-shared.jpg" frame={frame} durationInFrames={duration} />
      <RailOverlay frame={frame} slideLabel="03 · THE IDEA" activeColor={palette.cyan} />
    </SceneFrame>
  );
};

const ParticipateScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[2].durationInFrames;
  const changed = frame > 250;
  const comments: CommentSpec[] = [
    {name: "Maya", text: "The audience is writing the presentation back.", start: 270, verified: true, accent: palette.magenta},
    {name: "Ken", text: "Can the room change what comes next?", start: 350, accent: palette.yellow},
    {name: "Sofia", text: "This is what live should feel like.", start: 425, verified: true, accent: palette.cyan},
    {name: "Leo", text: "I want to remember this slide later.", start: 500, verified: true, accent: palette.orange},
  ];
  const bursts = [
    {symbol: "🔥", start: 305, x: 980, y: 610, size: 64},
    {symbol: "💡", start: 385, x: 1210, y: 460, size: 62},
    {symbol: "👏", start: 460, x: 800, y: 520, size: 68},
    {symbol: "❓", start: 530, x: 1120, y: 690, size: 66},
  ];
  return (
    <SceneFrame durationInFrames={duration} accent={changed ? palette.magenta : palette.yellow} section="THE ROOM ANSWERS">
      <CrossfadeScreens
        first="04-join.jpg"
        second="05-interaction.jpg"
        changeAt={250}
        durationInFrames={duration}
      />
      <RailOverlay
        frame={frame}
        slideLabel={changed ? "05 · THE EXPERIENCE" : "04 · THE EXPERIENCE"}
        comments={changed ? comments : []}
        activeColor={changed ? palette.magenta : palette.yellow}
      />
      {!changed ? <PhoneJoin /> : null}
      {changed ? bursts.map((burst, index) => <StampBurst key={`${burst.symbol}-${index}`} {...burst} frame={frame} />) : null}
    </SceneFrame>
  );
};

const ShapeStoryScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[3].durationInFrames;
  const branchVisible = frame > 170;
  const comments: CommentSpec[] = [
    {name: "Aoi", text: "The conversation moved with the slide—context preserved.", start: 30, verified: true, accent: palette.cyan},
  ];
  return (
    <SceneFrame durationInFrames={duration} accent={branchVisible ? palette.yellow : palette.cyan} section="THE ROOM SHAPES THE STORY">
      <CrossfadeScreens
        first="06-context.jpg"
        second="08-branch.jpg"
        changeAt={170}
        durationInFrames={duration}
      />
      <RailOverlay
        frame={frame}
        slideLabel={branchVisible ? "08 · THE PARTICIPATION" : "06 · THE EXPERIENCE"}
        comments={branchVisible ? [] : comments}
        activeColor={branchVisible ? palette.yellow : palette.cyan}
      />
      {branchVisible ? <VotePanel /> : (
        <div
          style={{
            position: "absolute",
            zIndex: 48,
            top: 120,
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
      )}
    </SceneFrame>
  );
};

const SitesRevealScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[4].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.lime} section="THE SITES REVEAL">
      <Screen src="07-sites-reveal.jpg" frame={frame} durationInFrames={duration} />
      <RailOverlay
        frame={frame}
        slideLabel="07 · THE REVEAL"
        comments={[
          {name: "Devpost Judge", text: "Wait—this is one live Sites application?", start: 55, verified: true, accent: palette.lime},
        ]}
        activeColor={palette.lime}
      />
      <SitesRevealBanner />
    </SceneFrame>
  );
};

const StateProofScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[5].durationInFrames;
  return (
    <SceneFrame durationInFrames={duration} accent={palette.cyan} section="ONE ACTION · EVERY SCREEN">
      <Screen src="13-shared-state.jpg" frame={frame} durationInFrames={duration} />
      <RailOverlay
        frame={frame}
        slideLabel="13 · THE PROOF"
        comments={[
          {name: "Nao", text: "One comment reached the stage, memory, and admin.", start: 320, verified: true, accent: palette.cyan},
        ]}
        activeColor={palette.cyan}
      />
      <StateProofStrip />
    </SceneFrame>
  );
};

const RelationshipStoryScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[6].durationInFrames;
  const relationshipVisible = frame > 265;
  const surfaceEntrance = interpolate(frame, [60, 90], [0, 1], clamp);
  return (
    <SceneFrame durationInFrames={duration} accent={palette.orange} section="FROM MOMENT TO RELATIONSHIP">
      <CrossfadeScreens
        first="09-memory.jpg"
        second="11-marketing.jpg"
        changeAt={265}
        durationInFrames={duration}
      />
      <RailOverlay
        frame={frame}
        slideLabel={relationshipVisible ? "11 · THE PRODUCT" : "09 · THE PRODUCT"}
        activeColor={palette.orange}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 48,
          top: 190,
          right: 375,
          width: 540,
          overflow: "hidden",
          border: "1px solid rgba(255,138,98,.34)",
          background: palette.paper,
          boxShadow: "0 28px 80px rgba(0,0,0,.42)",
          opacity: surfaceEntrance,
          transform: `translateY(${(1 - surfaceEntrance) * 30}px)`,
        }}
      >
        <div style={{padding: "10px 13px", color: palette.black, background: palette.orange, fontFamily: "monospace", fontSize: 10, fontWeight: 900}}>
          {relationshipVisible ? "ADMIN · TURN SIGNALS INTO RELEVANT FOLLOW-UP" : "MY PAGE · RETURN TO YOUR OWN THINKING"}
        </div>
        <Img
          src={staticFile(`screens-v2/${relationshipVisible ? "admin-english.jpg" : "mypage-english.jpg"}`)}
          style={{display: "block", width: "100%", height: 304, objectFit: "cover", objectPosition: "center top"}}
        />
      </div>
    </SceneFrame>
  );
};

const SitesBuildScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[7].durationInFrames;
  const loopVisible = frame > 330;
  return (
    <SceneFrame durationInFrames={duration} accent={loopVisible ? palette.orange : palette.lime} section="BUILT END TO END">
      <CrossfadeScreens
        first="12-sites-build.jpg"
        second="14-build-loop.jpg"
        changeAt={330}
        durationInFrames={duration}
      />
      <RailOverlay
        frame={frame}
        slideLabel={loopVisible ? "14 · THE BUILD" : "12 · THE BUILD"}
        activeColor={loopVisible ? palette.orange : palette.lime}
      />
      {loopVisible ? <BuildPipeline /> : <BuildMetrics />}
      <div
        style={{
          position: "absolute",
          zIndex: 49,
          top: 96,
          left: 68,
          display: "flex",
          gap: 8,
          color: palette.white,
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 900,
        }}
      >
        {["CODEX", "GPT-5.6", "CHATGPT SITES"].map((label, index) => (
          <span
            key={label}
            style={{
              padding: "9px 12px",
              color: index === 2 ? palette.black : palette.white,
              border: "1px solid rgba(255,255,255,.18)",
              background: index === 2 ? palette.lime : "rgba(6,7,10,.78)",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </SceneFrame>
  );
};

const FinalScene = () => {
  const frame = useCurrentFrame();
  const duration = scenes[8].durationInFrames;
  const words = ["SCAN", "JOIN", "REACT", "REMEMBER", "RELATE"];
  return (
    <SceneFrame durationInFrames={duration} accent={palette.white} section="THE ASK">
      <Screen src="15-finale.jpg" frame={frame} durationInFrames={duration} zoom={1.21} origin="left center" />
      <div style={{position: "absolute", zIndex: 48, right: 80, bottom: 170, display: "flex", gap: 8}}>
        {words.map((word, index) => {
          const entrance = interpolate(frame, [55 + index * 16, 75 + index * 16], [0, 1], clamp);
          return (
            <div
              key={word}
              style={{
                padding: "12px 14px",
                color: index === words.length - 1 ? palette.black : palette.white,
                border: "1px solid rgba(255,255,255,.18)",
                background: index === words.length - 1 ? palette.white : "rgba(6,7,10,.78)",
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
      <div style={{position: "absolute", zIndex: 48, right: 80, bottom: 105, color: palette.white, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 20, fontWeight: 800}}>
        new-era-presentation.lvnsk.jp
      </div>
      <div style={{position: "absolute", zIndex: 48, right: 80, bottom: 75, color: "rgba(255,255,255,.45)", fontFamily: "monospace", fontSize: 9, letterSpacing: ".08em"}}>
        NARRATION GENERATED WITH OPENAI TEXT TO SPEECH
      </div>
    </SceneFrame>
  );
};

const sceneComponents = [
  AttentionScene,
  SharedScene,
  ParticipateScene,
  ShapeStoryScene,
  SitesRevealScene,
  StateProofScene,
  RelationshipStoryScene,
  SitesBuildScene,
  FinalScene,
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
