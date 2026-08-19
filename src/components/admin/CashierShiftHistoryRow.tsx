'use client';

import React from 'react';
import { Calendar, Banknote, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CashierShift } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface CashierShiftHistoryRowProps {
  shift: CashierShift;
}

export function CashierShiftHistoryRow({ shift }: CashierShiftHistoryRowProps) {
  const hasDiff = shift.difference !== undefined && shift.difference !== 0;
  const isShortage = shift.difference !== undefined && shift.difference < 0;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm font-mono">{shift.shiftName}</span>
          <Badge variant={shift.status === 'CLOSED' ? 'slate' : 'green'} size="sm">
            {shift.status === 'CLOSED' ? 'Shift Ditutup' : 'Sedang Aktif'}
          </Badge>
        </div>
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDateTime(shift.startTime)}
        </span>
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Modal Awal
          </span>
          <span className="font-mono font-bold text-slate-800 mt-0.5 block">
            {formatRupiah(shift.startingCash)}
          </span>
        </div>

        <div className="p-2.5 bg-emerald-50/60 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Kas Tunai
          </span>
          <span className="font-mono font-bold text-emerald-800 mt-0.5 block">
            {formatRupiah(shift.totalCashSales)}
          </span>
        </div>

        <div className="p-2.5 bg-blue-50/60 rounded-xl">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> QRIS
          </span>
          <span className="font-mono font-bold text-blue-800 mt-0.5 block">
            {formatRupiah(shift.totalQrisSales)}
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Struk
          </span>
          <span className="font-mono font-bold text-slate-800 mt-0.5 block">
            {shift.totalTransactions} Transaksi
          </span>
        </div>
      </div>

      {/* Cash Reconciliation Result */}
      {shift.status === 'CLOSED' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            {hasDiff ? (
              <AlertTriangle className={`w-4 h-4 ${isShortage ? 'text-rose-600' : 'text-amber-600'}`} />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-slate-600">
              Fisik Laci: <strong className="font-mono text-slate-900">{formatRupiah(shift.actualCashCount || 0)}</strong>
            </span>
          </div>

          <div className="font-mono font-bold">
            {shift.difference === 0 ? (
              <span className="text-emerald-600">Sesuai (Selisih Rp 0)</span>
            ) : isShortage ? (
              <span className="text-rose-600">Kurang {formatRupiah(Math.abs(shift.difference || 0))}</span>
            ) : (
              <span className="text-amber-600">Lebih +{formatRupiah(shift.difference || 0)}</span>
            )}
          </div>
        </div>
      )}

      {shift.notes && (
        <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
          Catatan Shift: {shift.notes}
        </p>
      )}
    </div>
  );
}
