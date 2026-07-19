import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ animation: 'fade-in 0.15s ease' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg card-gradient rounded-card border border-line shadow-heavy max-h-[85vh] flex flex-col"
        style={{ animation: 'slide-up 0.2s ease' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h3 className="text-sm font-bold text-cream">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-line transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
