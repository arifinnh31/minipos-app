'use client';

import React from 'react';

interface DashboardKpiCardProps {
  title: string;
  value: string;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  valueColor?: string;
}

export function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  valueColor = 'text-slate-900',
}: DashboardKpiCardProps) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${valueColor}`}>
          {value}
        </span>
        {subtitle && (
          <div className="mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
