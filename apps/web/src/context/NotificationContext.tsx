import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextProps {
  showNotification: (message: string, type?: NotificationType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeNotification(id);
    }, 4000); // automatic dismiss after 4 seconds
  }, [removeNotification]);

  const success = useCallback((message: string) => showNotification(message, "success"), [showNotification]);
  const error = useCallback((message: string) => showNotification(message, "error"), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-80 max-w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${
              n.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                : n.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            <div className="flex-1 text-sm font-semibold leading-snug">
              {n.message}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white shrink-0 text-base leading-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
