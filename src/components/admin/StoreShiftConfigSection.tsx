'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { ShiftTimingConfig } from '@/types/pos';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface StoreShiftConfigSectionProps {
  shiftConfig: ShiftTimingConfig;
  onChange: (field: keyof ShiftTimingConfig, value: any) => void;
}

export function StoreShiftConfigSection({
  shiftConfig,
  onChange,
}: StoreShiftConfigSectionProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle icon={<Clock className="w-5 h-5 text-blue-600" />}>
          Master Jam Shift Operasional Kasir
        </CardTitle>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Diterapkan ke seluruh terminal kasir POS
        </span>
      </CardHeader>

      <div className="space-y-4">
        {/* Shift 1 (Pagi) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Shift 1 (Pagi)</span>
            <span className="text-[11px] text-slate-400">Shift operasional pagi</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Mulai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift1Start}
              onChange={(e) => onChange('shift1Start', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Selesai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift1End}
              onChange={(e) => onChange('shift1End', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Shift 2 (Siang / Sore) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Shift 2 (Siang / Sore)</span>
            <span className="text-[11px] text-slate-400">Shift operasional siang</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Mulai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift2Start}
              onChange={(e) => onChange('shift2Start', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Selesai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift2End}
              onChange={(e) => onChange('shift2End', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Shift 3 (Malam) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Shift 3 (Malam)</span>
            <span className="text-[11px] text-slate-400">Shift operasional larut malam</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Mulai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift3Start}
              onChange={(e) => onChange('shift3Start', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Jam Selesai:
            </label>
            <Input
              type="time"
              value={shiftConfig.shift3End}
              onChange={(e) => onChange('shift3End', e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Shift 4 (Gerai 24 Jam Nonstop - Cukup Toggle Enabler/Disabler) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Shift 4 (Gerai 24 Jam Nonstop)</span>
            <span className="text-[11px] text-slate-400">
              Aktifkan opsi shift 24 jam penuh di kasir tanpa pembatasan jam operasional
            </span>
          </div>
          <input
            type="checkbox"
            checked={shiftConfig.enableShift4}
            onChange={(e) => onChange('enableShift4', e.target.checked)}
            className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
}
