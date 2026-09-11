import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getDashboardActor } from "@/lib/dashboard/auth";

export async function GET() {
  const actor = await getDashboardActor();
  if (!actor?.isAdmin) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
  const db = createSupabaseAdminClient();
  const [{ data: staff, error: staffError }, { data: resources, error: resourceError }, { data: cases, error: casesError }] = await Promise.all([
    db.from("staff_members").select("id, full_name, email, organisation, role, active, created_at, last_seen_at").order("created_at", { ascending: false }),
    db.from("support_resources").select("id, name, category, verification_status, active, verified_at, country, region").order("created_at", { ascending: false }).limit(100),
    db.from("support_requests").select("id, support_type, urgency, status, created_at, claimed_by, claimed_at, case_summary, staff_members(full_name, role)").order("created_at", { ascending: false }).limit(200),
  ]);
  if (staffError || resourceError || casesError) return NextResponse.json({ success: false, error: { code: "ADMIN_DATA_UNAVAILABLE", message: "Admin data is temporarily unavailable." } }, { status: 503 });
  return NextResponse.json({ success: true, data: { staff: staff ?? [], resources: resources ?? [], cases: cases ?? [] } });
}

const staffSchema = z.object({ fullName: z.string().trim().min(2).max(120), email: z.string().trim().email().max(180), organisation: z.string().trim().min(2).max(160), role: z.enum(["lawyer", "human_rights", "counsellor", "healthcare", "safety_worker", "admin"]) });

export async function POST(request: Request) {
  const actor = await getDashboardActor();
  if (!actor?.isAdmin) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
  const parsed = staffSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_STAFF", message: "Complete all staff fields with a valid email." } }, { status: 400 });
  const token = `mr_staff_${randomBytes(24).toString("hex")}`;
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("staff_members").insert({ full_name: parsed.data.fullName, email: parsed.data.email, organisation: parsed.data.organisation, role: parsed.data.role, token_hash: createHash("sha256").update(token).digest("hex") }).select("id, full_name, email, organisation, role, active, created_at").single();
  if (error) return NextResponse.json({ success: false, error: { code: "STAFF_CREATE_FAILED", message: error.code === "23505" ? "A staff member with that email already exists." : "Staff member could not be created." } }, { status: 409 });
  return NextResponse.json({ success: true, data: { staff: data, token } }, { status: 201 });
}