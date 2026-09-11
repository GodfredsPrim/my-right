import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type DashboardActor = { id: string; name: string; role: string; email?: string; isAdmin: boolean };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getDashboardActor(): Promise<DashboardActor | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("my-right-dashboard")?.value;
  if (!token) return null;
  if (process.env.DASHBOARD_ACCESS_TOKEN && token === process.env.DASHBOARD_ACCESS_TOKEN) {
    return { id: "super-admin", name: "Super administrator", role: "admin", isAdmin: true };
  }
  const db = createSupabaseAdminClient();
  const { data } = await db.from("staff_members").select("id, full_name, email, role, active").eq("token_hash", hashToken(token)).eq("active", true).maybeSingle();
  if (!data) return null;
  return { id: data.id, name: data.full_name, email: data.email, role: data.role, isAdmin: data.role === "admin" };
}

export function hashDashboardToken(token: string): string {
  return hashToken(token);
}