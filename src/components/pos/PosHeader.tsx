'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Clock, PauseCircle, ShieldAlert, Store, UserCheck, LayoutDashboard, History, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CashierShift, CashierUser, StoreSettings } from '@/types/pos';

interface PosHeaderProps {
  storeSettings: StoreSettings;
  activeShift: CashierShift | null;
  activeCashier?: CashierUser | null;
  heldCount: number;
  onOpenCamera: () => void;
  onOpenHoldDrawer: () => void;
  onOpenHistory: () => void;
  onOpenShiftModal: () => void;
  onOpenChangePin?: () => void;
  onLockTerminal?: () => void;
  onOpenAdminMode: () => void;
}

export function PosHeader({
  storeSettings,
  activeShift,
  activeCashier,
  heldCount,
  onOpenCamera,
  onOpenHoldDrawer,
  onOpenHistory,
  onOpenShiftModal,
  onOpenChangePin,
  onLockTerminal,
  onOpenAdminMode,
}: PosHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-40">
      {/* Modern Sophisticated Gradient Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />

      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Store & Cashier Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 tracking-tighter">
            <Store className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight">
                {storeSettings.storeName}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                POS Kasir
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[130px] sm:max-w-none">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{activeCashier ? activeCashier.name : activeShift ? activeShift.cashierName : 'Kasir Belum Login'}</span>
              </span>

              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                {activeShift?.shiftName.split('(')[0] || 'Shift Belum Aktif'}
              </span>

              {onOpenChangePin && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={onOpenChangePin}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-700 font-semibold cursor-pointer transition-colors"
                    title="Ubah PIN Kasir Saya"
                  >
                    <KeyRound className="w-3 h-3 text-slate-400" />
                    <span>Ubah PIN</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-700 font-mono font-semibold text-xs border border-slate-200/80 shadow-2xs">
          <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>{timeStr || '00:00:00'} WIB</span>
        </div>

        {/* Action Fast Buttons (Ordered: F2 -> F3 -> F7 -> F12 -> Lock -> Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. Camera Scanner Trigger (F2) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCamera}
            className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70"
            title="Buka Kamera Barcode Scanner (F2)"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline font-semibold">Scan Barcode</span>
            <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 bg-blue-200/80 rounded font-mono font-bold">F2</span>
          </Button>

          {/* 2. Transaction History Trigger (F3) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Riwayat Transaksi & Cetak Ulang (F3)"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden lg:inline font-semibold">Riwayat</span>
            <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 bg-slate-200 rounded font-mono font-bold">F3</span>
          </Button>

          {/* 3. Hold Cart Drawer Trigger (F7) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHoldDrawer}
            className="relative border-amber-200 text-amber-900 bg-amber-50/50 hover:bg-amber-100/70"
            title="Lihat Antrean Hold Cart (F7)"
          >
            <PauseCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline font-semibold">Hold Cart</span>
            {heldCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-xs font-bold animate-bounce">
                {heldCount}
              </span>
            )}
            <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 bg-amber-200/80 rounded font-mono font-bold">F7</span>
          </Button>

          {/* 4. Lock Terminal Button (F10) */}
          {onLockTerminal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLockTerminal}
              className="border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-semibold"
              title="Kunci Layar Terminal Kasir (F10)"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Kunci POS</span>
              <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 bg-slate-200 text-slate-800 rounded font-mono font-bold">F10</span>
            </Button>
          )}

          {/* 5. Shift Menu Trigger (F12) */}
          <Button
            variant={activeShift ? 'secondary' : 'danger'}
            size="sm"
            onClick={onOpenShiftModal}
            title="Manajemen Shift Buka/Tutup Kasir (F12)"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">
              {activeShift ? 'Shift Aktif' : 'Buka Shift'}
            </span>
            <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 bg-slate-200 text-slate-800 rounded font-mono font-bold">F12</span>
          </Button>

          {/* 6. Protected Switch to Admin - HANYA MUNCUL JIKA USER ADALAH ADMIN */}
          {activeCashier?.role === 'ADMIN' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdminMode}
              className="border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold shadow-xs transition-colors"
              title="Buka Dashboard Manajemen Admin"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dashboard Admin</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
