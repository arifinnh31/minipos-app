'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-100',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
