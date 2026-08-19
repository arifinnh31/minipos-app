'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableCard({ children, className = '', ...props }: TableCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface TableCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableCardHeader({ children, className = '', ...props }: TableCardHeaderProps) {
  return (
    <div
      className={`p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export function Table({
  children,
  className = '',
  wrapperClassName = '',
  ...props
}: TableProps) {
  return (
    <div className={`overflow-x-auto ${wrapperClassName}`}>
      <table className={`w-full text-left text-xs ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({
  children,
  className = '',
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={`bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({
  children,
  className = '',
  ...props
}: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-slate-100 font-medium text-slate-800 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({
  children,
  className = '',
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({
  children,
  className = '',
  align = 'left',
  ...props
}: TableHeadProps) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
      ? 'text-right'
      : 'text-left';

  return (
    <th
      className={`py-3.5 px-4 font-bold ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({
  children,
  className = '',
  align = 'left',
  ...props
}: TableCellProps) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
      ? 'text-right'
      : 'text-left';

  return (
    <td
      className={`py-3.5 px-4 ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableEmptyStateProps {
  colSpan: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function TableEmptyState({
  colSpan,
  icon,
  title = 'Tidak ada data ditemukan',
  description = 'Coba ubah filter atau kata kunci pencarian Anda.',
  className = '',
}: TableEmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`py-12 text-center text-slate-400 ${className}`}
      >
        <div className="flex flex-col items-center justify-center">
          {icon || <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />}
          <p className="font-bold text-sm text-slate-600">{title}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
              {description}
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export { TablePagination } from './TablePagination';
export type { TablePaginationProps } from './TablePagination';

