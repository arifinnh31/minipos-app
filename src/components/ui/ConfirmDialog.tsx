'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, HelpCircle, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
  inputPlaceholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  showInput?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  inputPlaceholder,
  inputValue,
  onInputChange,
  showInput = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="w-7 h-7 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-7 h-7 text-amber-500" />;
      case 'info':
        return <Info className="w-7 h-7 text-blue-600" />;
      default:
        return <HelpCircle className="w-7 h-7 text-indigo-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-50 border-rose-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-indigo-50 border-indigo-200';
    }
  };

  const getConfirmButtonVariant = () => {
    if (variant === 'danger') return 'danger';
    if (variant === 'warning') return 'warning';
    return 'primary';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-slate-900 text-lg leading-snug tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showInput && (
          <div className="mt-1">
            <input
              type="text"
              value={inputValue || ''}
              onChange={(e) => onInputChange && onInputChange(e.target.value)}
              placeholder={inputPlaceholder || 'Ketik di sini...'}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/50 font-medium text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={getConfirmButtonVariant()}
            size="sm"
            className={variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
