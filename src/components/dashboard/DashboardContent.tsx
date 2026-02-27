"use client";

import { useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { useDivisions } from "@/hooks/useDivisions";
import Header from "@/components/layout/Header";
import DivisionCard from "./DivisionCard";
import SettingsModal from "@/components/settings/SettingsModal";
import { LayoutDashboard, RefreshCw, AlertCircle } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded-full bg-white" />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-4">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-28 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex gap-4">
                <div className="h-8 w-20 rounded bg-gray-50" />
                <div className="h-8 w-28 rounded bg-gray-50" />
                <div className="h-8 w-24 rounded bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardContent() {
  const { isConnected } = useSocket();
  const { divisions, loading, error, refetch, addRow, updateCell, deleteRow } =
    useDivisions();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const totalRows = divisions.reduce((sum, d) => sum + d.rows.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isConnected={isConnected}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="mx-auto px-6 py-6 lg:px-10">
        {/* Summary bar */}
        {!loading && !error && divisions.length > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>
                <span className="font-semibold text-gray-700">
                  {divisions.length}
                </span>{" "}
                divisi
              </span>
              <span className="text-gray-300">·</span>
              <span>
                <span className="font-semibold text-gray-700">{totalRows}</span>{" "}
                total baris
              </span>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Refresh data"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingSkeleton />}

        {/* Error state */}
        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="flex justify-center">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-red-700">
              Gagal memuat data
            </p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && divisions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm">
              <LayoutDashboard size={36} className="text-blue-400" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-700">
              Belum Ada Divisi
            </h2>
            <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-gray-500">
              Klik tombol{" "}
              <button
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-2 hover:underline"
              >
                Settings
              </button>{" "}
              di kanan atas untuk membuat divisi dan kolom pertama.
            </p>
          </div>
        )}

        {/* Division cards */}
        {!loading && !error && divisions.length > 0 && (
          <div className="space-y-6">
            {divisions.map((division, idx) => (
              <DivisionCard
                key={division.id}
                division={division}
                index={idx}
                onAddRow={addRow}
                onUpdateCell={updateCell}
                onDeleteRow={deleteRow}
              />
            ))}
          </div>
        )}
      </main>

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        divisions={divisions}
        onRefetch={refetch}
      />
    </div>
  );
}
