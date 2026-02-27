import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT /api/settings/password — Change admin password
export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan baru wajib diisi" },
        { status: 400 },
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password minimal 4 karakter" },
        { status: 400 },
      );
    }

    const setting = await prisma.appSetting.findUnique({
      where: { key: "admin_password" },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Password admin belum dikonfigurasi" },
        { status: 500 },
      );
    }

    const isValid = await bcrypt.compare(currentPassword, setting.value);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 401 },
      );
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);
    await prisma.appSetting.update({
      where: { key: "admin_password" },
      data: { value: hashedNew },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/settings/password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
