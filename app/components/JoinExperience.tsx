"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { slides } from "../data/slides";

type Identity = {
  displayName: string;
  email: string | null;
  provider: string;
  verified: boolean;
};

const stamps = [
  { symbol: "🔥", label: "刺さった" },
  { symbol: "💡", label: "発見" },
  { symbol: "👏", label: "共感" },
  { symbol: "❓", label: "質問" },
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
          if (payload.presentation?.currentSlide) setCurrentSlide(payload.presentation.currentSlide);
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
    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, []);

  const startEmail = async () => {
    setEmailStatus("送信中…");
    const response = await fetch("/api/auth/email/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, marketingOptIn }),
    });
    const payload = await response.json() as { message?: string; error?: string };
    setEmailStatus(response.ok ? payload.message ?? "メールを送信しました。" : payload.error ?? "送信できませんでした。");
  };

  const react = async (stamp: string) => {
    setSent(`${stamp} をスライド ${currentSlide} に置きました`);
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
    setSent(response.ok ? `スライド ${currentSlide} にコメントしました` : "コメントを送信できませんでした");
    if (response.ok) setComment("");
  };

  const joined = Boolean(identity || guest);

  return (
    <div className="join-layout">
      <section className="live-slide-card">
        <div className="live-status"><i /> LIVE / SLIDE {String(currentSlide).padStart(2, "0")}</div>
        <small>{slide.eyebrow}</small>
        <h2>{slide.title}</h2>
        <p>{slide.lead}</p>
      </section>

      <section className="join-panel">
        {identity ? (
          <div className="verified-banner">
            <span>✓</span>
            <div>
              <b>{identity.displayName}</b>
              <small>{identity.provider.toUpperCase()} VERIFIED · 投稿はマイページに残ります</small>
            </div>
          </div>
        ) : guest ? (
          <div className="verified-banner" style={{ background: "#4d4e49" }}>
            <span style={{ background: "#fff" }}>◎</span>
            <div>
              <b>ゲスト参加中</b>
              <small>すぐ参加できます。履歴保存には認証が必要です。</small>
            </div>
          </div>
        ) : (
          <>
            <span className="surface-eyebrow">CHOOSE HOW TO JOIN</span>
            <h2>参加方法を選ぶ</h2>
            <p className="surface-lead">見るだけならゲストで一瞬。認証すると、終了後も自分の反応とコメントを振り返れます。</p>

            <div className="identity-options">
              <button className="identity-option" onClick={() => setGuest(true)}>
                <span>◎</span><div><b>ゲストで参加</b><small>名前だけ・履歴は端末内</small></div>
              </button>
              <Link className="identity-option" href="/auth/google/start">
                <span>G</span><div><b>Google で参加</b><small>Googleアカウントで認証</small></div><em>✓ VERIFIED</em>
              </Link>
              <Link className="identity-option" href="/auth/chatgpt/complete">
                <span>◉</span><div><b>ChatGPT で参加</b><small>Sign in with ChatGPT</small></div><em>✓ VERIFIED</em>
              </Link>
            </div>

            <div className="email-auth-form">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="メールアドレスで認証" />
              <label className="consent-row">
                <input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} />
                このプレゼンに関連する資料・次回案内のメールを受け取る（いつでも解除できます）
              </label>
              <button onClick={() => void startEmail()} disabled={!email}>認証リンクを受け取る ↗</button>
              {emailStatus && <small>{emailStatus}</small>}
            </div>
          </>
        )}

        {joined && (
          <>
            {!identity && (
              <div className="join-composer">
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="表示名" maxLength={40} />
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
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="いまのスライドにコメント…" maxLength={280} />
              <button onClick={() => void post()} disabled={!comment.trim()}>スライド {currentSlide} に投稿 ↗</button>
              {sent && <small>{sent}</small>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
