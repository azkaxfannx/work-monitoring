"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import DivisionTable from "./DivisionTable";
import type { Division } from "@/types";

interface DivisionCardProps {
  division: Division;
  index: number;
  onAddRow: (divisionId: string) => void;
  onUpdateCell: (
    divisionId: string,
    rowId: string,
    columnId: string,
    value: string,
  ) => void;
  onDeleteRow: (divisionId: string, rowId: string) => void;
}

export default function DivisionCard({
  division,
  index,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
}: DivisionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddRow = async () => {
    setAdding(true);
    try {
      await onAddRow(division.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            {division.name}
          </h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
            {division.rows.length} baris
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/80 hover:text-gray-600"
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Card body */}
      {!collapsed && (
        <div className="p-4">
          <DivisionTable
            columns={division.columns}
            rows={division.rows}
            onUpdateCell={(rowId, columnId, value) =>
              onUpdateCell(division.id, rowId, columnId, value)
            }
            onDeleteRow={(rowId) => onDeleteRow(division.id, rowId)}
          />

          {/* Add row button */}
          {division.columns.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddRow}
                disabled={adding}
              >
                <Plus size={14} />
                {adding ? "Menambahkan..." : "Tambah Baris"}
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
