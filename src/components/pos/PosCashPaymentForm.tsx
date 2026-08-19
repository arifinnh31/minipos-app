'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';

interface PosCashPaymentFormProps {
  total: number;
  cashInput: string;
  onCashInputChange: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export function PosCashPaymentForm({
  total,
  cashInput,
  onCashInputChange,
  onSubmit,
}: PosCashPaymentFormProps) {
  const cashReceived = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashReceived - total);
  const isInsufficient = cashReceived < total;

  const handleQuickAmount = (amount: number) => {
    onCashInputChange(amount.toString());
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 animate-in fade-in duration-100">
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Nominal Uang Diterima (Rp)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={cashInput}
            onChange={(e) => onCashInputChange(e.target.value)}
            placeholder={`Contoh: ${total}`}
            className="w-full h-14 pl-4 pr-16 rounded-xl border-2 border-slate-300 font-mono font-black text-2xl text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-inner"
            autoFocus
          />
          {cashInput && (
            <button
              type="button"
              onClick={() => onCashInputChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded-md font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Denominations Buttons */}
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Pecahan Cepat Uang Kas:
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickAmount(total)}
            className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black font-mono shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            Uang Pas
          </button>
          {[10000, 20000, 50000, 100000, 200000].map((nominal) => (
            <button
              key={nominal}
              type="button"
              onClick={() => handleQuickAmount(nominal)}
              className="py-2.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold font-mono shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              {nominal >= 1000 ? `${nominal / 1000}k` : nominal}
            </button>
          ))}
        </div>
      </div>

      {/* Kembalian Display Box */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
          isInsufficient
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block">
            {isInsufficient ? 'UANG KURANG SEBESAR:' : 'UANG KEMBALIAN KASIR:'}
          </span>
          <span className="text-xs opacity-80">
            {isInsufficient
              ? 'Nominal belum mencukupi total tagihan'
              : 'Serahkan uang kembalian ke pelanggan'}
          </span>
        </div>
        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {isInsufficient ? formatRupiah(total - cashReceived) : formatRupiah(change)}
        </span>
      </div>

      {/* Confirm Cash Button */}
      <Button
        type="submit"
        variant="success"
        size="lg"
        disabled={isInsufficient}
        className="w-full min-h-[54px] text-lg font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
      >
        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        <span>PROSES PEMBAYARAN TUNAI (Enter)</span>
      </Button>
    </form>
  );
}
