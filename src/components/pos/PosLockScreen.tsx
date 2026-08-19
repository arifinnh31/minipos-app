'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Lock,
  UserCheck,
  Delete,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { CashierUser, StoreSettings } from '@/types/pos';
import { verifyCashierPinAction } from '@/actions/auth';
import { soundService } from '@/lib/sound';

interface PosLockScreenProps {
  storeSettings: StoreSettings;
  cashiers: CashierUser[];
  onUnlockSuccess: (cashier: CashierUser) => void;
}

export function PosLockScreen({
  storeSettings,
  cashiers,
  onUnlockSuccess,
}: PosLockScreenProps) {
  // Include all active cashiers and administrators with PIN
  const activeUsers = React.useMemo(() => cashiers.filter((c) => c.isActive), [cashiers]);
  const [selectedCashierId, setSelectedCashierId] = useState<string>(() => {
    const first = cashiers.find((c) => c.isActive);
    return first ? first.id : '';
  });

  // Derived selected user
  const selectedCashier = React.useMemo(() => {
    return activeUsers.find((c) => c.id === selectedCashierId) || activeUsers[0] || null;
  }, [activeUsers, selectedCashierId]);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const LOCKOUT_KEY = 'minipos_pos_lockout_until';
  const ATTEMPTS_KEY = 'minipos_pos_failed_attempts';

  const getStoredLockoutSeconds = React.useCallback(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const expiry = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      return remaining;
    } catch {
      return 0;
    }
  }, [LOCKOUT_KEY]);

  // Initialize and check lockout from localStorage on mount (survives browser refresh)
  useEffect(() => {
    const remaining = getStoredLockoutSeconds();
    if (remaining > 0) {
      setLockoutSeconds(remaining);
    }
    try {
      const savedAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
      if (savedAttempts > 0) setFailedAttempts(savedAttempts);
    } catch {}
  }, [getStoredLockoutSeconds, ATTEMPTS_KEY]);

  // Lockout Countdown Timer synchronized with real wall-clock timestamp
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      const remaining = getStoredLockoutSeconds();
      if (remaining <= 0) {
        try {
          localStorage.removeItem(LOCKOUT_KEY);
        } catch {}
        setLockoutSeconds(0);
        setError('');
      } else {
        setLockoutSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds, getStoredLockoutSeconds, LOCKOUT_KEY]);

  // Profile button refs to auto-scroll into view when navigating via arrow keys
  const userButtonRefs = useRef<{ [id: string]: HTMLButtonElement | null }>({});

  // Keep selected ID in sync if activeUsers list updates
  useEffect(() => {
    if (activeUsers.length > 0) {
      const exists = activeUsers.some((u) => u.id === selectedCashierId);
      if (!exists) {
        setSelectedCashierId(activeUsers[0].id);
      }
    }
  }, [activeUsers, selectedCashierId]);

  // Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigit = React.useCallback(async (digit: string) => {
    const currentLockout = getStoredLockoutSeconds();
    if (isVerifying || currentLockout > 0) return;

    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');

      // Auto submit on 4 digits
      if (nextPin.length === 4 && selectedCashier) {
        setIsVerifying(true);
        const res = await verifyCashierPinAction(selectedCashier.id, nextPin);
        setIsVerifying(false);

        if (res.success && res.cashier) {
          soundService.playBeepSuccess();
          try {
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
          } catch {}
          setFailedAttempts(0);
          setLockoutSeconds(0);
          onUnlockSuccess(selectedCashier);
        } else {
          soundService.playErrorBuzz();
          const nextFailed = failedAttempts + 1;
          setPin('');

          if (nextFailed >= 3) {
            const expiry = Date.now() + 30 * 1000;
            try {
              localStorage.setItem(LOCKOUT_KEY, expiry.toString());
              localStorage.removeItem(ATTEMPTS_KEY);
            } catch {}
            setLockoutSeconds(30);
            setFailedAttempts(0);
            setError('Terlalu banyak percobaan PIN salah. Terminal terkunci 30 detik.');
          } else {
            try {
              localStorage.setItem(ATTEMPTS_KEY, nextFailed.toString());
            } catch {}
            setFailedAttempts(nextFailed);
            setError(
              `${res.error || 'PIN yang dimasukkan salah.'} (Percobaan ${nextFailed} dari 3)`
            );
          }
        }
      }
    }
  }, [isVerifying, getStoredLockoutSeconds, pin, selectedCashier, failedAttempts, onUnlockSuccess, LOCKOUT_KEY, ATTEMPTS_KEY]);

  const handleBackspace = React.useCallback(() => {
    if (lockoutSeconds > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  }, [lockoutSeconds]);

  const handleClear = React.useCallback(() => {
    if (lockoutSeconds > 0) return;
    setPin('');
    setError('');
  }, [lockoutSeconds]);

  // Keyboard Numpad & Arrow Keys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying || lockoutSeconds > 0) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (activeUsers.length === 0) return;

        const currentIdx = activeUsers.findIndex((u) => u.id === selectedCashier?.id);
        const cols = typeof window !== 'undefined' && window.innerWidth >= 640 ? 3 : 2;
        let nextIdx = 0;

        if (e.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % activeUsers.length;
        } else if (e.key === 'ArrowLeft') {
          nextIdx = (currentIdx - 1 + activeUsers.length) % activeUsers.length;
        } else if (e.key === 'ArrowDown') {
          nextIdx = (currentIdx + cols) % activeUsers.length;
        } else if (e.key === 'ArrowUp') {
          nextIdx = (currentIdx - cols + activeUsers.length) % activeUsers.length;
        }

        const targetUser = activeUsers[nextIdx];
        if (targetUser) {
          setSelectedCashierId(targetUser.id);
          setPin('');
          setError('');
          soundService.playBeepSoft();

          // Scroll button into view smoothly
          const btn = userButtonRefs.current[targetUser.id];
          if (btn) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVerifying, lockoutSeconds, handleDigit, handleBackspace, handleClear, activeUsers, selectedCashier]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-hidden h-screen max-h-screen">
      {/* Top Bar: Store Brand & Live Clock */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 px-3 border-b border-slate-200/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight">
              {storeSettings.storeName}
            </h2>
            <span className="text-xs text-slate-500 font-medium block">
              {storeSettings.tagline || 'Terminal Point of Sale'}
            </span>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-sm font-mono font-bold text-slate-800 bg-white border border-slate-200 shadow-2xs px-3 py-1 rounded-xl inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{timeStr || '00:00:00'} WIB</span>
          </div>
          <span className="text-xs text-slate-500 block mt-0.5">{dateStr}</span>
        </div>
      </div>

      {/* Perfectly Vertically & Horizontally Centered Middle Area */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 py-2">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-5 sm:p-7 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-2.5 shadow-xs">
            <Lock className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Terminal Kasir Terkunci
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Pilih akun Anda (Kasir atau Admin) lalu masukkan 4-digit PIN operasional untuk membuka meja kasir.
          </p>

          {/* User Profiles Grid (Cashiers & Admins) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3.5 max-h-[125px] overflow-y-auto p-1">
            {activeUsers.map((c) => {
              const isSelected = selectedCashier?.id === c.id;
              const isAdmin = c.role === 'ADMIN';
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    userButtonRefs.current[c.id] = el;
                  }}
                  type="button"
                  onClick={() => {
                    setSelectedCashierId(c.id);
                    setPin('');
                    setError('');
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl text-center border-2 transition-all cursor-pointer ${
                    isSelected
                      ? isAdmin
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm font-bold scale-[1.02]'
                        : 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm font-bold scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck
                      className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                        isSelected ? 'text-indigo-600' : 'text-indigo-500'
                      }`}
                    />
                  ) : (
                    <UserCheck
                      className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                        isSelected ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                  )}
                  <span className="text-xs font-bold block truncate">
                    {c.name.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[10px] font-mono block ${
                      isAdmin ? 'text-indigo-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Kasir'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* PIN Indicators */}
          <div className="flex flex-col items-center gap-1.5 py-3">
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    pin.length > index
                      ? 'bg-blue-600 border-blue-500 scale-110 shadow-md shadow-blue-500/30'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                />
              ))}
            </div>

            {lockoutSeconds > 0 ? (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
                <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-xs font-bold text-rose-800">
                  Terlalu banyak salah PIN. Tunggu {lockoutSeconds} detik...
                </span>
              </div>
            ) : error ? (
              <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-center animate-in fade-in">
                {error}
              </p>
            ) : isVerifying ? (
              <p className="text-xs text-blue-600 font-semibold animate-pulse">
                Memverifikasi PIN...
              </p>
            ) : selectedCashier ? (
              <p className="text-xs text-slate-500">
                Petugas: <strong className="text-slate-800 font-semibold">{selectedCashier.name}</strong> ({selectedCashier.role === 'ADMIN' ? 'Admin' : 'Kasir'})
              </p>
            ) : null}
          </div>

          {/* Numeric Numpad */}
          <div className="w-full grid grid-cols-3 gap-2 mt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={lockoutSeconds > 0}
                onClick={() => handleDigit(digit)}
                className={`h-11 sm:h-12 rounded-2xl border text-slate-900 font-mono font-bold text-xl transition-all shadow-2xs ${
                  lockoutSeconds > 0
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-slate-100 active:scale-95 border-slate-200 cursor-pointer hover:border-slate-300'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={handleClear}
              className={`h-11 sm:h-12 rounded-2xl border font-mono font-bold text-xs sm:text-sm transition-all ${
                lockoutSeconds > 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-rose-50 hover:bg-rose-100 active:scale-95 border-rose-200 text-rose-700 cursor-pointer'
              }`}
            >
              CLEAR
            </button>
            <button
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={() => handleDigit('0')}
              className={`h-11 sm:h-12 rounded-2xl border text-slate-900 font-mono font-bold text-xl transition-all shadow-2xs ${
                lockoutSeconds > 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100 active:scale-95 border-slate-200 cursor-pointer hover:border-slate-300'
              }`}
            >
              0
            </button>
            <button
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={handleBackspace}
              className={`h-11 sm:h-12 rounded-2xl border flex items-center justify-center font-bold transition-all ${
                lockoutSeconds > 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-amber-50 hover:bg-amber-100 active:scale-95 border-amber-200 text-amber-700 cursor-pointer'
              }`}
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Minimalist Info */}
      <div className="w-full text-center py-1.5 shrink-0">
        <span className="text-[11px] text-slate-400 font-mono">
          MiniPOS Terminal • Sistem Kasir Pintar
        </span>
      </div>
    </div>
  );
}

