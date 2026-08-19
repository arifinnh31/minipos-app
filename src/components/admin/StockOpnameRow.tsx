'use client';

import React from 'react';
import { StockOpnameItem } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Select } from '@/components/ui/Select';

interface StockOpnameRowProps {
  item: StockOpnameItem;
  onPhysicalCountChange: (productId: string, count: number) => void;
  onReasonChange: (productId: string, reason: StockOpnameItem['reason']) => void;
}

export function StockOpnameRow({
  item,
  onPhysicalCountChange,
  onReasonChange,
}: StockOpnameRowProps) {
  const hasDiff = item.difference !== 0;

  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors ${
        hasDiff ? 'bg-amber-50/30' : ''
      }`}
    >
      <td className="py-3.5 px-4">
        <span className="font-bold text-slate-900 block text-sm">{item.productName}</span>
        <span className="text-[10px] text-slate-400 font-mono">
          SKU: {item.sku} • Barcode: {item.barcode}
        </span>
      </td>

      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">
        {item.systemStock}
      </td>

      <td className="py-3.5 px-4 text-center">
        <input
          type="number"
          min="0"
          value={item.physicalStock}
          onChange={(e) =>
            onPhysicalCountChange(item.productId, parseInt(e.target.value) || 0)
          }
          className="w-20 h-9 px-2 text-center rounded-lg border-2 border-slate-300 font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
        />
      </td>

      <td className="py-3.5 px-4 text-center font-mono font-bold">
        {item.difference === 0 ? (
          <span className="text-slate-400">0</span>
        ) : item.difference > 0 ? (
          <span className="text-blue-600">+{item.difference} (Lebih)</span>
        ) : (
          <span className="text-rose-600">{item.difference} (Kurang)</span>
        )}
      </td>

      <td className="py-3.5 px-4 min-w-[200px]">
        <Select
          size="sm"
          value={item.reason || 'SESUAI'}
          onChange={(val) => onReasonChange(item.productId, val as StockOpnameItem['reason'])}
          disabled={item.difference === 0}
          options={[
            { value: 'SESUAI', label: 'Sesuai / Pas' },
            { value: 'RUSAK', label: 'Barang Rusak / Pecah / Bocor' },
            { value: 'KADALUARSA', label: 'Kadaluarsa (Expired)' },
            { value: 'SELISIH_HITUNG', label: 'Selisih Hitung Kasir' },
            { value: 'RETUR', label: 'Retur ke Distributor' },
            { value: 'LAINNYA', label: 'Lainnya' },
          ]}
          menuClassName="w-60"
        />
      </td>

      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
        {item.lossValue > 0 ? (
          <span className="text-rose-600">{formatRupiah(item.lossValue)}</span>
        ) : (
          <span className="text-slate-400">Rp 0</span>
        )}
      </td>
    </tr>
  );
}
