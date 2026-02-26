"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { Division } from "@/types";

interface DivisionManagerProps {
  divisions: Division[];
  onRefetch: () => void;
}

export default function DivisionManager({
  divisions,
  onRefetch,
}: DivisionManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        onRefetch();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/divisions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        onRefetch();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus divisi "${name}" beserta semua datanya?`))
      return;
    setLoading(true);
    try {
      await fetch(`/api/divisions/${id}`, { method: "DELETE" });
      onRefetch();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Kelola Divisi
      </h3>

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <Input
          placeholder="Nama divisi baru..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" disabled={loading || !newName.trim()} size="md">
          <Plus size={16} />
          Tambah
        </Button>
      </form>

      {/* Division list */}
      <div className="space-y-2">
        {divisions.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            Belum ada divisi
          </p>
        )}
        {divisions.map((div) => (
          <div
            key={div.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          >
            {editingId === div.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(div.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  onClick={() => handleUpdate(div.id)}
                  className="rounded p-1 text-green-600 hover:bg-green-50"
                  disabled={loading}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {div.name}
                </span>
                <span className="text-xs text-gray-400">
                  {div.columns.length} kolom · {div.rows.length} baris
                </span>
                <button
                  onClick={() => {
                    setEditingId(div.id);
                    setEditName(div.name);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(div.id, div.name)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  disabled={loading}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
