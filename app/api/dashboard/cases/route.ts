import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getDashboardActor } from "@/lib/dashboard/auth";

export async function GET() {
  const actor = await getDashboardActor();
  if (!actor) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue." } }, { status: 401 });
  const db = createSupabaseAdminClient();
  const [{ data: legacyCases, error: legacyError }, { data: platformCases, error: platformError }] = await Promise.all([
    db.from("support_requests").select("id, support_type, urgency, status, preferred_contact_method, preferred_time, created_at, claimed_by, claimed_at, case_summary, staff_members(full_name, role)").order("created_at", { ascending: false }).limit(100),
    db.from("cases").select("id, category, priority, status, created_at, updated_at, case_assignments(staff_id)").order("created_at", { ascending: false }).limit(100),
  ]);
  if (legacyError || platformError) {
    console.error("dashboard_cases_query_failed", legacyError?.message ?? platformError?.message ?? "unknown_error");
    return NextResponse.json({ success: false, error: { code: "CASES_UNAVAILABLE", message: "Cases are temporarily unavailable." } }, { status: 503 });
  }
  const discipline = actor.isAdmin ? null : actor.role;
  const eligibleTypes: Record<string, string[]> = { lawyer: ["legal", "general"], human_rights: ["legal", "general"], counsellor: ["counselling", "general"], healthcare: ["healthcare", "general"], safety_worker: ["safety", "emergency", "general"] };
  const allowedTypes = discipline ? (eligibleTypes[discipline] ?? []) : null;
  const legacy = (legacyCases ?? []).filter((item) => !allowedTypes || item.claimed_by === actor.id || allowedTypes.includes(item.support_type));
  const platform = (platformCases ?? []).map((item) => { const assignment = Array.isArray(item.case_assignments) ? item.case_assignments[0] : item.case_assignments; return { id: item.id, support_type: item.category ?? "general", urgency: item.priority === "urgent" ? "immediate_safety" : item.priority, status: item.status === "awaiting_assignment" ? "pending" : item.status, created_at: item.created_at, claimed_by: assignment?.staff_id ?? null, claimed_at: item.updated_at, case_summary: null, staff_members: null }; }).filter((item) => !allowedTypes || item.claimed_by === actor.id || allowedTypes.includes(item.support_type));
  const cases = [...legacy, ...platform].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()).slice(0, 100);
  return NextResponse.json({ success: true, data: { cases, metrics: { total: cases.length, pending: cases.filter((item) => item.status === "pending").length, urgent: cases.filter((item) => item.urgency === "immediate_safety").length, active: cases.filter((item) => ["accepted", "contacted"].includes(item.status)).length } } });
}

export async function POST(request: Request) {
  const actor = await getDashboardActor();
  if (!actor) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue." } }, { status: 401 });
  const body = await request.json() as { requestId?: string };
  if (!body.requestId) return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "A case is required." } }, { status: 400 });
  const db = createSupabaseAdminClient();
  if (actor.isAdmin) return NextResponse.json({ success: false, error: { code: "ADMIN_CLAIM_NOT_ALLOWED", message: "Admins manage assignment rather than claiming support cases." } }, { status: 403 });
  const { data: platformCase } = await db.from("cases").select("id").eq("id", body.requestId).maybeSingle();
  const { data, error } = platformCase ? await db.rpc("claim_case", { case_id: body.requestId, staff_id: actor.id }) : await db.rpc("claim_support_request", { request_id: body.requestId, staff_id: actor.id });
  if (error) return NextResponse.json({ success: false, error: { code: "CLAIM_FAILED", message: "This case could not be claimed." } }, { status: 409 });
  return NextResponse.json({ success: true, data });
}