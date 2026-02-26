"use client";

import { useState, useRef, useEffect } from "react";
import type { Column } from "@/types";
import { parseDropdownOptions } from "@/utils/helpers";

interface CellEditorProps {
  column: Column;
  value: string;
  onSave: (value: string) => void;
}

export default function CellEditor({ column, value, onSave }: CellEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setEditing(false);
    }
  };

  // Display mode
  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="min-h-[28px] cursor-pointer rounded px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-blue-50"
        title="Klik untuk edit"
      >
        {value || <span className="italic text-gray-300">kosong</span>}
      </div>
    );
  }

  // Edit mode - DROPDOWN
  if (column.type === "DROPDOWN") {
    const options = parseDropdownOptions(column.options);
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
          // auto-save on select
          setEditing(false);
          if (e.target.value !== value) {
            onSave(e.target.value);
          }
        }}
        onBlur={handleSave}
        className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
      >
        <option value="">-- Pilih --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // Edit mode - TEXT, NUMBER, DATE
  const inputType =
    column.type === "NUMBER"
      ? "number"
      : column.type === "DATE"
        ? "date"
        : "text";

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={inputType}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
    />
  );
}
