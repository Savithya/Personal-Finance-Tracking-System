import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("finora_admin_token")?.value;
    if (token) {
      destroyAdminSession(token);
    }

    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete("finora_admin_token");
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
