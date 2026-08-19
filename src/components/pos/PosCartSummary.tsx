'use client';

import React from 'react';
import { PauseCircle, ArrowRight, Tag } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface PosCartSummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  onHoldCart: () => void;
  disabled?: boolean;
}

export function PosCartSummary({
  subtotal,
  discount,
  tax,
  total,
  itemCount,
  onCheckout,
  onHoldCart,
  disabled = false,
}: PosCartSummaryProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5"
    >
      {/* Financial Breakdown */}
      <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-2.5">
        <div className="flex justify-between items-center">
          <span>Subtotal ({itemCount} item):</span>
          <span className="font-mono font-semibold text-slate-800">
            {formatRupiah(subtotal + discount)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-rose-600 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Total Diskon Promo Toko:</span>
            </span>
            <span className="font-mono">-{formatRupiah(discount)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between items-center text-slate-500">
            <span>Termasuk PPN (11%):</span>
            <span className="font-mono">{formatRupiah(tax)}</span>
          </div>
        )}
      </div>

      {/* Grand Total Display */}
      <div className="flex items-baseline justify-between pt-0.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Total Tagihan
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {discount > 0 ? 'Sudah termasuk potongan promo' : 'Siap diproses'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight font-mono">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-12 gap-2 pt-1">
        {/* Hold Cart Button (F4) - INLINE HORIZONTAL ICON & TEXT */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={disabled}
          onClick={onHoldCart}
          className="col-span-4 h-12 rounded-xl border-slate-300 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 flex items-center justify-center gap-1.5 px-2 cursor-pointer transition-colors shadow-xs"
          title="Tahan transaksi pelanggan saat ini"
        >
          <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold whitespace-nowrap">
            Hold <span className="hidden sm:inline">(F4)</span>
          </span>
        </Button>

        {/* Big Pay Button (F8 / Space) */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={disabled}
          onClick={onCheckout}
          className="col-span-8 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          title="Buka Pembayaran Tunai/QRIS"
        >
          <span>
            BAYAR <span className="hidden sm:inline">(F8)</span>
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
