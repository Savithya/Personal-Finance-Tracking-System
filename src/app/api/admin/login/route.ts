import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { password, username = "admin" } = await req.json();

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      // Add slight delay to thwart brute force
      await new Promise((res) => setTimeout(res, 600));
      return NextResponse.json({ success: false, error: "Invalid administrator credentials" }, { status: 401 });
    }

    const token = createAdminSession(username);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("finora_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60, // 12 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
