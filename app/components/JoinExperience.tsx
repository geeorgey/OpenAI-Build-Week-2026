"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BRANCH_SLIDE_ID,
  branchOptions,
  type BranchCounts,
} from "../../lib/branching";
import { slides } from "../data/slides";

type Identity = {
  displayName: string;
  email: string | null;
  provider: string;
  verified: boolean;
};

const stamps = [
  { symbol: "🔥", label: "Resonated" },
  { symbol: "💡", label: "Insight" },
  { symbol: "👏", label: "Agree" },
  { symbol: "❓", label: "Question" },
];

export function JoinExperience() {
  const [currentSlide, setCurrentSlide] = useState(3);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [guest, setGuest] = useState(false);
  const [guestName, setGuestName] = useState("Guest");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState("");
  const [branchCounts, setBranchCounts] = useState<BranchCounts>(() => Object.fromEntries(
    branchOptions.map((option) => [option.id, 0]),
  ));
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [voteStatus, setVoteStatus] = useState("");
  const visitorId = useMemo(() => {
    if (typeof window === "undefined") return "join";
    const existing = window.localStorage.getItem("nep_visitor");
    if (existing) return existing;
    const created = `visitor-${crypto.randomUUID()}`;
    window.localStorage.setItem("nep_visitor", created);
    return created;
  }, []);
  const slide = slides[Math.min(slides.length - 1, Math.max(0, currentSlide - 1))];

  useEffect(() => {
    const load = async () => {
      try {
        const [presentationResponse, meResponse] = await Promise.all([
          fetch("/api/presentation"),
          fetch("/api/me"),
        ]);
        if (presentationResponse.ok) {
          const payload = await presentationResponse.json() as {
            presentation?: { currentSlide?: number };
          };
          const nextSlide = payload.presentation?.currentSlide;
          if (nextSlide) {
            setCurrentSlide(nextSlide);
            const nextSlideId = slides[Math.min(slides.length - 1, Math.max(0, nextSlide - 1))]?.id;
            if (nextSlideId === BRANCH_SLIDE_ID) {
              const voteResponse = await fetch(
                `/api/branch-votes?visitorId=${encodeURIComponent(visitorId)}`,
                { cache: "no-store" },
              );
              if (voteResponse.ok) {
                const votePayload = await voteResponse.json() as {
                  counts?: BranchCounts;
                  selectedOptionId?: string | null;
                };
                setBranchCounts((counts) => ({ ...counts, ...votePayload.counts }));
                setSelectedBranch(votePayload.selectedOptionId ?? null);
              }
            }
          }
        }
        if (meResponse.ok) {
          const payload = await meResponse.json() as { identity?: Identity | null };
          setIdentity(payload.identity ?? null);
        }
      } catch {
        // The live card keeps a useful default while offline.
      }
    };
    void load();
    const timer = window.setInterval(load, 2000);
    return () => window.clearInterval(timer);
  }, [visitorId]);

  const startEmail = async () => {
    setEmailStatus("Sending…");
    const response = await fetch("/api/auth/email/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, marketingOptIn }),
    });
    const payload = await response.json() as { message?: string; error?: string };
    setEmailStatus(response.ok ? payload.message ?? "Verification email sent." : payload.error ?? "Could not send the email.");
  };

  const react = async (stamp: string) => {
    setSent(`${stamp} added to slide ${currentSlide}`);
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slideId: slide.id, stamp, visitorId }),
    }).catch(() => undefined);
  };

  const post = async () => {
    if (!comment.trim()) return;
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slideId: slide.id,
        body: comment.trim(),
        displayName: identity?.displayName || guestName || "Guest",
      }),
    });
    setSent(response.ok ? `Comment added to slide ${currentSlide}` : "Could not send the comment");
    if (response.ok) setComment("");
  };

  const vote = async (optionId: string) => {
    setVoteStatus("Sending your vote…");
    const response = await fetch("/api/branch-votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ optionId, visitorId }),
    });
    const payload = await response.json() as {
      counts?: BranchCounts;
      selectedOptionId?: string | null;
      error?: string;
    };
    if (!response.ok) {
      setVoteStatus(payload.error ?? "Could not submit your vote.");
      return;
    }
    setBranchCounts((counts) => ({ ...counts, ...payload.counts }));
    setSelectedBranch(payload.selectedOptionId ?? optionId);
    const option = branchOptions.find((item) => item.id === optionId);
    setVoteStatus(`Voted for ${option?.shortLabelEn ?? optionId}. You can change your vote.`);
  };

  const joined = Boolean(identity || guest);
  const isBranchSlide = slide.id === BRANCH_SLIDE_ID;
  const branchTotal = Object.values(branchCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="join-layout">
      <section className="live-slide-card">
        <div className="live-status"><i /> LIVE / SLIDE {String(currentSlide).padStart(2, "0")}</div>
        <small>{slide.eyebrowEn}</small>
        <h2>{slide.titleEn}</h2>
        <p>{slide.leadEn}</p>
      </section>

      <section className="join-panel">
        {identity ? (
          <div className="verified-banner">
            <span>✓</span>
            <div>
              <b>{identity.displayName}</b>
              <small>{identity.provider.toUpperCase()} VERIFIED · Your activity will stay on My Page</small>
            </div>
          </div>
        ) : guest ? (
          <div className="verified-banner" style={{ background: "#4d4e49" }}>
            <span style={{ background: "#fff" }}>◎</span>
            <div>
              <b>Participating as a guest</b>
              <small>React instantly. Verify your identity to save your history.</small>
            </div>
          </div>
        ) : (
          <>
            <span className="surface-eyebrow">CHOOSE HOW TO JOIN</span>
            <h2>Choose how to participate</h2>
            <p className="surface-lead">Join instantly as a guest, or verify your identity to revisit every reaction and comment later.</p>

            <div className="identity-options">
              <button className="identity-option" onClick={() => setGuest(true)}>
                <span>◎</span><div><b>Continue as guest</b><small>Instant access · local history only</small></div>
              </button>
              <Link className="identity-option" href="/auth/google/start">
                <span>G</span><div><b>Continue with Google</b><small>Verify with your Google account</small></div><em>✓ VERIFIED</em>
              </Link>
              <Link className="identity-option" href="/auth/chatgpt/complete">
                <span>◉</span><div><b>Continue with ChatGPT</b><small>Sign in with ChatGPT</small></div><em>✓ VERIFIED</em>
              </Link>
            </div>

            <div className="email-auth-form">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Verify with your email address" />
              <label className="consent-row">
                <input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} />
                Send me relevant resources and future presentation updates. I can unsubscribe at any time.
              </label>
              <button onClick={() => void startEmail()} disabled={!email}>SEND VERIFICATION LINK ↗</button>
              {emailStatus && <small>{emailStatus}</small>}
            </div>
          </>
        )}

        {joined && (
          <>
            {!identity && (
              <div className="join-composer">
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Display name" maxLength={40} />
              </div>
            )}
            {isBranchSlide && (
              <div className="join-branch-vote">
                <span className="surface-eyebrow">CHOOSE THE NEXT PATH</span>
                <h3>Vote for what comes next</h3>
                <p>When the presenter advances, the room follows the most popular route.</p>
                <div className="join-branch-options">
                  {branchOptions.map((option, index) => {
                    const count = Math.max(0, Number(branchCounts[option.id]) || 0);
                    return (
                      <button
                        type="button"
                        className={selectedBranch === option.id ? "is-selected" : ""}
                        key={option.id}
                        onClick={() => void vote(option.id)}
                      >
                        <i>{String.fromCharCode(65 + index)}</i>
                        <span><b>{option.labelEn}</b><small>{count} {count === 1 ? "vote" : "votes"}</small></span>
                      </button>
                    );
                  })}
                </div>
                <small>{voteStatus || `${branchTotal} votes live · ties resolve in stable A → D order`}</small>
              </div>
            )}
            <div className="join-composer">
              <span className="surface-eyebrow">STAMP THIS SLIDE</span>
              <div className="stamp-row" style={{ border: 0, padding: 0 }}>
                {stamps.map((stamp) => (
                  <button key={stamp.symbol} aria-label={stamp.label} title={stamp.label} onClick={() => void react(stamp.symbol)}>
                    {stamp.symbol}
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comment on the current slide…" maxLength={280} />
              <button onClick={() => void post()} disabled={!comment.trim()}>POST TO SLIDE {currentSlide} ↗</button>
              {sent && <small>{sent}</small>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
