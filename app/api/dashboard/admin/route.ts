import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getDashboardActor } from "@/lib/dashboard/auth";

const actionSchema = z.object({
  entity: z.enum(["staff", "resource"]),
  id: z.string().uuid(),
  action: z.enum(["activate", "deactivate", "verify", "unverify", "publish", "unpublish"]),
});

export async function PATCH(request: Request) {
  const actor = await getDashboardActor();
  if (!actor?.isAdmin) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "That admin action is not available." } }, { status: 400 });

  const { entity, id, action } = parsed.data;
  const db = createSupabaseAdminClient();
  if (entity === "staff" && !["activate", "deactivate"].includes(action)) return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Staff can only be activated or deactivated here." } }, { status: 400 });
  if (entity === "resource" && !["verify", "unverify", "publish", "unpublish"].includes(action)) return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "That resource action is not available." } }, { status: 400 });

  const update = entity === "staff"
    ? { active: action === "activate" }
    : action === "verify" ? { verification_status: "verified", verified_at: new Date().toISOString() }
      : action === "unverify" ? { verification_status: "unverified", verified_at: null }
        : { active: action === "publish" };
  const table = entity === "staff" ? "staff_members" : "support_resources";
  const { data, error } = await db.from(table).update(update).eq("id", id).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ success: false, error: { code: "UPDATE_FAILED", message: "The record could not be updated." } }, { status: 409 });
  await db.from("audit_logs").insert({ action: `dashboard_${action}`, entity, entity_id: id, metadata: { actor: actor.name } });
  return NextResponse.json({ success: true, data });
}