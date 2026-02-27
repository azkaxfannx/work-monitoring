"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";
import Button from "./Button";

// ─── Types ───────────────────────────────────────────────────────
type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// ─── Context ─────────────────────────────────────────────────────
const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx.confirm;
}

// ─── Config ──────────────────────────────────────────────────────
const variantConfig: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle;
    iconBg: string;
    iconColor: string;
    buttonVariant: "danger" | "primary" | "secondary";
  }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    buttonVariant: "danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    buttonVariant: "primary",
  },
  info: {
    icon: HelpCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonVariant: "primary",
  },
};

// ─── Provider ────────────────────────────────────────────────────
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  // Focus confirm button on open
  useEffect(() => {
    if (state) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }
  }, [state]);

  // Handle escape key
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const variant = state?.options.variant ?? "danger";
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <motion.div
              key="confirm-dialog"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="p-6">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}
                  >
                    <Icon size={24} className={config.iconColor} />
                  </div>
                </div>

                {/* Title */}
                {state.options.title && (
                  <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
                    {state.options.title}
                  </h3>
                )}

                {/* Message */}
                <p className="text-center text-sm leading-relaxed text-gray-600">
                  {state.options.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  {state.options.cancelLabel ?? "Batal"}
                </Button>
                <Button
                  ref={confirmBtnRef}
                  variant={config.buttonVariant}
                  size="md"
                  className="flex-1"
                  onClick={handleConfirm}
                >
                  {state.options.confirmLabel ?? "Ya, Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
