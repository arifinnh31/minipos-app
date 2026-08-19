'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StoreSettings } from '@/types/pos';

interface PosQrisPaymentViewProps {
  storeSettings: StoreSettings;
  qrisTimer: number;
  onSimulateSuccess: () => void;
}

export function PosQrisPaymentView({
  storeSettings,
  qrisTimer,
  onSimulateSuccess,
}: PosQrisPaymentViewProps) {
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in duration-100">
      {/* QR Card */}
      <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-extrabold text-slate-800 text-sm tracking-wide">
            {storeSettings.storeName}
          </span>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            QRIS STATIS
          </span>
        </div>

        {/* QR Image */}
        <div className="w-52 h-52 bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
          <Image
            src={storeSettings.qrisImageUrl}
            alt="QRIS Payment"
            width={192}
            height={192}
            className="w-48 h-48 object-contain"
            unoptimized
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Sisa Waktu QR:{' '}
            <strong className="font-mono text-slate-800">{formatTimer(qrisTimer)}</strong>
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mt-1 max-w-[260px]">
          Mendukung BCA Mobile, Mandiri, GoPay, OVO, ShopeePay, DANA, dan LinkAja
        </p>
      </div>

      {/* Test Simulation Button */}
      <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-xs text-slate-600 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Simulasikan notifikasi webhook pembayaran lunas:</span>
        </div>
        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={onSimulateSuccess}
          className="shrink-0 w-full sm:w-auto font-bold"
        >
          <span>⚡ Simulasikan Pembayaran Berhasil</span>
        </Button>
      </div>
    </div>
  );
}
