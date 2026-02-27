"use client";

import { Settings, WifiOff, BarChart3 } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  onSettingsClick: () => void;
}

export default function Header({ isConnected, onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-6 py-3 lg:px-10">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
            <BarChart3 size={22} className="text-blue-600" />
            Work Monitoring
          </h1>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isConnected ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            ) : (
              <WifiOff size={12} />
            )}
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Buka Settings (Admin)"
        >
          <Settings size={18} />
          <span className="hidden text-xs font-medium sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
}
