'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Check,
  CalendarRange,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type DatePresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'allTime'
  | 'custom';

export interface DateRangeValue {
  preset: DatePresetKey;
  startDate: Date | null;
  endDate: Date | null;
  label: string;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (newValue: DateRangeValue) => void;
  className?: string;
}

// Helper to format Date to YYYY-MM-DD for HTML input
function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Compute date boundaries for presets
export function computePresetRange(preset: DatePresetKey): {
  startDate: Date | null;
  endDate: Date | null;
  label: string;
} {
  const now = new Date();

  if (preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: 'Hari Ini',
    };
  }

  if (preset === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: 'Kemarin',
    };
  }

  if (preset === 'last7days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: '7 Hari Terakhir',
    };
  }

  if (preset === 'last30days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: '30 Hari Terakhir',
    };
  }

  if (preset === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: 'Bulan Ini',
    };
  }

  if (preset === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: 'Bulan Lalu',
    };
  }

  if (preset === 'allTime') {
    return {
      startDate: null,
      endDate: null,
      label: 'Semua Waktu',
    };
  }

  // custom default
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    startDate: start,
    endDate: end,
    label: 'Kustom Rentang Tanggal',
  };
}

const PRESET_OPTIONS: { key: DatePresetKey; label: string }[] = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'yesterday', label: 'Kemarin' },
  { key: 'last7days', label: '7 Hari Terakhir' },
  { key: 'thisMonth', label: 'Bulan Ini' },
  { key: 'lastMonth', label: 'Bulan Lalu' },
  { key: 'allTime', label: 'Semua Waktu' },
];

export function DateRangeFilter({
  value,
  onChange,
  className = '',
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(value.preset === 'custom');
  const [customStart, setCustomStart] = useState<string>(toDateInputValue(value.startDate));
  const [customEnd, setCustomEnd] = useState<string>(toDateInputValue(value.endDate));

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if external value changes
  useEffect(() => {
    setCustomStart(toDateInputValue(value.startDate));
    setCustomEnd(toDateInputValue(value.endDate));
    setIsCustomMode(value.preset === 'custom');
  }, [value.startDate, value.endDate, value.preset]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectPreset = (presetKey: DatePresetKey) => {
    setIsCustomMode(false);
    setIsOpen(false);
    const range = computePresetRange(presetKey);
    onChange({
      preset: presetKey,
      startDate: range.startDate,
      endDate: range.endDate,
      label: range.label,
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    const [sy, sm, sd] = customStart.split('-').map(Number);
    const [ey, em, ed] = customEnd.split('-').map(Number);

    const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);

    if (start > end) {
      alert('Tanggal awal tidak boleh lebih besar dari tanggal akhir.');
      return;
    }

    const formatter = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    const label = `${formatter.format(start)} - ${formatter.format(end)}`;

    onChange({
      preset: 'custom',
      startDate: start,
      endDate: end,
      label,
    });

    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Clean Single Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 px-3.5 bg-white hover:bg-slate-50 border rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-100 text-blue-900'
            : 'border-slate-300 text-slate-700 hover:border-slate-400'
        }`}
      >
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="whitespace-nowrap">
          Periode: <strong className="text-blue-700 font-extrabold">{value.label}</strong>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {/* Clean Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {!isCustomMode ? (
            <div className="p-1.5 space-y-0.5">
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = value.preset === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectPreset(opt.key)}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between font-semibold transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}

              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kustom Rentang Tanggal...</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApplyCustom} className="p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">Rentang Tanggal Kustom</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  &larr; Preset
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  required
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  required
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs h-7 px-2.5 cursor-pointer"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-xs h-7 px-3 cursor-pointer"
                >
                  Terapkan
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
