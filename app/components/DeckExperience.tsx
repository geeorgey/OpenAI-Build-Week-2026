"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  BRANCH_REJOIN_SLIDE_ID,
  BRANCH_SLIDE_ID,
  branchOptions,
  isBranchTargetSlide,
  resolveBranchWinner,
  type BranchCounts,
} from "../../lib/branching";
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

const titleMotionVariants = ["drop", "mosaic", "slice", "rise", "focus", "scatter"] as const;

const subscribeToOrigin = () => () => undefined;
const emptyBranchCounts = () => Object.fromEntries(
  branchOptions.map((option) => [option.id, 0]),
) as BranchCounts;

function currentUrlSlideIndex() {
  if (typeof window === "undefined") return 0;
  const raw = Number(new URLSearchParams(window.location.search).get("slide"));
  if (!Number.isFinite(raw)) return 0;
  return Math.min(slides.length - 1, Math.max(0, raw - 1));
}

function TitleMotion({ title, slideIndex }: { title: string; slideIndex: number }) {
  const variant = titleMotionVariants[slideIndex % titleMotionVariants.length];
  let characterIndex = 0;

  return (
    <h1
      className={`title-motion title-motion-${variant}`}
      data-title-motion={variant}
      aria-label={title.replaceAll("\n", " ")}
    >
      {title.split("\n").map((line, lineIndex) => {
        const tokens = line.match(/([A-Za-z0-9][A-Za-z0-9+./:’'&-]*|\s+|.)/gu) ?? [];
        return (
          <span
            className="title-line"
            style={{ "--line-index": lineIndex } as React.CSSProperties}
            aria-hidden="true"
            key={`${line}-${lineIndex}`}
          >
            {tokens.map((token, tokenIndex) => {
              if (/^\s+$/u.test(token)) {
                return <span className="title-space" key={`space-${tokenIndex}`}>{token}</span>;
              }

              const isLatinWord = /^[A-Za-z0-9][A-Za-z0-9+./:’'&-]*$/u.test(token);
              const characters = Array.from(token).map((character, tokenCharacterIndex) => {
                const index = characterIndex++;
                return (
                  <span
                    className="title-char"
                    style={{
                      "--char-index": index,
                      "--char-skew": index % 2 ? "-8deg" : "8deg",
                      "--char-shift": index % 2 ? "-.34em" : ".34em",
                      "--char-tilt": index % 2 ? "-7deg" : "7deg",
                    } as React.CSSProperties}
                    key={`${character}-${tokenCharacterIndex}`}
                  >
                    {character}
                  </span>
                );
              });

              return isLatinWord
                ? <span className="title-word" key={`${token}-${tokenIndex}`}>{characters}</span>
                : characters;
            })}
          </span>
        );
      })}
    </h1>
  );
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
        <div className="control-header"><span>CONTROL ROOM</span><b>3 IDS / PASSWORD ✓</b></div>
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
  readOnly = false,
}: {
  activeSlide: number;
  comments: CommentItem[];
  onComment: (body: string, displayName: string) => Promise<void>;
  onStamp: (symbol: string) => Promise<void>;
  pulse: number;
  language: Language;
  readOnly?: boolean;
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
    <aside className={`interaction-rail ${readOnly ? "is-read-only" : ""} ${pulse ? "rail-pulse" : ""}`}>
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

      {!readOnly && (
        <>
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
        </>
      )}
    </aside>
  );
}

function BranchPanel({
  mode,
  language,
  counts,
  selectedOptionId,
  notice,
  onSelect,
}: {
  mode: Mode;
  language: Language;
  counts: BranchCounts;
  selectedOptionId: string | null;
  notice: string;
  onSelect: (optionId: string) => void;
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const winner = resolveBranchWinner(counts);

  return (
    <div className={`visual branch-panel branch-panel-${mode}`}>
      <div className="branch-panel-header">
        <span>{mode === "present" ? "LIVE VOTE" : "CHOOSE YOUR PATH"}</span>
        <b>
          {mode === "present"
            ? total
              ? language === "ja" ? `${total}票を集計中` : `${total} votes live`
              : language === "ja" ? "最初の1票を待っています" : "Waiting for the first vote"
            : language === "ja" ? "クリックした道へ進みます" : "Click to continue"}
        </b>
      </div>
      <div className="branch-options">
        {branchOptions.map((option, index) => {
          const count = Math.max(0, Number(counts[option.id]) || 0);
          const percentage = total ? Math.round((count / total) * 100) : 0;
          const isLeading = mode === "present" && winner?.option.id === option.id;
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              type="button"
              className={`${isLeading ? "is-leading" : ""} ${isSelected ? "is-selected" : ""}`}
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={mode === "present"}
            >
              <i>{String.fromCharCode(65 + index)}</i>
              <span>
                <b>{language === "ja" ? option.label : option.labelEn}</b>
                <small>
                  {mode === "present"
                    ? `${count} ${language === "ja" ? "票" : count === 1 ? "vote" : "votes"} · ${percentage}%`
                    : language === "ja" ? "このルートを見る →" : "Explore this route →"}
                </small>
              </span>
              {mode === "present" && <em style={{ "--vote-width": `${percentage}%` } as React.CSSProperties} />}
            </button>
          );
        })}
      </div>
      <p className="branch-rule">
        {notice || (mode === "present"
          ? language === "ja"
            ? "次へ進む瞬間の最多票を採用。同数票は A → D の順で決定します。"
            : "The top vote at advance wins. Ties resolve in stable A → D order."
          : language === "ja"
            ? "このスライドでは右矢印とSpaceは無効です。四択から選んでください。"
            : "ArrowRight and Space are disabled here. Choose one of the four paths.")}
      </p>
    </div>
  );
}

export function DeckExperience({
  mode,
  initialSlide = 0,
  showGoogleBranding = false,
}: {
  mode: Mode;
  initialSlide?: number;
  showGoogleBranding?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [language, setLanguage] = useState<Language>("ja");
  const [comments, setComments] = useState<CommentItem[]>(starterComments);
  const [reactionBurst, setReactionBurst] = useState<{ symbol: string; key: number } | null>(null);
  const [pulse, setPulse] = useState(0);
  const [isLiveController, setIsLiveController] = useState(false);
  const [branchCounts, setBranchCounts] = useState<BranchCounts>(emptyBranchCounts);
  const [branchSelection, setBranchSelection] = useState<string | null>(null);
  const [branchNotice, setBranchNotice] = useState("");
  const [branchRoundReady, setBranchRoundReady] = useState(true);
  const reactId = useId();
  const visitorId = `deck-${reactId.replaceAll(":", "")}`;
  const slide = slides[activeSlide];
  const points = language === "ja" ? slide.points : slide.pointsEn;
  const branchSlideIndex = slides.findIndex((item) => item.id === BRANCH_SLIDE_ID);
  const branchRejoinIndex = slides.findIndex((item) => item.id === BRANCH_REJOIN_SLIDE_ID);

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(slides.length - 1, Math.max(0, next));
    const enteringBranch = slides[clamped]?.id === BRANCH_SLIDE_ID;
    if (enteringBranch) {
      setBranchCounts(emptyBranchCounts());
      setBranchSelection(null);
      setBranchNotice("");
      if (isLiveController && mode === "present") setBranchRoundReady(false);
    }
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
      }).then((response) => {
        if (enteringBranch) {
          setBranchRoundReady(response.ok);
          if (!response.ok) {
            setBranchNotice(language === "ja"
              ? "投票ラウンドを開始できませんでした。もう一度お試しください。"
              : "The voting round could not start. Please try again.");
          }
        }
      });
    }
  }, [isLiveController, language, mode]);

  const loadBranchVotes = useCallback(async () => {
    try {
      const response = await fetch("/api/branch-votes", { cache: "no-store" });
      if (!response.ok) return null;
      const payload = await response.json() as { counts?: BranchCounts };
      const counts = { ...emptyBranchCounts(), ...payload.counts };
      setBranchCounts(counts);
      return counts;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (slide.id !== BRANCH_SLIDE_ID || mode !== "present" || !branchRoundReady) return;
    const initial = window.setTimeout(() => void loadBranchVotes(), 0);
    const timer = window.setInterval(() => void loadBranchVotes(), 1500);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [branchRoundReady, loadBranchVotes, mode, slide.id]);

  const advance = useCallback(async () => {
    if (slide.id === BRANCH_SLIDE_ID) {
      if (mode === "web") {
        setBranchNotice(language === "ja"
          ? "四択をクリックすると、そのルートへ進みます。"
          : "Click one of the four choices to continue.");
        return;
      }
      if (!branchRoundReady) {
        setBranchNotice(language === "ja"
          ? "投票ラウンドを準備しています。"
          : "Preparing the voting round.");
        return;
      }
      const latestCounts = await loadBranchVotes() ?? branchCounts;
      const winner = resolveBranchWinner(latestCounts);
      if (!winner) {
        setBranchNotice(language === "ja"
          ? "まだ0票です。/join から1票以上入るまで進めません。"
          : "No votes yet. At least one /join vote is required.");
        return;
      }
      const targetIndex = slides.findIndex((item) => item.id === winner.option.targetSlideId);
      setBranchSelection(winner.option.id);
      setBranchNotice("");
      goTo(targetIndex);
      return;
    }
    if (isBranchTargetSlide(slide.id)) {
      goTo(branchRejoinIndex);
      return;
    }
    goTo(activeSlide + 1);
  }, [
    activeSlide,
    branchCounts,
    branchRejoinIndex,
    branchRoundReady,
    goTo,
    language,
    loadBranchVotes,
    mode,
    slide.id,
  ]);

  const goBack = useCallback(() => {
    if (isBranchTargetSlide(slide.id)) {
      goTo(branchSlideIndex);
      return;
    }
    if (slide.id === BRANCH_REJOIN_SLIDE_ID && branchSelection) {
      const selected = branchOptions.find((option) => option.id === branchSelection);
      const targetIndex = slides.findIndex((item) => item.id === selected?.targetSlideId);
      goTo(targetIndex >= 0 ? targetIndex : branchSlideIndex);
      return;
    }
    goTo(activeSlide - 1);
  }, [activeSlide, branchSelection, branchSlideIndex, goTo, slide.id]);

  const selectWebBranch = useCallback((optionId: string) => {
    if (mode !== "web") return;
    const option = branchOptions.find((item) => item.id === optionId);
    if (!option) return;
    const targetIndex = slides.findIndex((item) => item.id === option.targetSlideId);
    setBranchSelection(option.id);
    setBranchNotice("");
    void fetch("/api/branch-votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ optionId: option.id, visitorId }),
    });
    goTo(targetIndex);
  }, [goTo, mode, visitorId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches("input, textarea")) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        void advance();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      }
    };
    const onPop = () => setActiveSlide(currentUrlSlideIndex());
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [advance, goBack]);

  useEffect(() => {
    void fetch("/api/me")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { admin?: boolean } | null) => {
        setIsLiveController(Boolean(payload?.admin));
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

  const isBranchSlide = slide.id === BRANCH_SLIDE_ID;
  const nextDisabled = activeSlide === slides.length - 1
    || (isBranchSlide && mode === "web");
  const presentHref = `/?slide=${activeSlide + 1}`;
  const webHref = `/web?slide=${activeSlide + 1}`;

  return (
    <main className={`deck-shell ${mode === "web" ? "is-web-mode" : "is-present-mode"}`}>
      <section className={`stage ${slide.theme}`} key={`${slide.id}-${language}`}>
        <div className="ambient-grid" />
        <header className="stage-header">
          <Link href="/" className="brand-lockup">
            <span>NEP</span>
            <b>NEW ERA<br />PRESENTATION</b>
          </Link>
          <div className="mode-switch" aria-label="Display mode">
            <a href={presentHref} className={mode === "present" ? "active" : ""}>PRESENT</a>
            <a href={webHref} className={mode === "web" ? "active" : ""}>WEB</a>
          </div>
          {isLiveController && mode === "present" && <span className="live-controller-badge">● LIVE SYNC</span>}
          <button className="language-switch" onClick={() => setLanguage((value) => value === "ja" ? "en" : "ja")}>
            {language === "ja" ? "EN" : "日本語"}
          </button>
        </header>
        {showGoogleBranding && activeSlide === 0 && (
          <aside className="google-branding-proof" aria-label="Application identity">
            <strong>New Era Presentation</strong>
            <p>
              New Era Presentation is a participatory presentation medium where audiences join by QR code to react,
              comment, and ask questions in sync with each slide.
            </p>
          </aside>
        )}

        <div className="slide-content">
          <div className="slide-copy">
            <span className="eyebrow">{language === "ja" ? slide.eyebrow : slide.eyebrowEn}</span>
            <TitleMotion
              title={language === "ja" ? slide.title : slide.titleEn}
              slideIndex={activeSlide}
            />
            <p className="slide-lead">{language === "ja" ? slide.lead : slide.leadEn}</p>
            <div className="point-list">
              {points.map((point, index) => (
                <span key={point}><i>{String(index + 1).padStart(2, "0")}</i>{point}</span>
              ))}
            </div>
          </div>
          {isBranchSlide
            ? (
              <BranchPanel
                mode={mode}
                language={language}
                counts={branchCounts}
                selectedOptionId={branchSelection}
                notice={branchNotice}
                onSelect={selectWebBranch}
              />
            )
            : <Visual slideIndex={activeSlide} language={language} />}
        </div>

        <footer className="stage-footer">
          <div className="chapter-mark">{slide.chapter}</div>
          <div className="progress-track"><i style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }} /></div>
          <div className="slide-counter">
            <b>{String(activeSlide + 1).padStart(2, "0")}</b>
            <span>/ {String(slides.length).padStart(2, "0")}</span>
          </div>
          <div className="navigation">
            <button onClick={goBack} disabled={activeSlide === 0} aria-label="前のスライド">←</button>
            <button
              onClick={() => void advance()}
              disabled={nextDisabled}
              aria-label={isBranchSlide
                ? mode === "web" ? "四択から選んでください" : "最多票のルートへ進む"
                : "次のスライド"}
            >
              →
            </button>
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
        readOnly={mode === "present"}
      />
      {mode === "web" && (
        <div className="web-mode-hint">
          <span>SELF-PACED</span>
          {isBranchSlide
            ? language === "ja" ? "四択をクリックして次のルートへ" : "Click a choice to take the next path"
            : language === "ja" ? "矢印キーまたはナビゲーションで読み進められます" : "Use arrow keys or the navigation to explore"}
        </div>
      )}
    </main>
  );
}
