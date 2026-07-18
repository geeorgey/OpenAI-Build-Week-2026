"use client";

import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setStatus(payload.error ?? "ログインできませんでした。");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setStatus("通信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="email-auth-form" onSubmit={login}>
      <label className="sr-only" htmlFor="admin-email">管理者ID</label>
      <input
        id="admin-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="管理者ID（メールアドレス）"
        autoComplete="username"
        required
      />
      <label className="sr-only" htmlFor="admin-password">パスワード</label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="審査用パスワード"
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "確認しています…" : "コントロールルームへ →"}
      </button>
      {status && <p className="auth-error" role="alert">{status}</p>}
    </form>
  );
}

export function AdminLogoutButton() {
  const [submitting, setSubmitting] = useState(false);

  const logout = async () => {
    setSubmitting(true);
    await fetch("/api/auth/admin/logout", { method: "POST" });
    window.location.assign("/admin");
  };

  return (
    <button className="admin-logout" type="button" onClick={() => void logout()} disabled={submitting}>
      {submitting ? "終了中…" : "管理者ログアウト"}
    </button>
  );
}
