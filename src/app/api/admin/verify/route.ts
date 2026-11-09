import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("finora_admin_token")?.value;
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || authHeader;

    const isValid = validateAdminSession(token);
    if (!isValid) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: "admin" });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
