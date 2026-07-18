"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { slides } from "../data/slides";

type Mode = "present" | "web";
type Language = "ja" | "en";
type CommentItem = {
  id: number | string;
  slideId: string;
  displayName: string;
  body: string;
  verified: boolean;
  provider?: string;
  createdAt?: string;
};

const starterComments: CommentItem[] = [
  { id: "c1", slideId: "ai-fatigue", displayName: "Mika", body: "量産型のAIプレゼンに飽きる感覚、まさにこれ。", verified: true, provider: "google" },
  { id: "c2", slideId: "join", displayName: "Ken", body: "ゲストで一瞬、必要なら認証へ進めるのが良い。", verified: false },
  { id: "c3", slideId: "context", displayName: "Aoi", body: "スライドが変わったらコメントも追従してほしかった！", verified: true, provider: "chatgpt" },
  { id: "c4", slideId: "sites", displayName: "Riku", body: "Sitesの担当範囲が一枚で理解できた。", verified: true, provider: "email" },
  { id: "c5", slideId: "cloudflare", displayName: "Nao", body: "メールだけCloudflareへ渡す境界が明快。", verified: true, provider: "google" },
  { id: "c6", slideId: "buildweek", displayName: "Devpost Judge", body: "Working product + clear impact.", verified: true, provider: "google" },
];

const stamps = [
  { symbol: "🔥", label: "刺さった" },
  { symbol: "💡", label: "発見" },
  { symbol: "👏", label: "共感" },
  { symbol: "❓", label: "質問" },
];

const subscribeToOrigin = () => () => undefined;

function currentUrlSlideIndex() {
  if (typeof window === "undefined") return 0;
  const raw = Number(new URLSearchParams(window.location.search).get("slide"));
  if (!Number.isFinite(raw)) return 0;
  return Math.min(slides.length - 1, Math.max(0, raw - 1));
}

function Visual({ slideIndex, language }: { slideIndex: number; language: Language }) {
  const slide = slides[slideIndex];
  const points = language === "ja" ? slide.points : slide.pointsEn;

  if (slide.id === "manifesto" || slide.id === "finale") {
    return (
      <div className="visual visual-orbit" aria-hidden="true">
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
        <div className="orbit orbit-c" />
        <div className="orbital-word">SITES</div>
        <div className="signal-dot dot-one" />
        <div className="signal-dot dot-two" />
        <div className="signal-dot dot-three" />
      </div>
    );
  }

  if (slide.id === "ai-fatigue") {
    return (
      <div className="visual problem-visual">
        <div className="fading-card">01 — TITLE / AGENDA</div>
        <div className="fading-card">02 — THREE GENERIC POINTS</div>
        <div className="fading-card">03 — “THANK YOU”</div>
        <div className="noise-line" />
      </div>
    );
  }

  if (slide.id === "shared-time") {
    return (
      <div className="visual shared-time-visual">
        <div className="human-node presenter-node"><b>PRESENTER</b><span>speaks + listens</span></div>
        <div className="shared-pulse"><i /><strong>LIVE</strong><i /></div>
        <div className="human-node audience-node"><b>PARTICIPANTS</b><span>react + shape</span></div>
      </div>
    );
  }

  if (slide.id === "join") {
    return (
      <div className="visual identity-stack">
        {points.map((point, index) => (
          <div className={`identity-card identity-${index}`} key={point}>
            <span>{["◎", "@", "G", "◉"][index]}</span>
            <strong>{point}</strong>
            {index > 0 && <em>VERIFIED</em>}
          </div>
        ))}
      </div>
    );
  }

  if (slide.id === "interaction") {
    return (
      <div className="visual stamp-storm" aria-hidden="true">
        {["🔥", "💡", "👏", "❓", "🔥", "👏", "💡"].map((stamp, index) => (
          <span key={`${stamp}-${index}`} style={{ "--i": index } as React.CSSProperties}>{stamp}</span>
        ))}
      </div>
    );
  }

  if (slide.id === "context") {
    return (
      <div className="visual context-flow">
        <div className="mini-slide"><b>04</b><span>ACTIVE SLIDE</span></div>
        <div className="flow-line"><i /></div>
        <div className="mini-comments">
          <span>04 · “この会話へ移動”</span>
          <span>04 · “文脈が残る”</span>
          <span>04 · “自動スクロール”</span>
        </div>
      </div>
    );
  }

  if (slide.id === "modes") {
    return (
      <div className="visual mode-cards">
        <div><small>01</small><b>PRESENT</b><span>speaker-led</span><i>← →</i></div>
        <div><small>02</small><b>WEB</b><span>self-paced</span><i>SCROLL</i></div>
      </div>
    );
  }

  if (slide.id === "memory") {
    return (
      <div className="visual memory-timeline">
        <div><span>03</span><b>🔥</b><em>JOIN</em></div>
        <div><span>05</span><b>💬</b><em>CONTEXT</em></div>
        <div><span>10</span><b>💡</b><em>CLOUDFLARE</em></div>
        <div><span>13</span><b>👏</b><em>DEMO</em></div>
      </div>
    );
  }

  if (slide.id === "admin") {
    return (
      <div className="visual control-panel">
        <div className="control-header"><span>CONTROL ROOM</span><b>y@lne.st ✓</b></div>
        {points.map((point, index) => (
          <div className={`control-row ${index === 0 ? "is-live" : ""}`} key={point}>
            <i /> <span>{point}</span><b>{index === 0 ? "ON" : "READY"}</b>
          </div>
        ))}
      </div>
    );
  }

  if (slide.id === "marketing") {
    return (
      <div className="visual loop-visual">
        <div className="loop-core">@</div>
        {["JOIN", "SIGNAL", "SEGMENT", "SEND"].map((item, index) => (
          <span key={item} style={{ "--i": index } as React.CSSProperties}>{item}</span>
        ))}
      </div>
    );
  }

  if (slide.id === "sites" || slide.id === "cloudflare") {
    const items = slide.id === "sites"
      ? ["CODEX", "GPT-5.6", "SITES", "D1", "DEPLOY"]
      : ["SITES", "PLUGIN", "WORKER", "EMAIL"];
    return (
      <div className="visual build-pipeline">
        {items.map((item, index) => (
          <div key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <b>{item}</b>
            {index < items.length - 1 && <i>→</i>}
          </div>
        ))}
      </div>
    );
  }

  if (slide.id === "gpt-image") {
    return (
      <div className="visual image-weave">
        <div className="image-core"><small>CODEX</small><b>×</b><strong>GPT<br />IMAGE 2</strong></div>
        {points.map((point, index) => (
          <span key={point} style={{ "--i": index } as React.CSSProperties}>{point}</span>
        ))}
      </div>
    );
  }

  if (slide.id === "google") {
    return (
      <div className="visual google-steps">
        {points.map((point, index) => (
          <div key={point}><b>{index + 1}</b><span>{point.replace(/^\d+\.\s*/, "")}</span></div>
        ))}
      </div>
    );
  }

  if (slide.id === "buildweek") {
    return (
      <div className="visual score-grid">
        {points.map((point, index) => (
          <div key={point}><strong>0{index + 1}</strong><span>{point}</span><i>25%</i></div>
        ))}
      </div>
    );
  }

  return (
    <div className="visual demo-timeline">
      {points.map((point, index) => (
        <div key={point}><span>{point.split(" ")[0]}</span><i /><b>{point.split(" ").slice(1).join(" ")}</b>{index < points.length - 1 && <em />}</div>
      ))}
    </div>
  );
}

function InteractionRail({
  activeSlide,
  comments,
  onComment,
  onStamp,
  pulse,
  language,
}: {
  activeSlide: number;
  comments: CommentItem[];
  onComment: (body: string, displayName: string) => Promise<void>;
  onStamp: (symbol: string) => Promise<void>;
  pulse: number;
  language: Language;
}) {
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("Guest");
  const [sending, setSending] = useState(false);
  const currentSlide = slides[activeSlide];
  const currentComments = comments.filter((comment) => comment.slideId === currentSlide.id);
  const commentStreamRef = useRef<HTMLDivElement>(null);
  const joinUrl = useSyncExternalStore(
    subscribeToOrigin,
    () => `${window.location.origin}/join`,
    () => "/join",
  );

  useEffect(() => {
    commentStreamRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSlide, pulse]);

  const submit = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    await onComment(body.trim(), displayName.trim() || "Guest");
    setBody("");
    setSending(false);
  };

  return (
    <aside className={`interaction-rail ${pulse ? "rail-pulse" : ""}`}>
      <div className="rail-top">
        <div className="join-qr">
          <QRCodeSVG value={joinUrl} size={72} bgColor="transparent" fgColor="currentColor" level="M" />
        </div>
        <div>
          <span className="mono-label">LIVE / JOIN</span>
          <strong>{language === "ja" ? "スマホから参加" : "Join on your phone"}</strong>
          <Link href="/join">/join ↗</Link>
        </div>
      </div>

      <div className="rail-context">
        <span>{language === "ja" ? "いまのスライド" : "ACTIVE SLIDE"}</span>
        <strong>{String(activeSlide + 1).padStart(2, "0")} · {language === "ja" ? currentSlide.chapter : currentSlide.chapter}</strong>
        <small>{currentComments.length} {language === "ja" ? "件のコメントへ移動" : "comments in context"}</small>
      </div>

      <div className="comment-stream" ref={commentStreamRef} aria-live="polite">
        {currentComments.length ? currentComments.map((comment) => (
          <article className="comment-card" key={comment.id}>
            <header>
              <span className="avatar">{comment.displayName.slice(0, 1).toUpperCase()}</span>
              <b>{comment.displayName}</b>
              {comment.verified && <em title={`Verified by ${comment.provider ?? "identity"}`}>✓ VERIFIED</em>}
            </header>
            <p>{comment.body}</p>
            <small>SLIDE {String(activeSlide + 1).padStart(2, "0")}</small>
          </article>
        )) : (
          <div className="empty-comments">
            <span>＋</span>
            <p>{language === "ja" ? "このスライドの最初のコメントを。" : "Start this slide’s conversation."}</p>
          </div>
        )}
      </div>

      <div className="stamp-row">
        {stamps.map((stamp) => (
          <button key={stamp.symbol} onClick={() => onStamp(stamp.symbol)} title={stamp.label} aria-label={stamp.label}>
            {stamp.symbol}
          </button>
        ))}
      </div>

      <div className="composer">
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} aria-label="表示名" />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={language === "ja" ? "このスライドにコメント…" : "Comment on this slide…"}
          maxLength={280}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void submit();
          }}
        />
        <button onClick={() => void submit()} disabled={!body.trim() || sending}>
          {sending ? "…" : language === "ja" ? "投稿する ↗" : "POST ↗"}
        </button>
      </div>
    </aside>
  );
}

export function DeckExperience({ mode, initialSlide = 0 }: { mode: Mode; initialSlide?: number }) {
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [language, setLanguage] = useState<Language>("ja");
  const [comments, setComments] = useState<CommentItem[]>(starterComments);
  const [reactionBurst, setReactionBurst] = useState<{ symbol: string; key: number } | null>(null);
  const [pulse, setPulse] = useState(0);
  const [isLiveController, setIsLiveController] = useState(false);
  const slide = slides[activeSlide];
  const points = language === "ja" ? slide.points : slide.pointsEn;

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(slides.length - 1, Math.max(0, next));
    setActiveSlide(clamped);
    setPulse((value) => value + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("slide", String(clamped + 1));
    window.history.pushState({ slide: clamped + 1 }, "", url);
    if (isLiveController && mode === "present") {
      void fetch("/api/presentation", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentSlide: clamped + 1 }),
      });
    }
  }, [isLiveController, mode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches("input, textarea")) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goTo(activeSlide + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeSlide - 1);
      }
    };
    const onPop = () => setActiveSlide(currentUrlSlideIndex());
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [activeSlide, goTo]);

  useEffect(() => {
    void fetch("/api/me")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { identity?: { email?: string; provider?: string; verified?: boolean } } | null) => {
        const identity = payload?.identity;
        setIsLiveController(Boolean(
          identity?.verified &&
          identity.provider === "google" &&
          identity.email?.toLowerCase() === "y@lne.st",
        ));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadComments = async () => {
      try {
        const response = await fetch("/api/comments");
        if (!response.ok) return;
        const payload = await response.json() as { comments?: CommentItem[] };
        if (!cancelled && payload.comments?.length) setComments(payload.comments);
      } catch {
        // The seeded conversation keeps the deck useful before D1 is provisioned.
      }
    };
    void loadComments();
    const timer = window.setInterval(loadComments, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const onComment = async (body: string, displayName: string) => {
    const optimistic: CommentItem = {
      id: `local-${Date.now()}`,
      slideId: slide.id,
      displayName,
      body,
      verified: false,
    };
    setComments((items) => [...items, optimistic]);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, displayName, slideId: slide.id }),
      });
      if (!response.ok) return;
      const payload = await response.json() as { comment?: CommentItem };
      if (payload.comment) {
        setComments((items) => items.map((item) => item.id === optimistic.id ? payload.comment! : item));
      }
    } catch {
      // The optimistic comment remains visible in the local demo.
    }
  };

  const reactId = useId();
  const visitorId = `deck-${reactId.replaceAll(":", "")}`;
  const onStamp = async (symbol: string) => {
    setReactionBurst({ symbol, key: Date.now() });
    window.setTimeout(() => setReactionBurst(null), 900);
    if ("vibrate" in navigator) navigator.vibrate(22);
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slideId: slide.id, stamp: symbol, visitorId }),
      });
    } catch {
      // Reactions are intentionally instant even before persistence is ready.
    }
  };

  return (
    <main className={`deck-shell ${mode === "web" ? "is-web-mode" : ""}`}>
      <section className={`stage ${slide.theme}`} key={`${slide.id}-${language}`}>
        <div className="ambient-grid" />
        <header className="stage-header">
          <Link href="/" className="brand-lockup">
            <span>NEP</span>
            <b>NEW ERA<br />PRESENTATION</b>
          </Link>
          <div className="mode-switch" aria-label="Display mode">
            <Link href="/" className={mode === "present" ? "active" : ""}>PRESENT</Link>
            <Link href="/web" className={mode === "web" ? "active" : ""}>WEB</Link>
          </div>
          {isLiveController && mode === "present" && <span className="live-controller-badge">● LIVE SYNC</span>}
          <button className="language-switch" onClick={() => setLanguage((value) => value === "ja" ? "en" : "ja")}>
            {language === "ja" ? "EN" : "日本語"}
          </button>
        </header>

        <div className="slide-content">
          <div className="slide-copy">
            <span className="eyebrow">{language === "ja" ? slide.eyebrow : slide.eyebrowEn}</span>
            <h1>{language === "ja" ? slide.title : slide.titleEn}</h1>
            <p className="slide-lead">{language === "ja" ? slide.lead : slide.leadEn}</p>
            <div className="point-list">
              {points.map((point, index) => (
                <span key={point}><i>{String(index + 1).padStart(2, "0")}</i>{point}</span>
              ))}
            </div>
          </div>
          <Visual slideIndex={activeSlide} language={language} />
        </div>

        <footer className="stage-footer">
          <div className="chapter-mark">{slide.chapter}</div>
          <div className="progress-track"><i style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }} /></div>
          <div className="slide-counter">
            <b>{String(activeSlide + 1).padStart(2, "0")}</b>
            <span>/ {String(slides.length).padStart(2, "0")}</span>
          </div>
          <div className="navigation">
            <button onClick={() => goTo(activeSlide - 1)} disabled={activeSlide === 0} aria-label="前のスライド">←</button>
            <button onClick={() => goTo(activeSlide + 1)} disabled={activeSlide === slides.length - 1} aria-label="次のスライド">→</button>
          </div>
        </footer>
        {reactionBurst && <div className="reaction-burst" key={reactionBurst.key}>{reactionBurst.symbol}</div>}
      </section>
      <InteractionRail
        activeSlide={activeSlide}
        comments={comments}
        onComment={onComment}
        onStamp={onStamp}
        pulse={pulse}
        language={language}
      />
      {mode === "web" && (
        <div className="web-mode-hint">
          <span>SELF-PACED</span>
          {language === "ja" ? "矢印キーまたはナビゲーションで読み進められます" : "Use arrow keys or the navigation to explore"}
        </div>
      )}
    </main>
  );
}
