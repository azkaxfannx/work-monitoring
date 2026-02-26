"use client";

import { SocketProvider } from "./SocketProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
