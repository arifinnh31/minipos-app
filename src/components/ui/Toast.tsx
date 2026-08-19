'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'danger';
  variant?: 'success' | 'error' | 'info' | 'warning' | 'danger';
  title: string;
  message?: string;
  description?: string;
  duration?: number; // duration in ms, default 4000
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const toastType = toast.type || toast.variant || 'info';
  const msg = toast.message || toast.description;
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toastType) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-emerald-900/10';
      case 'error':
      case 'danger':
        return 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-900/10';
      case 'warning':
        return 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-900/10';
      default:
        return 'border-blue-200 bg-blue-50/95 text-blue-950 shadow-blue-900/10';
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto w-full p-3.5 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 fade-in',
        getBorderColor()
      )}
    >
      {getIcon()}
      <div className="flex-1 text-xs min-w-0 pr-1">
        <h4 className="font-extrabold text-sm leading-tight break-words">{toast.title}</h4>
        {msg && <p className="mt-0.5 opacity-90 break-words leading-relaxed">{msg}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
        title="Tutup Notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2.5 sm:max-w-sm pointer-events-none max-w-full"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
