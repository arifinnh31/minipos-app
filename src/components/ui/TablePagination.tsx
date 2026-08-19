'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'data',
  className = '',
}: TablePaginationProps) {
  // If no items at all
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination numbers with ellipsis (e.g. 1, 2, 3 ... 10)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always include page 1
    pages.push(1);

    if (currentPage > 3) {
      pages.push('dots-prev');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('dots-next');
    }

    // Always include last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium ${className}`}
    >
      {/* Left: Summary & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer transition-colors"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value={totalItems}>Semua ({totalItems})</option>
          </select>
          <span>baris</span>
        </div>

        <div className="text-slate-500 font-normal">
          Menampilkan <span className="font-bold text-slate-800">{startItem}</span> -{' '}
          <span className="font-bold text-slate-800">{endItem}</span> dari{' '}
          <span className="font-bold text-slate-800">{totalItems}</span> {itemLabel}
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Halaman Pertama"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Halaman Sebelumnya"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold tracking-widest select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Halaman Selanjutnya"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Halaman Terakhir"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
