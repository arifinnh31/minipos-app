'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CashierShift } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface PosShiftSummaryModalProps {
  shiftData: CashierShift | null;
  onClose: () => void;
}

export function PosShiftSummaryModal({ shiftData, onClose }: PosShiftSummaryModalProps) {
  if (!shiftData) return null;

  return (
    <Modal
      isOpen={!!shiftData}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Rekap Penutupan Shift Selesai</span>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-4 text-xs text-slate-700">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-emerald-950">Shift Berhasil Ditutup</h4>
            <p className="text-emerald-800">
              Laporan rekonsiliasi kas telah tersimpan di sistem.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
          <div className="flex justify-between">
            <span>Petugas Kasir:</span>
            <span className="font-bold text-slate-900">{shiftData.cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu Shift:</span>
            <span>
              {formatDateTime(shiftData.startTime)} - {formatDateTime(shiftData.endTime || '')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span>Total Penjualan Tunai:</span>
            <span className="font-mono font-bold">{formatRupiah(shiftData.totalCashSales)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Penjualan QRIS:</span>
            <span className="font-mono font-bold">{formatRupiah(shiftData.totalQrisSales)}</span>
          </div>
          <div className="flex justify-between">
            <span>Modal Awal Kas:</span>
            <span className="font-mono font-bold">{formatRupiah(shiftData.startingCash)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Fisik Kas di Laci:</span>
            <span className="font-mono">{formatRupiah(shiftData.actualCashCount || 0)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-slate-900">
            <span>Status Selisih Kas:</span>
            <span
              className={
                shiftData.difference === 0
                  ? 'text-emerald-600 font-mono'
                  : 'text-rose-600 font-mono'
              }
            >
              {shiftData.difference === 0
                ? 'Pas (Rp 0)'
                : formatRupiah(shiftData.difference || 0)}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
          >
            Selesai &amp; Ganti Petugas Shift (Kunci Kasir)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
