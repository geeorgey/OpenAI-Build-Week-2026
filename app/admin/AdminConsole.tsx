"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  presentation: { visibility: string; currentSlide: number };
  comments: Array<{ id: number; slideId: string; displayName: string; body: string; verified: number; visible: number }>;
  users: Array<{ id: string; displayName: string; email: string; provider: string; verified: number; marketingOptIn: number }>;
  campaigns: Array<{ id: number; subject: string; status: string; sentCount: number; createdAt: string }>;
};

export function AdminConsole() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("New Era Presentation — Follow-up");
  const [body, setBody] = useState("ご参加ありがとうございました。あなたが反応したスライドと関連資料をお送りします。");
  const [status, setStatus] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/snapshot");
    if (!response.ok) return;
    const payload = await response.json() as Snapshot;
    setSnapshot(payload);
    setVisibility(payload.presentation.visibility);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const saveVisibility = async () => {
    setStatus("保存中…");
    const response = await fetch("/api/presentation", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility, password }),
    });
    setStatus(response.ok ? "公開設定を更新しました。" : "公開設定を更新できませんでした。");
    if (response.ok) void load();
  };

  const toggleComment = async (id: number, visible: boolean) => {
    await fetch("/api/comments", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, visible }),
    });
    void load();
  };

  const sendCampaign = async () => {
    setStatus("配信を準備中…");
    const response = await fetch("/api/admin/campaign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, body, segment: "all_opted_in" }),
    });
    const payload = await response.json() as { message?: string; error?: string };
    setStatus(response.ok ? payload.message ?? "配信しました。" : payload.error ?? "配信できませんでした。");
    if (response.ok) void load();
  };

  if (!snapshot) {
    return <div className="admin-panel full">管理データを読み込んでいます…</div>;
  }

  const visibleComments = snapshot.comments.filter((comment) => comment.visible);
  const optedIn = snapshot.users.filter((user) => user.marketingOptIn);

  return (
    <div className="admin-grid">
      <section className="admin-panel full">
        <span className="panel-kicker">PUBLISHING CONTROL</span>
        <h2>公開範囲</h2>
        <div className="visibility-options">
          {[
            ["public", "公開", "誰でも閲覧・参加"],
            ["password", "限定公開", "パスワードが必要"],
            ["private", "非公開", "管理者だけ"],
          ].map(([value, label, detail]) => (
            <button className={`visibility-option ${visibility === value ? "active" : ""}`} onClick={() => setVisibility(value)} key={value}>
              <b>{label}</b><span>{detail}</span>
            </button>
          ))}
        </div>
        {visibility === "password" && <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="限定公開パスワード" />}
        <button onClick={() => void saveVisibility()}>公開設定を保存 ↗</button>
      </section>

      <section className="admin-panel">
        <span className="panel-kicker">COMMENTS</span>
        <strong className="panel-number">{visibleComments.length}</strong>
        <p>表示中 / 全 {snapshot.comments.length} 件</p>
      </section>
      <section className="admin-panel">
        <span className="panel-kicker">VERIFIED USERS</span>
        <strong className="panel-number">{snapshot.users.filter((user) => user.verified).length}</strong>
        <p>メール配信同意 {optedIn.length} 人</p>
      </section>

      <section className="admin-panel full">
        <span className="panel-kicker">COMMENT MODERATION</span>
        <h2>コメント管理</h2>
        <table className="admin-table">
          <thead><tr><th>USER</th><th>SLIDE</th><th>COMMENT</th><th>STATUS</th><th /></tr></thead>
          <tbody>
            {snapshot.comments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.displayName} {comment.verified ? <span className="verified-chip">✓</span> : null}</td>
                <td>{comment.slideId}</td>
                <td>{comment.body}</td>
                <td>{comment.visible ? "表示" : "非表示"}</td>
                <td><button onClick={() => void toggleComment(comment.id, !comment.visible)}>{comment.visible ? "非表示にする" : "再表示"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-panel full">
        <span className="panel-kicker">MARKETING / CLOUDFLARE EMAIL SERVICE</span>
        <h2>フォローアップ配信</h2>
        <p>オプトイン済み {optedIn.length} 人へ。関心スライド別セグメントにも拡張できます。</p>
        <input value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="件名" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} aria-label="本文" />
        <button onClick={() => void sendCampaign()}>newEraPresentation@lvnsk.jp から配信 ↗</button>
      </section>

      {status && <section className="admin-panel full"><b>{status}</b></section>}
    </div>
  );
}
