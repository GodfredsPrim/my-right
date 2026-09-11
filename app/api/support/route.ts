import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deepSeekProvider } from "@/lib/ai/deepseek";
import { sanitizeForAI, type AIMessage } from "@/lib/ai/provider";
import { languageName } from "@/lib/i18n";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  sessionId: z.string().uuid().optional(),
  language: z.string().optional(),
});

function sessionHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Please enter a shorter message." } }, { status: 400 });

    const db = createSupabaseAdminClient();
    let token = request.headers.get("x-anonymous-session") ?? randomUUID();
    let hash = sessionHash(token);
    let sessionId = parsed.data.sessionId;
    if (sessionId) {
      const { data } = await db.from("support_sessions").select("id, expires_at").eq("id", sessionId).eq("anonymous_session_hash", hash).maybeSingle();
      if (!data || new Date(data.expires_at).getTime() <= Date.now()) {
        sessionId = undefined;
        token = randomUUID();
        hash = sessionHash(token);
      }
    }
    if (!sessionId) {
      const { data, error } = await db.from("support_sessions").insert({ anonymous_session_hash: hash, expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() }).select("id").single();
      if (error) throw error;
      sessionId = data.id;
    }

    let { data: conversation } = await db.from("conversations").select("id").eq("session_id", sessionId).limit(1).maybeSingle();
    if (!conversation) {
      const { data, error } = await db.from("conversations").insert({ session_id: sessionId }).select("id").single();
      if (error) throw error;
      conversation = data;
    }
    const content = sanitizeForAI(parsed.data.message);
    const { error: messageError } = await db.from("messages").insert({ conversation_id: conversation.id, role: "user", content });
    if (messageError) throw messageError;
    const { data: history, error: historyError } = await db.from("messages").select("role, content").eq("conversation_id", conversation.id).order("created_at", { ascending: true }).limit(30);
    if (historyError) throw historyError;
    const messages = (history ?? []) as AIMessage[];
    const { data: resources } = await db.from("support_resources").select("name, description, phone, website, category, location").eq("active", true).eq("verification_status", "verified").not("verified_at", "is", null).limit(12);
    const resourceText = (resources ?? []).map((resource) => Object.values(resource).filter(Boolean).join(" | "));
    const reply = await deepSeekProvider.generateResponse({ messages: [{ role: "system", content: `Reply in ${languageName(parsed.data.language ?? "en")}. Keep the response simple and culturally respectful.` }, ...messages], resources: resourceText });
    await db.from("messages").insert({ conversation_id: conversation.id, role: "assistant", content: reply });
    const assessment = await deepSeekProvider.assessSafety({ messages });
    const userMessageCount = messages.filter((item) => item.role === "user").length;
    const followupEligible = userMessageCount >= 3 && assessment.professionalSupportRecommended;
    return NextResponse.json({ success: true, data: { sessionId, reply, assessment, followupEligible, anonymousSession: token } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("support_request_failed", detail);
    return NextResponse.json({ success: false, error: { code: "SUPPORT_UNAVAILABLE", message: "Support is temporarily unavailable. Please try again." } }, { status: 503 });
  }
}