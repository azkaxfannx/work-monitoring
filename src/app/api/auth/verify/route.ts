import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/verify — Verify admin password
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const setting = await prisma.appSetting.findUnique({
      where: { key: "admin_password" },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Admin password not configured. Run seed first." },
        { status: 500 },
      );
    }

    const isValid = await bcrypt.compare(password, setting.value);

    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
