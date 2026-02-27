"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import PasswordGate from "./PasswordGate";
import DivisionManager from "./DivisionManager";
import ColumnManager from "./ColumnManager";
import PasswordChanger from "./PasswordChanger";
import type { Division } from "@/types";
import { LayoutGrid, Columns3, KeyRound } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  onRefetch: () => void;
}

type Tab = "divisions" | "columns" | "password";

export default function SettingsModal({
  isOpen,
  onClose,
  divisions,
  onRefetch,
}: SettingsModalProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("divisions");

  const handleClose = () => {
    setAuthenticated(false);
    setActiveTab("divisions");
    onClose();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "divisions", label: "Divisi", icon: <LayoutGrid size={16} /> },
    { id: "columns", label: "Kolom", icon: <Columns3 size={16} /> },
    { id: "password", label: "Password", icon: <KeyRound size={16} /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Settings"
      size={authenticated ? "lg" : "md"}
    >
      {!authenticated ? (
        <PasswordGate onSuccess={() => setAuthenticated(true)} />
      ) : (
        <div>
          {/* Tab navigation */}
          <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain rounded-lg">
            {activeTab === "divisions" && (
              <DivisionManager divisions={divisions} onRefetch={onRefetch} />
            )}
            {activeTab === "columns" && (
              <ColumnManager divisions={divisions} onRefetch={onRefetch} />
            )}
            {activeTab === "password" && <PasswordChanger />}
          </div>
        </div>
      )}
    </Modal>
  );
}
