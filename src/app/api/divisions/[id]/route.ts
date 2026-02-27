import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/divisions/[id] — Update division name
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama divisi wajib diisi" },
        { status: 400 },
      );
    }

    const division = await prisma.division.update({
      where: { id },
      data: { name: name.trim() },
      include: {
        columns: { orderBy: { order: "asc" } },
        rows: {
          include: { cells: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (global.io) {
      global.io.emit("division:updated", division);
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("PUT /api/divisions/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate divisi" },
      { status: 500 },
    );
  }
}

// DELETE /api/divisions/[id] — Delete a division
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.division.delete({ where: { id } });

    if (global.io) {
      global.io.emit("division:deleted", { id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/divisions/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus divisi" },
      { status: 500 },
    );
  }
}
