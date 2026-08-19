'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface StoreReceiptSectionProps {
  footerNote: string;
  enableTax: boolean;
  onFooterNoteChange: (val: string) => void;
  onEnableTaxChange: (val: boolean) => void;
}

export function StoreReceiptSection({
  footerNote,
  enableTax,
  onFooterNoteChange,
  onEnableTaxChange,
}: StoreReceiptSectionProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle icon={<Settings className="w-5 h-5 text-blue-600" />}>
          Format E-Struk &amp; Ketentuan Transaksi
        </CardTitle>
      </CardHeader>

      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Pesan Footer Struk Belanja:
        </label>
        <textarea
          rows={3}
          value={footerNote}
          onChange={(e) => onFooterNoteChange(e.target.value)}
          className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
          placeholder="Pesan di bagian paling bawah struk..."
        />
      </div>

      <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-slate-900 block">Sertakan PPN (11%)</span>
          <span className="text-xs text-slate-500">
            Pajak Pertambahan Nilai sudah termasuk dalam harga jual produk ritel.
          </span>
        </div>
        <input
          type="checkbox"
          checked={enableTax}
          onChange={(e) => onEnableTaxChange(e.target.checked)}
          className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
        />
      </div>
    </Card>
  );
}
