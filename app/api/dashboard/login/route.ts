import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hashDashboardToken } from "@/lib/dashboard/auth";

const loginSchema = z.object({ token: z.string().trim().min(1).max(500) });

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_TOKEN", message: "Enter a valid staff access token." } }, { status: 400 });
  const token = parsed.data.token;
  const isAdmin = Boolean(process.env.DASHBOARD_ACCESS_TOKEN && token === process.env.DASHBOARD_ACCESS_TOKEN);
  if (!isAdmin) {
    const db = createSupabaseAdminClient();
    const { data } = await db.from("staff_members").select("id").eq("token_hash", hashDashboardToken(token)).eq("active", true).maybeSingle();
    if (!data) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "That staff token is not active." } }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set("my-right-dashboard", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}