"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/dashboard/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (response.ok) router.push("/dashboard");
    else { const result = await response.json() as { error?: { message?: string } }; setError(result.error?.message ?? "Sign in failed."); setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5"><form onSubmit={signIn} className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[0_20px_70px_rgba(18,51,42,0.08)]"><Link href="/" className="text-sm font-bold tracking-[0.18em]">MY RIGHT</Link><p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Staff workspace</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Sign in securely.</h1><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Use the access token issued by a MY RIGHT administrator. Never share it through chat or email.</p><label className="mt-8 block text-sm font-semibold" htmlFor="token">Staff access token</label><input id="token" type="password" value={token} onChange={(event) => setToken(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--line)] px-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" autoComplete="current-password" />{error ? <p className="mt-3 text-sm text-[#8e4a2c]" role="alert">{error}</p> : null}<button disabled={busy} className="mt-6 h-12 w-full rounded-full bg-[var(--accent)] font-semibold text-white disabled:opacity-60">{busy ? "Checking..." : "Open workspace"}</button></form></main>;
}