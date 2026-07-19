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
    else setError("That password is incorrect.");
  };
  return (
    <div className="join-panel" style={{ maxWidth: 560, marginTop: 34 }}>
      <span className="surface-eyebrow">PASSWORD PROTECTED</span>
      <h2>Limited-access presentation</h2>
      <div className="email-auth-form">
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        <button onClick={() => void unlock()} disabled={!password}>OPEN PRESENTATION ↗</button>
        {error && <small>{error}</small>}
      </div>
    </div>
  );
}
