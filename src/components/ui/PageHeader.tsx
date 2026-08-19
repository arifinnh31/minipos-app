'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {(action || children) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}
