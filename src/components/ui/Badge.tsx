import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'slate' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'blue', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-semibold rounded-full select-none';

  const variants = {
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    red: 'bg-rose-100 text-rose-700 border border-rose-200',
    yellow: 'bg-amber-100 text-amber-900 border border-amber-300',
    green: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
