import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      id="toast-notification"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 p-3.5 flex items-start gap-3 animate-slide-up"
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

      <div className="flex-1 space-y-0.5">
        <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
        {toast.description && <p className="text-[11px] text-slate-400 leading-snug">{toast.description}</p>}
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
