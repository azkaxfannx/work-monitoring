"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Columns3,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { parseDropdownOptions } from "@/utils/helpers";
import type { Division, ColumnType } from "@/types";

interface ColumnManagerProps {
  divisions: Division[];
  onRefetch: () => void;
}

const COLUMN_TYPES: { value: ColumnType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "DROPDOWN", label: "Dropdown" },
];

export default function ColumnManager({
  divisions,
  onRefetch,
}: ColumnManagerProps) {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    divisions[0]?.id || "",
  );
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<ColumnType>("TEXT");
  const [newColOptions, setNewColOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);
  const columns = selectedDivision?.columns || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !selectedDivisionId) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: newColName.trim(),
        type: newColType,
      };
      if (newColType === "DROPDOWN" && newColOptions.trim()) {
        body.options = JSON.stringify(
          newColOptions
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean),
        );
      }
      const res = await fetch(`/api/divisions/${selectedDivisionId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNewColName("");
        setNewColType("TEXT");
        setNewColOptions("");
        onRefetch();
        toast.success("Kolom berhasil ditambahkan");
      } else {
        toast.error("Gagal menambahkan kolom");
      }
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (columnId: string, columnName: string) => {
    const ok = await confirm({
      title: "Hapus Kolom?",
      message: `Kolom "${columnName}" beserta semua data di dalamnya akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    try {
      await fetch(`/api/divisions/${selectedDivisionId}/columns`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId }),
      });
      onRefetch();
      toast.success(`Kolom "${columnName}" berhasil dihapus`);
    } catch {
      toast.error("Gagal menghapus kolom");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (columnId: string, direction: "up" | "down") => {
    const idx = columns.findIndex((c) => c.id === columnId);
    if (
      (direction === "up" && idx <= 0) ||
      (direction === "down" && idx >= columns.length - 1)
    )
      return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentOrder = columns[idx].order;
    const swapOrder = columns[swapIdx].order;

    setLoading(true);
    try {
      // Swap orders atomically
      await Promise.all([
        fetch(`/api/divisions/${selectedDivisionId}/columns`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: columns[idx].id,
            order: swapOrder,
          }),
        }),
        fetch(`/api/divisions/${selectedDivisionId}/columns`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: columns[swapIdx].id,
            order: currentOrder,
          }),
        }),
      ]);
      onRefetch();
    } catch {
      toast.error("Gagal mengubah urutan kolom");
      onRefetch();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Kelola Kolom
      </h3>

      {/* Division selector */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Pilih Divisi
        </label>
        <select
          value={selectedDivisionId}
          onChange={(e) => setSelectedDivisionId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {divisions.length === 0 && (
            <option value="">-- Buat divisi dulu --</option>
          )}
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDivision && (
        <>
          {/* Create column form */}
          <form
            onSubmit={handleCreate}
            className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Nama kolom..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
              />
              <select
                value={newColType}
                onChange={(e) => setNewColType(e.target.value as ColumnType)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                {COLUMN_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
            {newColType === "DROPDOWN" && (
              <Input
                placeholder="Opsi dropdown (pisah koma), misal: Pending, In Progress, Done"
                value={newColOptions}
                onChange={(e) => setNewColOptions(e.target.value)}
              />
            )}
            <Button
              type="submit"
              size="sm"
              disabled={loading || !newColName.trim()}
            >
              <Plus size={14} />
              Tambah Kolom
            </Button>
          </form>

          {/* Column list */}
          <div className="space-y-2">
            {columns.length === 0 && (
              <div className="flex flex-col items-center gap-1 py-6 text-gray-400">
                <Columns3 size={28} className="text-gray-300" />
                <p className="text-sm">Belum ada kolom</p>
                <p className="text-xs text-gray-300">
                  Tambah kolom pertama di atas
                </p>
              </div>
            )}
            {columns.map((col, idx) => (
              <div
                key={col.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:bg-gray-50"
              >
                <GripVertical size={14} className="text-gray-300" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">
                    {col.name}
                  </span>
                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                    {col.type}
                  </span>
                  {col.type === "DROPDOWN" && col.options && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({parseDropdownOptions(col.options).join(", ")})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(col.id, "up")}
                    disabled={idx === 0 || loading}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleReorder(col.id, "down")}
                    disabled={idx === columns.length - 1 || loading}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id, col.name)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
