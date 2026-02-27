import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/divisions/[id]/rows — Create a new row with empty cells
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;

    // Get all columns for this division
    const columns = await prisma.column.findMany({
      where: { divisionId },
      select: { id: true },
    });

    // Create the row with empty cells for each column
    const row = await prisma.row.create({
      data: {
        divisionId,
        cells: {
          create: columns.map((col: { id: string }) => ({
            columnId: col.id,
            value: "",
          })),
        },
      },
      include: {
        cells: true,
      },
    });

    if (global.io) {
      global.io.emit("row:created", { divisionId, row });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("POST /api/divisions/[id]/rows error:", error);
    return NextResponse.json({ error: "Gagal membuat baris" }, { status: 500 });
  }
}

// PUT /api/divisions/[id]/rows — Update cell values
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;
    const { rowId, cells } = await req.json();

    if (!rowId || !cells || !Array.isArray(cells)) {
      return NextResponse.json(
        { error: "rowId dan cells wajib diisi" },
        { status: 400 },
      );
    }

    // Validate row belongs to this division
    const existingRow = await prisma.row.findFirst({
      where: { id: rowId, divisionId },
    });
    if (!existingRow) {
      return NextResponse.json(
        { error: "Baris tidak ditemukan di divisi ini" },
        { status: 404 },
      );
    }

    // Upsert each cell value in a single transaction
    await prisma.$transaction(
      (cells as { columnId: string; value: string }[]).map((cell) =>
        prisma.cellValue.upsert({
          where: {
            rowId_columnId: {
              rowId,
              columnId: cell.columnId,
            },
          },
          update: { value: cell.value },
          create: {
            rowId,
            columnId: cell.columnId,
            value: cell.value,
          },
        }),
      ),
    );

    // Fetch updated row
    const row = await prisma.row.findUnique({
      where: { id: rowId },
      include: { cells: true },
    });

    if (global.io) {
      global.io.emit("row:updated", { divisionId, row });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("PUT /api/divisions/[id]/rows error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate baris" },
      { status: 500 },
    );
  }
}

// DELETE /api/divisions/[id]/rows — Delete a row
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: divisionId } = await params;
    const { rowId } = await req.json();

    if (!rowId) {
      return NextResponse.json({ error: "rowId wajib diisi" }, { status: 400 });
    }

    // Validate row belongs to this division
    const existingRow = await prisma.row.findFirst({
      where: { id: rowId, divisionId },
    });
    if (!existingRow) {
      return NextResponse.json(
        { error: "Row not found in this division" },
        { status: 404 },
      );
    }

    await prisma.row.delete({ where: { id: rowId } });

    if (global.io) {
      global.io.emit("row:deleted", { divisionId, rowId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/divisions/[id]/rows error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus baris" },
      { status: 500 },
    );
  }
}
