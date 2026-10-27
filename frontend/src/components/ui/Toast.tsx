/**
 * Hệ thống thông báo toast toàn cục.
 * Quản lý hiển thị thông báo tạm thời (success, error, warning, info).
 */
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/** Hook sử dụng toast trong component */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-error-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-secondary-500" />,
};

/** Khai báo class tĩnh để Tailwind tạo đủ màu viền, nền luôn đặc ở cả hai theme. */
const borders: Record<ToastType, string> = {
  success: 'border-l-success-500',
  error: 'border-l-error-500',
  warning: 'border-l-warning-500',
  info: 'border-l-secondary-500',
};

/** Thành phần hiển thị một toast */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-theme-lg
        animate-slide-down w-full bg-card border border-base-primary border-l-4 pointer-events-auto
        ${borders[toast.type]}
      `}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-base-primary">{toast.message}</p>
      <button
        onClick={onRemove}
        className="p-1 rounded hover:bg-tertiary transition-colors text-base-tertiary"
        aria-label={t('common.close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Provider bọc ngoài App để cung cấp toast */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Đặt dưới góc màn hình để không che header hoặc đồng hồ giữ ghế. */}
      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
