'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Transaction } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface SalesReportRowProps {
  transaction: Transaction;
  onViewReceipt: (transaction: Transaction) => void;
}

export function SalesReportRow({ transaction: tx, onViewReceipt }: SalesReportRowProps) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
        {tx.receiptNumber}
      </td>
      <td className="py-3.5 px-4 text-slate-500 font-mono">
        {formatDateTime(tx.createdAt)}
      </td>
      <td className="py-3.5 px-4 font-bold text-slate-700">
        {tx.cashierName}
      </td>
      <td className="py-3.5 px-4 font-mono">
        {tx.items.length} Macam Barang
      </td>
      <td className="py-3.5 px-4">
        <Badge variant={tx.paymentMethod === 'CASH' ? 'green' : 'blue'}>
          {tx.paymentMethod === 'CASH' ? 'Tunai' : 'QRIS'}
        </Badge>
      </td>
      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
        {formatRupiah(tx.total)}
      </td>
      <td className="py-3.5 px-4 text-center">
        <button
          type="button"
          onClick={() => onViewReceipt(tx)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 font-semibold text-xs cursor-pointer"
          title="Buka Struk Digital"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Lihat Struk</span>
        </button>
      </td>
    </tr>
  );
}
