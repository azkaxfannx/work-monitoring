"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import DivisionTable from "./DivisionTable";
import type { Division } from "@/types";

interface DivisionCardProps {
  division: Division;
  index: number;
  onAddRow: (divisionId: string) => Promise<void>;
  onUpdateCell: (
    divisionId: string,
    rowId: string,
    columnId: string,
    value: string,
  ) => Promise<void>;
  onDeleteRow: (divisionId: string, rowId: string) => Promise<void>;
}

export default function DivisionCard({
  division,
  index,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
}: DivisionCardProps) {
  const storageKey = `div-collapsed-${division.id}`;

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === null ? true : saved === "1";
    } catch {
      return true;
    }
  });
  const [adding, setAdding] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, [storageKey]);

  const handleAddRow = async () => {
    setAdding(true);
    try {
      await onAddRow(division.id);
    } finally {
      setAdding(false);
    }
  };

  const colCount = division.columns.length;
  const rowCount = division.rows.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Card header — entire area is clickable */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex w-full items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-left transition-colors select-none hover:from-blue-100/60 hover:to-indigo-100/60"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            {division.name}
          </h2>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
            {rowCount} baris
          </span>
          {colCount > 0 && (
            <span className="hidden text-xs text-gray-400 sm:inline">
              · {colCount} kolom
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors group-hover:bg-white/80 group-hover:text-gray-600"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      {/* Card body — animated collapse */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <DivisionTable
                divisionId={division.id}
                columns={division.columns}
                rows={division.rows}
                onUpdateCell={(rowId, columnId, value) =>
                  onUpdateCell(division.id, rowId, columnId, value)
                }
                onDeleteRow={(rowId) => onDeleteRow(division.id, rowId)}
              />

              {/* Add row button */}
              {colCount > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddRow();
                    }}
                    disabled={adding}
                    className="gap-1.5"
                  >
                    {adding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    {adding ? "Menambahkan..." : "Tambah Baris"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
