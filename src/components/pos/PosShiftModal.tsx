'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PlayCircle,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CashierShift, ShiftTimingConfig } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { soundService } from '@/lib/sound';

interface PosShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: CashierShift | null;
  shiftConfig?: ShiftTimingConfig;
  onStartShift: (startingCash: number, shiftName: string) => void;
  onCloseShift: (actualCashCount: number, notes: string) => void;
}

export function PosShiftModal({
  isOpen,
  onClose,
  activeShift,
  shiftConfig,
  onStartShift,
  onCloseShift,
}: PosShiftModalProps) {
  const isShift4Enabled = shiftConfig?.enableShift4 ?? true;

  // Construct dynamic shift options matching shiftConfig
  const shift1Label = `${shiftConfig?.shift1Name || 'Shift 1 (Pagi)'} (${shiftConfig?.shift1Start || '07:00'} - ${shiftConfig?.shift1End || '15:00'})`;
  const shift2Label = `${shiftConfig?.shift2Name || 'Shift 2 (Siang)'} (${shiftConfig?.shift2Start || '15:00'} - ${shiftConfig?.shift2End || '23:00'})`;
  const shift3Label = `${shiftConfig?.shift3Name || 'Shift 3 (Malam)'} (${shiftConfig?.shift3Start || '23:00'} - ${shiftConfig?.shift3End || '07:00'})`;
  const shift4Label = `${shiftConfig?.shift4Name || 'Shift 4 (Gerai 24 Jam)'} (24 Jam Nonstop)`;

  // Dynamic shift options based on Shift 4 toggle
  const availableShiftOptions = [
    shift1Label,
    shift2Label,
    shift3Label,
    ...(isShift4Enabled ? [shift4Label] : []),
  ];

  // Determine automatic shift recommendation based on current time
  const getAutoDetectedShift = React.useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 7 && currentHour < 15) {
      return shift1Label;
    } else if (currentHour >= 15 && currentHour < 23) {
      return shift2Label;
    } else {
      // 23:00 - 07:00 defaults to Shift 3 (Malam)
      return shift3Label;
    }
  }, [shift1Label, shift2Label, shift3Label]);

  // Open Shift Form State
  const [startingCashInput, setStartingCashInput] = useState('300000');
  const [shiftName, setShiftName] = useState(() => getAutoDetectedShift());

  // Close Shift Form State
  const [actualCashInput, setActualCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  // Re-evaluate auto detected shift whenever modal opens
  useEffect(() => {
    if (isOpen && !activeShift) {
      setShiftName(getAutoDetectedShift());
    }
  }, [isOpen, activeShift, getAutoDetectedShift]);

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(startingCashInput) || 0;
    onStartShift(amount, shiftName);
    soundService.playScanBeep();
    onClose();
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(actualCashInput) || 0;
    onCloseShift(counted, closingNotes);
    soundService.playCashDing();
    onClose();
  };

  const isShiftOpen = !!activeShift && activeShift.status === 'OPEN';
  const expectedCash = activeShift ? activeShift.startingCash + activeShift.totalCashSales : 0;
  const countedCash = parseFloat(actualCashInput) || 0;
  const difference = countedCash - expectedCash;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <span>{isShiftOpen ? 'Manajemen Tutup Shift Kasir' : 'Buka Shift Kasir Baru'}</span>
        </div>
      }
      description={
        isShiftOpen
          ? 'Lakukan perhitungan fisik uang di laci (Blind Count) untuk rekonsiliasi kas.'
          : 'Pilih jadwal shift kerja dan masukkan modal awal uang receh di laci sebelum melayani transaksi.'
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* ================= MODE 1: BUKA SHIFT ================= */}
        {!isShiftOpen && (
          <form onSubmit={handleStartSubmit} className="flex flex-col gap-4">
            {/* Jadwal Shift Lengkap */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Jadwal Shift Kerja:
              </label>

              <Select
                value={shiftName}
                onChange={setShiftName}
                options={availableShiftOptions.map((opt) => ({ value: opt, label: opt }))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Modal Awal Kas di Laci (Rp):
              </label>
              <Input
                type="number"
                min="0"
                value={startingCashInput}
                onChange={(e) => setStartingCashInput(e.target.value)}
                placeholder="Contoh: 300000"
                className="h-12 font-mono font-black text-lg"
                autoFocus
                required
              />
              <div className="flex gap-1.5 mt-2">
                {[100000, 200000, 300000, 500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStartingCashInput(val.toString())}
                    className="flex-1 py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold mt-2 shadow-md shadow-blue-500/20"
            >
              <PlayCircle className="w-5 h-5" />
              <span>MULAI SHIFT &amp; BUKA KASIR <span className="hidden sm:inline">(F12)</span></span>
            </Button>
          </form>
        )}

        {/* ================= MODE 2: TUTUP SHIFT ================= */}
        {isShiftOpen && (
          <form onSubmit={handleCloseSubmit} className="flex flex-col gap-4">
            {/* Shift Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Nama Kasir / Shift:</span>
                <span className="font-bold text-slate-900">
                  {activeShift.cashierName} ({activeShift.shiftName.split('(')[0]})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Waktu Mulai:</span>
                <span>{formatDateTime(activeShift.startTime)}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                <span>Modal Awal Kas:</span>
                <span className="font-mono font-bold">{formatRupiah(activeShift.startingCash)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Penjualan Tunai Sistem:</span>
                <span className="font-mono font-bold">{formatRupiah(activeShift.totalCashSales)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Penjualan QRIS Sistem:</span>
                <span className="font-mono font-bold">{formatRupiah(activeShift.totalQrisSales)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-2">
                <span>Ekspektasi Uang Tunai di Laci:</span>
                <span className="font-mono text-blue-700">{formatRupiah(expectedCash)}</span>
              </div>
            </div>

            {/* Blind Count Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hitung Fisik Uang di Laci (Blind Count):
              </label>
              <Input
                type="number"
                min="0"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                placeholder="Masukkan total hitungan fisik uang di laci kas..."
                className="h-12 font-mono font-black text-lg"
                autoFocus
                required
              />
            </div>

            {/* Difference / Reconciliation Status */}
            {actualCashInput && (
              <div
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between animate-in fade-in duration-150 ${
                  difference === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : difference > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {difference === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {difference === 0
                        ? 'UANG SESUAI (PAS)'
                        : difference > 0
                        ? 'UANG LEBIH (OVER)'
                        : 'UANG KURANG (SHORT)'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Selisih fisik kas vs pencatatan sistem
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono">
                  {difference === 0 ? 'Rp 0' : formatRupiah(Math.abs(difference))}
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Catatan Penutupan Shift (Opsional):
              </label>
              <Input
                type="text"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="Contoh: Uang kembalian 2000an tersisa di laci..."
              />
            </div>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-full bg-rose-600 hover:bg-rose-700 font-bold mt-2 shadow-md shadow-rose-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span>REKONSILIASI KAS &amp; TUTUP SHIFT</span>
            </Button>
          </form>
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
