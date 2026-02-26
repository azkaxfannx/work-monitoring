"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import CellEditor from "./CellEditor";
import type { Column, RowWithCells } from "@/types";

interface DivisionTableProps {
  columns: Column[];
  rows: RowWithCells[];
  onUpdateCell: (rowId: string, columnId: string, value: string) => void;
  onDeleteRow: (rowId: string) => void;
}

export default function DivisionTable({
  columns,
  rows,
  onUpdateCell,
  onDeleteRow,
}: DivisionTableProps) {
  if (columns.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Belum ada kolom. Admin perlu menambahkan kolom di Settings.
      </div>
    );
  }

  const getCellValue = (row: RowWithCells, columnId: string): string => {
    const cell = row.cells.find((c) => c.columnId === columnId);
    return cell?.value ?? "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-10 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <div className="flex items-center gap-1">
                  {col.name}
                  <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-normal normal-case text-gray-400">
                    {col.type.toLowerCase()}
                  </span>
                </div>
              </th>
            ))}
            <th className="w-10 px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="py-6 text-center text-sm text-gray-400"
              >
                Belum ada data. Klik &quot;Tambah Baris&quot; untuk mulai.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="group border-b border-gray-100 transition-colors hover:bg-gray-50/50"
              >
                <td className="px-2 py-1 text-xs text-gray-400">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.id} className="px-1 py-1">
                    <CellEditor
                      column={col}
                      value={getCellValue(row, col.id)}
                      onSave={(value) => onUpdateCell(row.id, col.id, value)}
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    onClick={() => {
                      if (window.confirm("Hapus baris ini?")) {
                        onDeleteRow(row.id);
                      }
                    }}
                    className="rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
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
