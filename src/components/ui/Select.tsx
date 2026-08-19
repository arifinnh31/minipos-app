'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  labelPrefix?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filter';
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  labelPrefix,
  icon,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'left',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-xl',
    md: 'h-11 px-3.5 text-xs sm:text-sm rounded-xl',
    lg: 'h-12 px-4 text-sm font-bold rounded-xl',
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block',
        variant === 'default' ? 'w-full' : 'w-full sm:w-auto',
        className
      )}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full bg-white border flex items-center justify-between gap-2 shadow-xs font-semibold transition-all select-none cursor-pointer',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200',
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-100 text-blue-900'
            : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50',
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="shrink-0 text-blue-600">{icon}</span>}
          <div className="truncate text-left">
            {labelPrefix && (
              <span className="text-slate-500 font-medium mr-1">{labelPrefix}</span>
            )}
            {selectedOption ? (
              <span
                className={cn(
                  'font-bold truncate',
                  variant === 'filter' ? 'text-blue-700 font-extrabold' : 'text-slate-900'
                )}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-blue-600'
          )}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1.5 min-w-[200px] w-full bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          <div className="space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between font-semibold transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="truncate">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] text-slate-400 font-normal truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
