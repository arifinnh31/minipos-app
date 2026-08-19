'use client';

import React, { useState, useEffect } from 'react';
import { Banknote, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PaymentMethod, StoreSettings } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { soundService } from '@/lib/sound';
import confetti from 'canvas-confetti';
import { PosCashPaymentForm } from './PosCashPaymentForm';
import { PosQrisPaymentView } from './PosQrisPaymentView';

interface PosPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  storeSettings: StoreSettings;
  onConfirmPayment: (method: PaymentMethod, cashReceived: number, changeGiven: number) => void;
}

export function PosPaymentModal({
  isOpen,
  onClose,
  total,
  storeSettings,
  onConfirmPayment,
}: PosPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashInput, setCashInput] = useState<string>('');
  const [qrisTimer, setQrisTimer] = useState<number>(300); // 5 minutes in seconds

  useEffect(() => {
    if (isOpen) {
      setMethod('CASH');
      setCashInput('');
      setQrisTimer(300);
    }
  }, [isOpen]);

  // QRIS Countdown Timer
  useEffect(() => {
    if (!isOpen || method !== 'QRIS') return;
    const interval = setInterval(() => {
      setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, method]);

  const cashReceived = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashReceived - total);
  const isInsufficient = method === 'CASH' && cashReceived < total;

  const handleCashPaymentSubmit = React.useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isInsufficient) {
      soundService.playErrorBuzz();
      return;
    }

    soundService.playCashDing();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    onConfirmPayment('CASH', cashReceived, change);
  }, [isInsufficient, onConfirmPayment, cashReceived, change]);

  const handleQrisPaymentSuccess = () => {
    soundService.playCashDing();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });

    onConfirmPayment('QRIS', total, 0);
  };

  // Keyboard shortcut listener inside payment modal (Enter for confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && method === 'CASH' && !isInsufficient) {
        e.preventDefault();
        handleCashPaymentSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, method, isInsufficient, handleCashPaymentSubmit]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Banknote className="w-6 h-6 text-blue-600" />
          <span>Metode Pembayaran</span>
        </div>
      }
      description="Pilih metode pembayaran dan masukkan nominal uang tunai atau scan QRIS."
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Total Tagihan Bar (Clean Light Theme) */}
        <div className="p-4 bg-blue-50/70 border border-blue-200/90 text-slate-900 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-blue-900 font-bold uppercase tracking-wider block">
              TOTAL TAGIHAN PELANGGAN
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              Lunas setelah pembayaran diverifikasi
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-blue-700">
            {formatRupiah(total)}
          </span>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
              method === 'CASH'
                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>TUNAI (Cash)</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('QRIS')}
            className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
              method === 'QRIS'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>QRIS / E-WALLET</span>
          </button>
        </div>

        {/* TAB 1: CASH PAYMENT FORM */}
        {method === 'CASH' && (
          <PosCashPaymentForm
            total={total}
            cashInput={cashInput}
            onCashInputChange={setCashInput}
            onSubmit={handleCashPaymentSubmit}
          />
        )}

        {/* TAB 2: QRIS PAYMENT VIEW */}
        {method === 'QRIS' && (
          <PosQrisPaymentView
            storeSettings={storeSettings}
            qrisTimer={qrisTimer}
            onSimulateSuccess={handleQrisPaymentSuccess}
          />
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} size="sm">
            <span>Batal <span className="hidden sm:inline">(Esc)</span></span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
