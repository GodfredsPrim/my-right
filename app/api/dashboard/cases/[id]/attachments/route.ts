import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getDashboardActor } from "@/lib/dashboard/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getDashboardActor();
  if (!actor) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue." } }, { status: 401 });
  const { id } = await context.params;
  const db = createSupabaseAdminClient();
  const { data: supportCase } = await db.from("cases").select("id").eq("id", id).maybeSingle();
  if (!supportCase) return NextResponse.json({ success: false, error: { code: "CASE_NOT_FOUND", message: "Case not found." } }, { status: 404 });
  if (!actor.isAdmin) {
    const { data: assignment } = await db.from("case_assignments").select("id").eq("case_id", id).eq("staff_id", actor.id).maybeSingle();
    if (!assignment) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You are not assigned to this case." } }, { status: 403 });
  }
  const { data: attachments, error } = await db.from("support_attachments").select("id, original_filename, mime_type, size_bytes, storage_path, transcript, transcript_status, created_at").eq("case_id", id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: { code: "ATTACHMENTS_UNAVAILABLE", message: "Attachments are temporarily unavailable." } }, { status: 503 });
  const withUrls = await Promise.all((attachments ?? []).map(async (attachment) => {
    const signed = await db.storage.from("support-attachments").createSignedUrl(attachment.storage_path, 300);
    await db.from("audit_logs").insert({ action: "evidence_access", entity: "support_attachment", entity_id: attachment.id, metadata: { actor: actor.name } });
    return { ...attachment, storage_path: undefined, signedUrl: signed.data?.signedUrl ?? null };
  }));
  return NextResponse.json({ success: true, data: withUrls });
}