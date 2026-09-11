import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const existingToken = request.headers.get("x-anonymous-session");
    let token = existingToken ?? randomUUID();
    let hash = createHash("sha256").update(token).digest("hex");
    const db = createSupabaseAdminClient();
    const existing = await db.from("support_sessions").select("id, expires_at").eq("anonymous_session_hash", hash).maybeSingle();
    if (existing.data && new Date(existing.data.expires_at).getTime() > Date.now()) return NextResponse.json({ success: true, data: { sessionId: existing.data.id, anonymousSession: token } });
    if (existing.data) {
      token = randomUUID();
      hash = createHash("sha256").update(token).digest("hex");
    }
    const { data, error } = await db.from("support_sessions").insert({ anonymous_session_hash: hash, expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: { sessionId: data.id, anonymousSession: token } });
  } catch (error) {
    console.error("support_session_failed", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ success: false, error: { code: "SESSION_UNAVAILABLE", message: "We could not start a private session. Please try again." } }, { status: 503 });
  }
}