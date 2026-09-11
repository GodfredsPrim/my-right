"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Actor = { name: string; role: string; isAdmin: boolean };
type CaseItem = { id: string; support_type: string; urgency: string; status: string; created_at: string; claimed_by: string | null; staff_members?: { full_name: string; role: string } | null };
type Attachment = { id: string; original_filename: string; mime_type: string; signedUrl: string | null; transcript: string | null; transcript_status: string };
type DashboardData = { cases: CaseItem[]; metrics: { total: number; pending: number; urgent: number; active: number } };

export default function DashboardPage() {
  const [actor, setActor] = useState<Actor>();
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState("");
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const router = useRouter();

  async function load() {
    const me = await fetch("/api/dashboard/me");
    if (!me.ok) { router.push("/dashboard/login"); return; }
    const meResult = await me.json() as { data: Actor };
    const casesResponse = await fetch("/api/dashboard/cases");
    const casesResult = await casesResponse.json() as { success: boolean; data?: DashboardData; error?: { message: string } };
    if (!casesResponse.ok || !casesResult.data) { setError(casesResult.error?.message ?? "Could not load cases."); return; }
    setActor(meResult.data);
    setData(casesResult.data);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function claim(id: string) {
    setClaiming(id);
    const response = await fetch("/api/dashboard/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id }) });
    if (!response.ok) setError("This case was claimed by someone else or is no longer available.");
    await load();
    setClaiming("");
  }

  async function logout() { await fetch("/api/dashboard/logout", { method: "POST" }); router.push("/dashboard/login"); }

  async function loadAttachments(caseId: string) {
    const response = await fetch(`/api/dashboard/cases/${caseId}/attachments`);
    const result = await response.json() as { success: boolean; data?: Attachment[]; error?: { message: string } };
    if (!response.ok || !result.data) { setError(result.error?.message ?? "Attachments are unavailable."); return; }
    setAttachments((current) => ({ ...current, [caseId]: result.data ?? [] }));
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between py-5"><a href="/" className="text-sm font-bold tracking-[0.18em]">MY RIGHT</a><div className="flex items-center gap-4"><span className="hidden text-sm text-[var(--ink-muted)] sm:block">{actor?.name ?? "Loading workspace"}</span><button onClick={logout} className="text-sm font-semibold underline underline-offset-4">Sign out</button></div></header>
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-8 pt-10 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{actor?.isAdmin ? "Super admin" : "Staff workspace"}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Good to see you.</h1><p className="mt-3 text-sm text-[var(--ink-muted)]">Handle support requests with care and only the access you need.</p></div>{actor?.isAdmin ? <a href="/dashboard/admin" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,107,95,0.16)]">Admin controls →</a> : null}</div>
        {error ? <div className="mt-6 rounded-xl border border-[#efc6b7] bg-[#fff4ef] p-4 text-sm text-[#8e4a2c]" role="alert">{error}</div> : null}
        <section className="mt-8 grid gap-4 sm:grid-cols-4">{[["Total cases", data?.metrics.total ?? 0], ["Awaiting help", data?.metrics.pending ?? 0], ["Urgent", data?.metrics.urgent ?? 0], ["Active follow-up", data?.metrics.active ?? 0]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[var(--line)] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">{label}</p><p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{value}</p></div>)}</section>
        <section className="mt-10 rounded-2xl border border-[var(--line)] bg-white"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h2 className="text-lg font-semibold">Available support requests</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Sensitive details remain hidden until you are assigned.</p></div><button onClick={() => void load()} className="text-sm font-semibold text-[var(--accent)]">Refresh</button></div><div className="divide-y divide-[var(--line)]">{data?.cases.map((item) => <div key={item.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-dark)]">{item.support_type}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.urgency === "immediate_safety" ? "bg-[#fff0e5] text-[#8e4a2c]" : "bg-[#f1f4f2] text-[var(--ink-muted)]"}`}>{item.urgency.replaceAll("_", " ")}</span></div><p className="mt-3 text-sm font-semibold">Request {item.id.slice(0, 8)}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{new Date(item.created_at).toLocaleString()} · {item.status}</p></div><div className="flex items-center gap-3">{item.status === "pending" && !item.claimed_by && !actor?.isAdmin ? <button onClick={() => void claim(item.id)} disabled={claiming === item.id} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{claiming === item.id ? "Claiming..." : "Claim case"}</button> : <span className="text-sm text-[var(--ink-muted)]">{item.staff_members?.full_name ?? (item.claimed_by ? "Assigned" : "Admin queue")}</span>}{(item.claimed_by || actor?.isAdmin) ? <button onClick={() => void loadAttachments(item.id)} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">Audio & files</button> : null}</div></div>{attachments[item.id]?.map((attachment) => <div key={attachment.id} className="mt-4 rounded-xl bg-[#f7faf7] p-4"><p className="text-xs font-semibold">{attachment.original_filename}</p>{attachment.mime_type.startsWith("audio/") && attachment.signedUrl ? <audio className="mt-3 w-full" controls src={attachment.signedUrl}>Your browser does not support audio playback.</audio> : null}<p className="mt-2 text-xs text-[var(--ink-muted)]">{attachment.transcript_status === "ready" ? "Transcript available, verify against original audio." : "Original file preserved. Transcript is not available."}</p>{attachment.transcript ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{attachment.transcript}</p> : null}</div>)}</div>)}{data && data.cases.length === 0 ? <div className="p-10 text-center text-sm text-[var(--ink-muted)]">No support requests yet.</div> : null}</div></section>
      </div>
    </main>
  );
}
