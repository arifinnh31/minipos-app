'use client';

import React from 'react';
import { Transaction, StoreSettings } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface PosReceiptPaperProps {
  transaction: Transaction;
  storeSettings: StoreSettings;
}

export function PosReceiptPaper({ transaction, storeSettings }: PosReceiptPaperProps) {
  return (
    <div className="receipt-paper relative bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm font-mono text-xs text-slate-800 space-y-2 max-h-[340px] overflow-y-auto">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-300">
        <h3 className="font-extrabold text-sm text-slate-900 tracking-wide">
          {storeSettings.storeName}
        </h3>
        <p className="text-[11px] text-slate-500">{storeSettings.address}</p>
        <p className="text-[11px] text-slate-500">Telp: {storeSettings.phone}</p>
      </div>

      {/* Meta */}
      <div className="space-y-0.5 text-[11px] text-slate-600 pb-2 border-b border-dashed border-slate-300">
        <div className="flex justify-between">
          <span>No. Struk:</span>
          <span className="font-bold text-slate-900">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{formatDateTime(transaction.createdAt)}</span>
        </div>
      </div>

      {/* Itemized List */}
      <div className="py-2 space-y-2 border-b border-dashed border-slate-300">
        {transaction.items.map((item) => (
          <div key={item.id} className="space-y-0.5">
            <div className="font-bold text-slate-900">{item.product.name}</div>
            <div className="flex justify-between text-slate-600">
              <span>
                {item.quantity} x {formatRupiah(item.unitPrice)}
                {item.discountPerItem > 0 && (
                  <span className="text-rose-600 font-sans text-[10px] ml-1">
                    (Hemat {formatRupiah(item.discountTotal)})
                  </span>
                )}
              </span>
              <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 pt-1 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal (Harga Normal)</span>
          <span>{formatRupiah(transaction.subtotal)}</span>
        </div>

        {transaction.discountTotal > 0 && (
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Total Diskon Promo Toko</span>
            <span>-{formatRupiah(transaction.discountTotal)}</span>
          </div>
        )}

        <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
          <span>TOTAL TAGIHAN</span>
          <span>{formatRupiah(transaction.total)}</span>
        </div>

        <div className="flex justify-between text-slate-600 pt-1">
          <span>METODE BAYAR</span>
          <span className="font-bold">{transaction.paymentMethod === 'CASH' ? 'TUNAI' : 'QRIS'}</span>
        </div>

        {transaction.paymentMethod === 'CASH' && (
          <>
            <div className="flex justify-between text-slate-600">
              <span>Uang Diterima</span>
              <span>{formatRupiah(transaction.cashReceived || transaction.total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.changeGiven || 0)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-300">
        <p>{storeSettings.footerNote}</p>
      </div>
    </div>
  );
}
