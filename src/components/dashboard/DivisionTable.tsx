"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, FileText } from "lucide-react";
import CellEditor from "./CellEditor";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { Column, RowWithCells } from "@/types";

// ─── Default widths per column type ──────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
  TEXT: 280,
  NUMBER: 140,
  DATE: 170,
  DROPDOWN: 180,
};

const MIN_COL_WIDTH = 80;

function getStorageKey(divisionId: string) {
  return `col-widths-${divisionId}`;
}

function loadWidths(divisionId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(getStorageKey(divisionId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWidths(divisionId: string, widths: Record<string, number>) {
  try {
    localStorage.setItem(getStorageKey(divisionId), JSON.stringify(widths));
  } catch {
    // ignore
  }
}

interface DivisionTableProps {
  divisionId: string;
  columns: Column[];
  rows: RowWithCells[];
  onUpdateCell: (
    rowId: string,
    columnId: string,
    value: string,
  ) => Promise<void> | void;
  onDeleteRow: (rowId: string) => Promise<void> | void;
}

export default function DivisionTable({
  divisionId,
  columns,
  rows,
  onUpdateCell,
  onDeleteRow,
}: DivisionTableProps) {
  const confirm = useConfirm();

  // ─── Column widths state (persisted per division) ────────────
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const saved = loadWidths(divisionId);
    const result: Record<string, number> = {};
    for (const col of columns) {
      result[col.id] = saved[col.id] ?? DEFAULT_WIDTHS[col.type] ?? 180;
    }
    return result;
  });

  // Sync when columns change (new columns added etc.)
  useEffect(() => {
    setColWidths((prev) => {
      const saved = loadWidths(divisionId);
      const result: Record<string, number> = {};
      for (const col of columns) {
        result[col.id] =
          prev[col.id] ?? saved[col.id] ?? DEFAULT_WIDTHS[col.type] ?? 180;
      }
      return result;
    });
  }, [columns, divisionId]);

  // ─── Resize drag logic ───────────────────────────────────────
  const dragRef = useRef<{
    colId: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [resizingCol, setResizingCol] = useState<string | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, colId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const startWidth = colWidths[colId] ?? 180;
      dragRef.current = { colId, startX: e.clientX, startWidth };
      setResizingCol(colId);
    },
    [colWidths],
  );

  useEffect(() => {
    if (!resizingCol) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const diff = e.clientX - dragRef.current.startX;
      const newWidth = Math.max(
        MIN_COL_WIDTH,
        dragRef.current.startWidth + diff,
      );
      setColWidths((prev) => ({
        ...prev,
        [dragRef.current!.colId]: newWidth,
      }));
    };

    const onMouseUp = () => {
      if (dragRef.current) {
        // Save to localStorage
        setColWidths((prev) => {
          saveWidths(divisionId, prev);
          return prev;
        });
      }
      dragRef.current = null;
      setResizingCol(null);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizingCol, divisionId]);

  // ─── Empty columns state ─────────────────────────────────────
  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
        <svg
          width="40"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          className="text-gray-300"
        >
          <path d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
        </svg>
        <p className="text-sm">
          Belum ada kolom. Tambahkan kolom di{" "}
          <span className="font-medium text-gray-500">Settings</span>.
        </p>
      </div>
    );
  }

  const getCellValue = (row: RowWithCells, columnId: string): string => {
    const cell = row.cells.find((c) => c.columnId === columnId);
    return cell?.value ?? "";
  };

  // Total table width
  const totalWidth =
    40 + // # column
    columns.reduce((sum, col) => sum + (colWidths[col.id] ?? 180), 0) +
    40; // delete column

  return (
    <div
      className="overflow-x-auto rounded-lg"
      style={resizingCol ? { userSelect: "none" } : undefined}
    >
      <table
        className="w-full"
        style={{ minWidth: totalWidth, tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: 40 }} />
          {columns.map((col) => (
            <col key={col.id} style={{ width: colWidths[col.id] ?? 180 }} />
          ))}
          <col style={{ width: 40 }} />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50/80">
            <th className="px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="group/th relative px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                  <span className="truncate">{col.name}</span>
                  <span className="shrink-0 rounded bg-gray-200/70 px-1 py-0.5 text-[10px] font-normal normal-case text-gray-400">
                    {col.type.toLowerCase()}
                  </span>
                </div>
                {/* Resize handle — always-visible border line */}
                <div
                  onMouseDown={(e) => onMouseDown(e, col.id)}
                  className={`absolute top-0 -right-px z-10 flex h-full w-[9px] cursor-col-resize items-center justify-center ${
                    resizingCol === col.id
                      ? "bg-blue-100/60"
                      : "hover:bg-blue-100/60"
                  }`}
                  title="Seret untuk mengubah lebar kolom"
                >
                  <div
                    className={`h-3/5 w-[2px] rounded-full transition-colors ${
                      resizingCol === col.id
                        ? "bg-blue-500"
                        : "bg-gray-300 group-hover/th:bg-gray-400"
                    }`}
                  />
                </div>
              </th>
            ))}
            <th className="px-2 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="py-8 text-center text-sm text-gray-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <FileText size={28} className="text-gray-300" />
                  <span>Belum ada data.</span>
                  <span className="text-xs text-gray-300">
                    Klik &quot;Tambah Baris&quot; untuk mulai mengisi.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={`group border-b border-gray-100 transition-colors hover:bg-blue-50/40 ${
                  idx % 2 === 1 ? "bg-gray-50/40" : ""
                }`}
              >
                <td className="px-2 py-1.5 text-xs font-medium text-gray-400">
                  {idx + 1}
                </td>
                {columns.map((col, colIdx) => (
                  <td
                    key={col.id}
                    className="px-1 py-1"
                    data-cell={`${idx}-${colIdx}`}
                  >
                    <CellEditor
                      column={col}
                      value={getCellValue(row, col.id)}
                      onSave={(value) => onUpdateCell(row.id, col.id, value)}
                      onTabNext={() => {
                        // Find next cell: next column in same row, or first column in next row
                        const nextColIdx = colIdx + 1;
                        const nextRowIdx = idx;
                        let target: string;
                        if (nextColIdx < columns.length) {
                          target = `${nextRowIdx}-${nextColIdx}`;
                        } else if (idx + 1 < rows.length) {
                          target = `${nextRowIdx + 1}-0`;
                        } else {
                          return; // last cell
                        }
                        // Click the next cell to enter edit mode
                        const el = document.querySelector(
                          `[data-cell="${target}"]`,
                        ) as HTMLElement | null;
                        el?.querySelector<HTMLElement>(
                          "textarea, input, select, [title*='Klik']",
                        )?.click();
                      }}
                      onTabPrev={() => {
                        const prevColIdx = colIdx - 1;
                        const prevRowIdx = idx;
                        let target: string;
                        if (prevColIdx >= 0) {
                          target = `${prevRowIdx}-${prevColIdx}`;
                        } else if (idx - 1 >= 0) {
                          target = `${prevRowIdx - 1}-${columns.length - 1}`;
                        } else {
                          return; // first cell
                        }
                        const el = document.querySelector(
                          `[data-cell="${target}"]`,
                        ) as HTMLElement | null;
                        el?.querySelector<HTMLElement>(
                          "textarea, input, select, [title*='Klik']",
                        )?.click();
                      }}
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Hapus Baris?",
                        message:
                          "Baris ini beserta semua datanya akan dihapus permanen.",
                        confirmLabel: "Ya, Hapus",
                        variant: "danger",
                      });
                      if (ok) onDeleteRow(row.id);
                    }}
                    className="rounded p-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Hapus baris"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
