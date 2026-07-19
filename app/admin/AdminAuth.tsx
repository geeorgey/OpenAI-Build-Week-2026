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
        setStatus(payload.error ?? "Could not sign in.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setStatus("Connection failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="email-auth-form" onSubmit={login}>
      <label className="sr-only" htmlFor="admin-email">Admin ID</label>
      <input
        id="admin-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Admin ID (email address)"
        autoComplete="username"
        required
      />
      <label className="sr-only" htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Judging password"
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "CHECKING…" : "ENTER CONTROL ROOM →"}
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
      {submitting ? "SIGNING OUT…" : "ADMIN SIGN OUT"}
    </button>
  );
}
