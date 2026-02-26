"use client";

import { SocketProvider } from "./SocketProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </SocketProvider>
  );
}
