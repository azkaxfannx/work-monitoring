"use client";

import { useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { useDivisions } from "@/hooks/useDivisions";
import Header from "@/components/layout/Header";
import DivisionCard from "./DivisionCard";
import SettingsModal from "@/components/settings/SettingsModal";
import { Loader2, LayoutDashboard } from "lucide-react";

export default function DashboardContent() {
  const { isConnected } = useSocket();
  const { divisions, loading, error, refetch, addRow, updateCell, deleteRow } =
    useDivisions();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isConnected={isConnected}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            <p className="font-medium">Gagal memuat data</p>
            <p className="mt-1 text-red-500">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 rounded-lg bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && divisions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <LayoutDashboard size={36} className="text-gray-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-700">
              Belum Ada Divisi
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Klik ikon <span className="inline-flex translate-y-0.5">⚙️</span>{" "}
              di kanan atas untuk menambahkan divisi dan kolom.
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
