'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-lg select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-600 shadow-sm shadow-blue-500/20',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600 shadow-sm shadow-rose-500/20',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-600 shadow-sm shadow-emerald-500/20',
      warning: 'bg-amber-400 hover:bg-amber-500 text-slate-900 focus:ring-amber-400 font-semibold shadow-sm',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-300 border border-slate-200',
      outline: 'border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 focus:ring-blue-600',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-5 py-3 min-h-[50px] font-semibold gap-2.5',
      xl: 'text-lg px-6 py-4 min-h-[58px] font-bold gap-3',
      icon: 'p-2.5 min-h-[44px] min-w-[44px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
