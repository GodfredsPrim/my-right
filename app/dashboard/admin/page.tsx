"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Staff = { id: string; full_name: string; email: string; organisation: string; role: string; active: boolean };
type Resource = { id: string; name: string; category: string; verification_status: string; active: boolean; country: string };
type CaseItem = { id: string; support_type: string; urgency: string; status: string; created_at: string; claimed_by: string | null; claimed_at: string | null; case_summary?: string | null; staff_members?: { full_name: string; role: string } | null };
type AdminData = { staff: Staff[]; resources: Resource[]; cases: CaseItem[] };

const roles = ["lawyer", "human_rights", "counsellor", "healthcare", "safety_worker", "admin"];

export default function AdminPage() {
  const [data, setData] = useState<AdminData>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [staffForm, setStaffForm] = useState({ fullName: "", email: "", organisation: "", role: "counsellor" });
  const [newToken, setNewToken] = useState("");
  const router = useRouter();

  async function load() {
    const response = await fetch("/api/dashboard/staff");
    const result = await response.json() as { success: boolean; data?: AdminData; error?: { message: string } };
    if (response.status === 401 || response.status === 403) { router.push("/dashboard"); return; }
    if (!result.success || !result.data) setError(result.error?.message ?? "Could not load admin data.");
    else setData(result.data);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function registerStaff(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNewToken("");
    try {
      const response = await fetch("/api/dashboard/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
      const result = await response.json() as { success: boolean; data?: { token: string }; error?: { message: string } };
      if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? "Staff member could not be registered.");
      setNewToken(result.data.token);
      setStaffForm({ fullName: "", email: "", organisation: "", role: "counsellor" });
      await load();
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Staff member could not be registered.");
    } finally { setBusy(false); }
  }

  async function act(entity: "staff" | "resource", id: string, action: string, label: string) {
    if (!window.confirm(`${label}?`)) return;
    setError("");
    const response = await fetch("/api/dashboard/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, id, action }) });
    if (!response.ok) { const result = await response.json() as { error?: { message: string } }; setError(result.error?.message ?? "The action could not be completed."); return; }
    await load();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between py-5"><a href="/dashboard" className="text-sm font-bold tracking-[0.18em]">MY RIGHT / ADMIN</a><a href="/dashboard" className="text-sm font-semibold underline underline-offset-4">Back to dashboard</a></header>
        <div className="border-b border-[var(--line)] py-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Super admin controls</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Run the support network.</h1><p className="mt-3 text-sm text-[var(--ink-muted)]">Register trusted staff, review their work, and keep public resources verified.</p></div>
        {error ? <p className="mt-6 rounded-xl border border-[#efc6b7] bg-[#fff4ef] p-4 text-sm text-[#8e4a2c]" role="alert">{error}</p> : null}
        {newToken ? <div className="mt-6 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-5"><p className="text-sm font-semibold text-[var(--accent-dark)]">Staff member registered. Copy this token now; it will not be shown again.</p><code className="mt-3 block overflow-x-auto rounded-xl bg-white px-4 py-3 text-xs text-[var(--foreground)]">{newToken}</code></div> : null}
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={registerStaff} className="rounded-2xl border border-[var(--line)] bg-white p-5"><h2 className="text-lg font-semibold">Register staff</h2><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Create an account token for a verified professional. Share it through a secure channel.</p><div className="mt-5 space-y-3"><label className="block text-sm font-semibold">Full name<input required value={staffForm.fullName} onChange={(event) => setStaffForm({ ...staffForm, fullName: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="block text-sm font-semibold">Email<input required type="email" value={staffForm.email} onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="block text-sm font-semibold">Organisation<input required value={staffForm.organisation} onChange={(event) => setStaffForm({ ...staffForm, organisation: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="block text-sm font-semibold">Role<select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]">{roles.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select></label></div><button disabled={busy} className="mt-5 h-12 w-full rounded-full bg-[var(--accent)] font-semibold text-white disabled:opacity-60">{busy ? "Registering..." : "Register staff member"}</button></form>
          <section className="rounded-2xl border border-[var(--line)] bg-white"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h2 className="text-lg font-semibold">Staff access</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Activate or pause staff access.</p></div><button onClick={() => void load()} className="text-sm font-semibold text-[var(--accent)]">Refresh</button></div><div className="divide-y divide-[var(--line)]">{data?.staff.map((member) => <div key={member.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{member.full_name}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{member.organisation} · {member.email}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-dark)]">{member.active ? member.role : "inactive"}</span><button onClick={() => void act("staff", member.id, member.active ? "deactivate" : "activate", `${member.active ? "Deactivate" : "Activate"} ${member.full_name}`)} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">{member.active ? "Deactivate" : "Activate"}</button></div></div>)}{data && data.staff.length === 0 ? <div className="p-8 text-sm text-[var(--ink-muted)]">No staff accounts configured.</div> : null}</div></section>
        </section>
        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white"><div className="border-b border-[var(--line)] p-5"><h2 className="text-lg font-semibold">Case activity</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Review cases claimed or completed by staff without exposing unnecessary conversation content.</p></div><div className="divide-y divide-[var(--line)]">{data?.cases.map((item) => <div key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-dark)]">{item.support_type}</span><span className="rounded-full bg-[#f1f4f2] px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">{item.status}</span><span className="rounded-full bg-[#fff0e5] px-3 py-1 text-xs font-semibold text-[#8e4a2c]">{item.urgency.replaceAll("_", " ")}</span></div><p className="mt-3 text-sm font-semibold">Case {item.id.slice(0, 8)}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">Created {new Date(item.created_at).toLocaleString()} {item.staff_members ? `· ${item.staff_members.full_name} (${item.staff_members.role})` : "· Unassigned"}</p></div><span className="text-xs text-[var(--ink-muted)]">{item.claimed_at ? `Claimed ${new Date(item.claimed_at).toLocaleDateString()}` : "Awaiting assignment"}</span></div>)}{data && data.cases.length === 0 ? <div className="p-10 text-center text-sm text-[var(--ink-muted)]">No cases have been created yet.</div> : null}</div></section>
        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white"><div className="border-b border-[var(--line)] p-5"><h2 className="text-lg font-semibold">Resource verification</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Verify resources, then publish them to users.</p></div><div className="divide-y divide-[var(--line)]">{data?.resources.map((resource) => <div key={resource.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{resource.name}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{resource.category} · {resource.country}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[#fff0e5] px-3 py-1 text-xs font-semibold text-[#8e4a2c]">{resource.verification_status}</span>{resource.verification_status === "verified" ? <button onClick={() => void act("resource", resource.id, resource.active ? "unpublish" : "publish", `${resource.active ? "Unpublish" : "Publish"} ${resource.name}`)} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">{resource.active ? "Unpublish" : "Publish"}</button> : <button onClick={() => void act("resource", resource.id, "verify", `Verify ${resource.name}`)} className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white">Verify</button>}</div></div>)}</div></section>
      </div>
    </main>
  );
}
