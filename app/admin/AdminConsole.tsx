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
  const [body, setBody] = useState("Thank you for participating. Here are the slides you responded to and the most relevant follow-up resources.");
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
    setStatus("Saving…");
    const response = await fetch("/api/presentation", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility, password }),
    });
    setStatus(response.ok ? "Publishing settings updated." : "Could not update publishing settings.");
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
    setStatus("Preparing delivery…");
    const response = await fetch("/api/admin/campaign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, body, segment: "all_opted_in" }),
    });
    const payload = await response.json() as { message?: string; error?: string };
    setStatus(response.ok ? payload.message ?? "Campaign sent." : payload.error ?? "Could not send the campaign.");
    if (response.ok) void load();
  };

  if (!snapshot) {
    return <div className="admin-panel full">Loading control room data…</div>;
  }

  const visibleComments = snapshot.comments.filter((comment) => comment.visible);
  const optedIn = snapshot.users.filter((user) => user.marketingOptIn);

  return (
    <div className="admin-grid">
      <section className="admin-panel full">
        <span className="panel-kicker">PUBLISHING CONTROL</span>
        <h2>Presentation access</h2>
        <div className="visibility-options">
          {[
            ["public", "Public", "Anyone can view and join"],
            ["password", "Password protected", "A password is required"],
            ["private", "Private", "Admins only"],
          ].map(([value, label, detail]) => (
            <button className={`visibility-option ${visibility === value ? "active" : ""}`} onClick={() => setVisibility(value)} key={value}>
              <b>{label}</b><span>{detail}</span>
            </button>
          ))}
        </div>
        {visibility === "password" && <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Access password" />}
        <button onClick={() => void saveVisibility()}>SAVE PUBLISHING SETTINGS ↗</button>
      </section>

      <section className="admin-panel">
        <span className="panel-kicker">COMMENTS</span>
        <strong className="panel-number">{visibleComments.length}</strong>
        <p>Visible / {snapshot.comments.length} total</p>
      </section>
      <section className="admin-panel">
        <span className="panel-kicker">VERIFIED USERS</span>
        <strong className="panel-number">{snapshot.users.filter((user) => user.verified).length}</strong>
        <p>{optedIn.length} opted in to email</p>
      </section>

      <section className="admin-panel full">
        <span className="panel-kicker">COMMENT MODERATION</span>
        <h2>Comment moderation</h2>
        <table className="admin-table">
          <thead><tr><th>USER</th><th>SLIDE</th><th>COMMENT</th><th>STATUS</th><th /></tr></thead>
          <tbody>
            {snapshot.comments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.displayName} {comment.verified ? <span className="verified-chip">✓</span> : null}</td>
                <td>{comment.slideId}</td>
                <td>{comment.body}</td>
                <td>{comment.visible ? "VISIBLE" : "HIDDEN"}</td>
                <td><button onClick={() => void toggleComment(comment.id, !comment.visible)}>{comment.visible ? "HIDE" : "RESTORE"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-panel full">
        <span className="panel-kicker">MARKETING / CLOUDFLARE EMAIL SERVICE</span>
        <h2>Follow-up delivery</h2>
        <p>Send to {optedIn.length} opted-in participants. The same signals can support slide-interest segments.</p>
        <input value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Subject" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} aria-label="Message body" />
        <button onClick={() => void sendCampaign()}>SEND FROM newEraPresentation@lvnsk.jp ↗</button>
      </section>

      {status && <section className="admin-panel full"><b>{status}</b></section>}
    </div>
  );
}
