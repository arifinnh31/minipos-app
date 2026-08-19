'use client';

import React from 'react';
import { Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Transaction } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface PosHistoryRowProps {
  tx: Transaction;
  onReprint: (tx: Transaction) => void;
}

export function PosHistoryRow({ tx, onReprint }: PosHistoryRowProps) {
  return (
    <div className="p-3.5 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 text-sm">
            {tx.receiptNumber}
          </span>
          <Badge variant={tx.paymentMethod === 'CASH' ? 'green' : 'blue'}>
            {tx.paymentMethod === 'CASH' ? 'Tunai' : 'QRIS'}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDateTime(tx.createdAt)}
          </span>
          <span>•</span>
          <span>Kasir: {tx.cashierName}</span>
          <span>•</span>
          <span>{tx.items.length} Item</span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <span className="font-black text-slate-900 font-mono text-base">
          {formatRupiah(tx.total)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReprint(tx)}
          className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Ulang Struk</span>
        </Button>
      </div>
    </div>
  );
}
