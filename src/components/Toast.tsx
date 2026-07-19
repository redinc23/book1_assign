import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border shadow-toast min-w-[280px]"
            style={{
              animation: 'toast-in 0.25s ease',
              background: toast.type === 'success'
                ? 'rgba(16, 37, 45, 0.96)'
                : 'rgba(45, 16, 16, 0.96)',
              borderColor: toast.type === 'success'
                ? 'rgba(104, 213, 157, 0.3)'
                : 'rgba(239, 124, 120, 0.3)',
            }}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
              : <AlertCircle className="w-4 h-4 text-accent-red shrink-0" />}
            <span className="text-xs text-cream flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="p-0.5 hover:bg-line rounded">
              <X className="w-3 h-3 text-muted" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
