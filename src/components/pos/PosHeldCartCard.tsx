'use client';

import React from 'react';
import { Play, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeldCart } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface PosHeldCartCardProps {
  held: HeldCart;
  onResume: (held: HeldCart) => void;
  onDelete: (id: string) => void;
}

export function PosHeldCartCard({ held, onResume, onDelete }: PosHeldCartCardProps) {
  return (
    <div className="p-4 bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all shadow-xs flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
              {held.label}
            </span>
            <h4 className="font-extrabold text-slate-900 text-base">{held.customerName}</h4>
          </div>
          {held.note && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{held.note}</span>
            </p>
          )}
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Waktu Simpan: {formatDateTime(held.heldAt)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Belanja</span>
          <span className="text-lg font-black text-blue-700 font-mono">
            {formatRupiah(held.total)}
          </span>
        </div>
      </div>

      {/* Items preview */}
      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 space-y-1">
        {held.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.product.name} x {it.quantity}
            </span>
            <span className="font-mono font-medium">{formatRupiah(it.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(held.id)}
          className="text-rose-600 hover:bg-rose-50 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Antrean</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onResume(held)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Resume / Muat ke Kasir</span>
        </Button>
      </div>
    </div>
  );
}
