"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Lock } from "lucide-react";

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Password salah");
        return;
      }

      onSuccess();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 py-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm">
        <Lock size={28} className="text-blue-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Admin Access</h3>
        <p className="mt-1 text-sm text-gray-500">
          Masukkan password admin untuk mengakses settings
        </p>
      </div>
      <div className="w-full max-w-xs">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoFocus
        />
      </div>
      <Button type="submit" disabled={loading || !password}>
        {loading ? "Memverifikasi..." : "Masuk"}
      </Button>
      <p className="text-xs text-gray-400">Tekan Enter untuk masuk</p>
    </form>
  );
}
