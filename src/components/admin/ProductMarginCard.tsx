'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface ProductMarginCardProps {
  isPromo: boolean;
  marginNominal: number;
  marginPercent: number;
}

export function ProductMarginCard({
  isPromo,
  marginNominal,
  marginPercent,
}: ProductMarginCardProps) {
  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Estimasi Margin Keuntungan Toko
          </span>
          <span className="text-[11px] text-slate-500">
            {isPromo
              ? 'Dihitung berdasarkan harga promo diskon aktif'
              : 'Dihitung dari selisih harga jual kasir dan modal (HPP)'}
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-black font-mono text-emerald-600 block">
          +{formatRupiah(marginNominal)} ({marginPercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
