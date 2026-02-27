import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/divisions/[id]/columns — Create a column
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;
    const { name, type, options } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama kolom wajib diisi" },
        { status: 400 },
      );
    }

    // Validate column type
    const validTypes = ["TEXT", "NUMBER", "DATE", "DROPDOWN"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipe kolom tidak valid" },
        { status: 400 },
      );
    }

    // Get the next order number
    const maxOrder = await prisma.column.aggregate({
      where: { divisionId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Create the column
    const column = await prisma.column.create({
      data: {
        divisionId,
        name: name.trim(),
        type: type || "TEXT",
        options: options || null,
        order: nextOrder,
      },
    });

    // Create empty CellValues for all existing rows in this division
    const existingRows = await prisma.row.findMany({
      where: { divisionId },
      select: { id: true },
    });

    if (existingRows.length > 0) {
      await prisma.cellValue.createMany({
        data: existingRows.map((row: { id: string }) => ({
          rowId: row.id,
          columnId: column.id,
          value: "",
        })),
      });
    }

    // Fetch the full updated division data
    const division = await prisma.division.findUnique({
      where: { id: divisionId },
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

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error("POST /api/divisions/[id]/columns error:", error);
    return NextResponse.json({ error: "Gagal membuat kolom" }, { status: 500 });
  }
}

// PUT /api/divisions/[id]/columns — Update a column
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;
    const { columnId, name, type, options, order } = await req.json();

    if (!columnId) {
      return NextResponse.json(
        { error: "Column ID is required" },
        { status: 400 },
      );
    }

    // Validate column belongs to this division
    const existingCol = await prisma.column.findFirst({
      where: { id: columnId, divisionId },
    });
    if (!existingCol) {
      return NextResponse.json(
        { error: "Column not found in this division" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (options !== undefined) updateData.options = options;
    if (order !== undefined) updateData.order = order;

    await prisma.column.update({
      where: { id: columnId },
      data: updateData,
    });

    const division = await prisma.division.findUnique({
      where: { id: divisionId },
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
    console.error("PUT /api/divisions/[id]/columns error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate kolom" },
      { status: 500 },
    );
  }
}

// DELETE /api/divisions/[id]/columns — Delete a column
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;
    const { columnId } = await req.json();

    if (!columnId) {
      return NextResponse.json(
        { error: "ID kolom wajib diisi" },
        { status: 400 },
      );
    }

    // Validate column belongs to this division
    const existingCol = await prisma.column.findFirst({
      where: { id: columnId, divisionId },
    });
    if (!existingCol) {
      return NextResponse.json(
        { error: "Kolom tidak ditemukan di divisi ini" },
        { status: 404 },
      );
    }

    await prisma.column.delete({ where: { id: columnId } });

    const division = await prisma.division.findUnique({
      where: { id: divisionId },
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
    console.error("DELETE /api/divisions/[id]/columns error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kolom" },
      { status: 500 },
    );
  }
}
