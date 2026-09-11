import { NextResponse } from "next/server";
import { getDashboardActor } from "@/lib/dashboard/auth";

export async function GET() {
  const actor = await getDashboardActor();
  if (!actor) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue." } }, { status: 401 });
  return NextResponse.json({ success: true, data: actor });
}