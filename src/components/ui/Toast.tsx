"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

// ─── Context ─────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
}

// ─── Config ──────────────────────────────────────────────────────
const typeConfig: Record<
  ToastType,
  {
    icon: typeof CheckCircle2;
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    progressColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    iconColor: "text-emerald-500",
    progressColor: "bg-emerald-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
    progressColor: "bg-red-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
    progressColor: "bg-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
    progressColor: "bg-amber-400",
  },
};

// ─── Individual Toast ────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [remaining, setRemaining] = useState(toast.duration);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remaining);
    return () => clearTimeout(timerRef.current);
  }, [isPaused, remaining, toast.id, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    clearTimeout(timerRef.current);
    setRemaining((prev) => prev - (Date.now() - startTimeRef.current));
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.bg} ${config.border} shadow-lg shadow-black/5`}
      style={{ minWidth: 300, maxWidth: 420 }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={20} className={`mt-0.5 shrink-0 ${config.iconColor}`} />
        <p
          className={`flex-1 text-sm font-medium leading-relaxed ${config.text}`}
        >
          {toast.message}
        </p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-black/5">
        <motion.div
          className={`h-full ${config.progressColor}`}
          initial={{ width: "100%" }}
          animate={{ width: isPaused ? undefined : "0%" }}
          transition={{
            duration: isPaused ? 0 : remaining / 1000,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Provider ────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 3500) => {
      const id = `toast-${++idCounter.current}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    [],
  );

  const toast = {
    success: (msg: string, dur?: number) => addToast("success", msg, dur),
    error: (msg: string, dur?: number) => addToast("error", msg, dur ?? 4500),
    info: (msg: string, dur?: number) => addToast("info", msg, dur),
    warning: (msg: string, dur?: number) =>
      addToast("warning", msg, dur ?? 4000),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — top-right corner */}
      <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end gap-2 p-4 pt-16">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
