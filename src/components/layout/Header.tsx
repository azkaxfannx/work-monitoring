"use client";

import { Settings, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  onSettingsClick: () => void;
}

export default function Header({ isConnected, onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Work Monitoring</h1>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>
        <button
          onClick={onSettingsClick}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Settings"
        >
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
}
