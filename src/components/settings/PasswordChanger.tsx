"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function PasswordChanger() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.warning("Password baru tidak cocok");
      return;
    }

    if (newPassword.length < 4) {
      toast.warning("Password minimal 4 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah password");
        return;
      }

      toast.success("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Ubah Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="current-password"
          type="password"
          label="Password Lama"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••"
        />
        <Input
          id="new-password"
          type="password"
          label="Password Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••"
        />
        <Input
          id="confirm-password"
          type="password"
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••"
        />
        <Button type="submit" disabled={loading}>
          <KeyRound size={16} />
          {loading ? "Menyimpan..." : "Ubah Password"}
        </Button>
      </form>
    </div>
  );
}
