'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { soundService } from '@/lib/sound';
import { changeCashierPinAction } from '@/actions/auth';

interface PosChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashierId: string;
  cashierName: string;
  onSuccess?: () => void;
}

export function PosChangePinModal({
  isOpen,
  onClose,
  cashierId,
  cashierName,
  onSuccess,
}: PosChangePinModalProps) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('PIN baru harus terdiri dari 4 digit angka!');
      return;
    }

    if (newPin === oldPin) {
      setError('PIN baru tidak boleh sama dengan PIN lama!');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN baru tidak cocok!');
      return;
    }

    setIsSubmitting(true);
    const res = await changeCashierPinAction(cashierId, oldPin, newPin);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Gagal mengubah PIN kasir.');
      return;
    }

    soundService.playCashDing();
    setSuccess(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <span>Ubah PIN Kasir Mandiri</span>
        </div>
      }
      description={`Ganti PIN operasional 4-digit untuk akun kasir: ${cashierName}.`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PIN Kasir berhasil diperbarui!</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            PIN Lama Saat Ini:
          </label>
          <Input
            type={showPins ? 'text' : 'password'}
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="font-mono font-bold text-center tracking-widest text-base"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            PIN Baru (4 Digit):
          </label>
          <Input
            type={showPins ? 'text' : 'password'}
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="font-mono font-bold text-center tracking-widest text-base"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Konfirmasi PIN Baru:
          </label>
          <Input
            type={showPins ? 'text' : 'password'}
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="font-mono font-bold text-center tracking-widest text-base"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPins(!showPins)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPins ? 'Sembunyikan Angka' : 'Tampilkan Angka'}</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-1.5 shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan PIN Baru'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
