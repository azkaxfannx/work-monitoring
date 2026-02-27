import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/divisions — Fetch all divisions with columns and rows
export async function GET() {
  try {
    const divisions = await prisma.division.findMany({
      include: {
        columns: {
          orderBy: { order: "asc" },
        },
        rows: {
          include: {
            cells: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(divisions);
  } catch (error) {
    console.error("GET /api/divisions error:", error);
    return NextResponse.json({ error: "Gagal memuat divisi" }, { status: 500 });
  }
}

// POST /api/divisions — Create a new division
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama divisi wajib diisi" },
        { status: 400 },
      );
    }

    const division = await prisma.division.create({
      data: { name: name.trim() },
      include: {
        columns: true,
        rows: {
          include: { cells: true },
        },
      },
    });

    // Broadcast to all connected clients
    if (global.io) {
      global.io.emit("division:created", division);
    }

    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    console.error("POST /api/divisions error:", error);
    return NextResponse.json(
      { error: "Gagal membuat divisi" },
      { status: 500 },
    );
  }
}
