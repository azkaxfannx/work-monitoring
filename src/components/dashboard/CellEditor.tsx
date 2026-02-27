"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil } from "lucide-react";
import type { Column } from "@/types";
import { parseDropdownOptions } from "@/utils/helpers";

// ─── Dropdown color mapping ──────────────────────────────────────
const DROPDOWN_COLORS: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  // Status
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  "in progress": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  "on progress": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  done: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  selesai: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  cancelled: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  canceled: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  batal: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  ditolak: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  rejected: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  review: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  "in review": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  draft: { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-200" },
  active: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
  aktif: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
  inactive: { bg: "bg-gray-50", text: "text-gray-500", ring: "ring-gray-200" },
  "tidak aktif": {
    bg: "bg-gray-50",
    text: "text-gray-500",
    ring: "ring-gray-200",
  },
  urgent: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  high: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-200",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-200",
  },
  low: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
};

function getDropdownColor(val: string) {
  return DROPDOWN_COLORS[val.toLowerCase().trim()];
}

interface CellEditorProps {
  column: Column;
  value: string;
  onSave: (value: string) => void;
  onTabNext?: () => void;
  onTabPrev?: () => void;
}

export default function CellEditor({
  column,
  value,
  onSave,
  onTabNext,
  onTabPrev,
}: CellEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Auto-resize textarea to fit content
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 60), 200)}px`;
  }, []);

  // Auto-resize on value change (for display mode textarea)
  useEffect(() => {
    if (column.type === "TEXT" && textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [value, column.type, autoResize]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // setSelectionRange throws InvalidStateError on type="date" and type="number"
      if (inputRef.current instanceof HTMLInputElement) {
        const type = inputRef.current.type;
        if (
          type === "text" ||
          type === "search" ||
          type === "url" ||
          type === "tel" ||
          type === "password"
        ) {
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }
    }
  }, [editing]);

  // When TEXT enters edit mode, focus the always-rendered textarea
  useEffect(() => {
    if (editing && column.type === "TEXT" && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing, column.type]);

  const handleSave = () => {
    setEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(value);
      setEditing(false);
    }
    if (e.key === "Enter" && column.type !== "TEXT") {
      handleSave();
    }
    // Tab navigation
    if (e.key === "Tab") {
      e.preventDefault();
      handleSave();
      if (e.shiftKey) {
        onTabPrev?.();
      } else {
        onTabNext?.();
      }
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      setEditValue(value);
      setEditing(false);
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
    // Tab navigation
    if (e.key === "Tab") {
      e.preventDefault();
      handleSave();
      if (e.shiftKey) {
        onTabPrev?.();
      } else {
        onTabNext?.();
      }
    }
  };

  // ─── TEXT type: single <textarea> always rendered, style toggles ───
  if (column.type === "TEXT") {
    const isEmpty = !value && !editing;

    return (
      <div className="group/cell relative">
        <textarea
          ref={textareaRef}
          value={editing ? editValue : value}
          readOnly={!editing}
          onClick={() => {
            if (!editing) setEditing(true);
          }}
          onChange={(e) => {
            setEditValue(e.target.value);
            autoResize(e.target);
          }}
          onBlur={() => {
            if (editing) handleSave();
          }}
          onKeyDown={handleTextareaKeyDown}
          placeholder={editing ? "Tulis di sini..." : ""}
          className={`min-h-[60px] max-h-[200px] w-full overflow-y-auto rounded-md border-2 px-2 py-1.5 text-sm leading-relaxed transition-colors focus:outline-none ${
            editing
              ? "border-blue-400 bg-white shadow-sm ring-2 ring-blue-400/30"
              : "cursor-pointer border-transparent bg-transparent hover:border-blue-200 hover:bg-blue-50/50"
          } ${isEmpty && !editing ? "text-gray-300 italic" : "text-gray-700"}`}
          style={
            { resize: "none", fieldSizing: "content" } as React.CSSProperties
          }
        />
        {/* Ctrl+Enter hint below textarea when editing */}
        {editing && (
          <div className="mt-1 text-right">
            <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
              Ctrl+Enter ↵ simpan
            </span>
          </div>
        )}
        {/* Pencil icon on hover when not editing */}
        {!editing && !isEmpty && (
          <Pencil
            size={11}
            className="pointer-events-none absolute top-1 right-1 text-blue-400 opacity-0 transition-opacity group-hover/cell:opacity-100"
          />
        )}
      </div>
    );
  }

  // ─── DROPDOWN type: always render <select>, style toggles ───────
  if (column.type === "DROPDOWN") {
    const options = parseDropdownOptions(column.options);
    const isEmpty = !value && !editing;
    const color = value ? getDropdownColor(value) : null;

    return (
      <div className="group/cell relative">
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editing ? editValue : value}
          onMouseDown={() => {
            if (!editing) {
              setEditing(true);
              setEditValue(value);
            }
          }}
          onClick={() => {
            // .click() from Tab navigation doesn't fire mousedown
            if (!editing) {
              setEditing(true);
              setEditValue(value);
            }
          }}
          onFocus={() => {
            if (!editing) {
              setEditing(true);
              setEditValue(value);
            }
          }}
          onChange={(e) => {
            const newVal = e.target.value;
            setEditValue(newVal);
            setEditing(false);
            if (newVal !== value) {
              onSave(newVal);
            }
          }}
          onBlur={() => {
            if (editing) handleSave();
          }}
          onKeyDown={handleKeyDown}
          className={`w-full cursor-pointer rounded-md border-2 px-2 py-1.5 text-sm transition-colors focus:outline-none ${
            editing
              ? "border-blue-400 bg-white shadow-sm ring-2 ring-blue-400/30"
              : "border-transparent bg-transparent hover:border-blue-200 hover:bg-blue-50/50"
          } ${
            !editing && color
              ? `${color.bg} ${color.text} font-semibold`
              : !editing && isEmpty
                ? "text-gray-300 italic"
                : "text-gray-700"
          }`}
          style={
            !editing
              ? ({
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                } as React.CSSProperties)
              : undefined
          }
        >
          <option value="">{editing ? "-- Pilih --" : "kosong"}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {/* Pencil icon on hover when not editing and has value */}
        {!editing && value && (
          <Pencil
            size={11}
            className="pointer-events-none absolute top-1 right-1 text-blue-400 opacity-0 transition-opacity group-hover/cell:opacity-100"
          />
        )}
      </div>
    );
  }

  // ─── Non-TEXT, Non-DROPDOWN display mode ───────────────────────
  if (!editing) {
    const isEmpty = !value;
    const isNumber = column.type === "NUMBER";

    let displayValue: string | null = null;
    if (column.type === "DATE" && value) {
      try {
        displayValue = new Date(value).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        displayValue = value;
      }
    }

    return (
      <div
        onClick={() => setEditing(true)}
        className={`group/cell relative min-h-[32px] cursor-pointer rounded-md border-2 border-transparent px-2 py-1.5 text-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 ${
          isNumber ? "tabular-nums" : ""
        }`}
        title={isEmpty ? "Klik untuk mengisi" : "Klik untuk edit"}
      >
        {isEmpty ? (
          <span className="flex items-center gap-1 text-gray-300 italic">
            <Pencil
              size={11}
              className="opacity-0 transition-opacity group-hover/cell:opacity-100"
            />
            <span className="text-xs">kosong</span>
          </span>
        ) : (
          <span className="text-gray-700">{displayValue ?? value}</span>
        )}
        {!isEmpty && (
          <Pencil
            size={11}
            className="absolute top-1 right-1 text-blue-400 opacity-0 transition-opacity group-hover/cell:opacity-100"
          />
        )}
      </div>
    );
  }

  // ─── NUMBER / DATE edit mode ───────────────────────────────────
  const inputType = column.type === "NUMBER" ? "number" : "date";

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={inputType}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      placeholder={column.type === "NUMBER" ? "0" : ""}
      className="w-full rounded-md border-2 border-blue-400 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
    />
  );
}
