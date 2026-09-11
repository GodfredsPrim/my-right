import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({ sessionId: z.string().uuid(), method: z.enum(["phone", "email"]), value: z.string().trim().min(5).max(160), consent: z.literal(true) });

export async function POST(request: Request) {
  try {
    const token = request.headers.get("x-anonymous-session");
    const parsed = schema.safeParse(await request.json());
    if (!token || !parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_CONTACT_REQUEST", message: "Choose a valid contact method and confirm consent." } }, { status: 400 });
    if (parsed.data.method === "email" && !z.string().email().safeParse(parsed.data.value).success) return NextResponse.json({ success: false, error: { code: "INVALID_EMAIL", message: "Enter a valid email address." } }, { status: 400 });
    const db = createSupabaseAdminClient();
    const sessionHash = createHash("sha256").update(token).digest("hex");
    const { data: session } = await db.from("support_sessions").select("id, expires_at").eq("id", parsed.data.sessionId).eq("anonymous_session_hash", sessionHash).maybeSingle();
    if (!session || new Date(session.expires_at).getTime() <= Date.now()) return NextResponse.json({ success: false, error: { code: "SESSION_NOT_FOUND", message: "This support session has expired." } }, { status: 404 });
    const { data, error } = await db.from("contact_requests").insert({ session_id: parsed.data.sessionId, contact_method: parsed.data.method, contact_value: parsed.data.value, consent: true }).select("id, created_at").single();
    if (error) throw error;
    await db.from("support_sessions").update({ human_followup_requested: true, contact_method: parsed.data.method }).eq("id", parsed.data.sessionId);
    const referenceCode = `MR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data: supportCase, error: caseError } = await db.from("cases").insert({ session_id: parsed.data.sessionId, status: "awaiting_assignment", priority: "medium", category: "general", reference_code: referenceCode }).select("id, reference_code").single();
    if (caseError) throw caseError;
    await db.from("support_attachments").update({ case_id: supportCase.id }).eq("session_id", parsed.data.sessionId).is("case_id", null);
    return NextResponse.json({ success: true, data: { ...data, case: supportCase } });
  } catch (error) {
    console.error("contact_request_failed", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ success: false, error: { code: "CONTACT_REQUEST_FAILED", message: "We could not save your follow-up request. Please try again." } }, { status: 503 });
  }
}