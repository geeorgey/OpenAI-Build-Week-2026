"use client";

import { useState } from "react";

export function AccessPrompt() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const unlock = async () => {
    setError("");
    const response = await fetch("/api/access/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) window.location.reload();
    else setError("パスワードが違います。");
  };
  return (
    <div className="join-panel" style={{ maxWidth: 560, marginTop: 34 }}>
      <span className="surface-eyebrow">PASSWORD PROTECTED</span>
      <h2>限定公開プレゼン</h2>
      <div className="email-auth-form">
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="パスワード" />
        <button onClick={() => void unlock()} disabled={!password}>プレゼンを開く ↗</button>
        {error && <small>{error}</small>}
      </div>
    </div>
  );
}
