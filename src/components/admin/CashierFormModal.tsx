'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Save, Lock } from 'lucide-react';
import { CashierUser } from '@/types/pos';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CashierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashierToEdit?: CashierUser | null;
  onSave: (cashier: CashierUser) => Promise<boolean> | void;
}

export function CashierFormModal({
  isOpen,
  onClose,
  cashierToEdit,
  onSave,
}: CashierFormModalProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditingAdmin = cashierToEdit?.role === 'ADMIN';

  useEffect(() => {
    setError('');
    setIsSubmitting(false);
    if (cashierToEdit) {
      setName(cashierToEdit.name);
      setPin(''); // Never reveal existing PIN in plaintext for security
      setPhone(cashierToEdit.phone || '');
      setIsActive(cashierToEdit.isActive);
    } else {
      setName('');
      setPin('');
      setPhone('');
      setIsActive(true);
    }
  }, [cashierToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama petugas kasir tidak boleh kosong');
      return;
    }

    // If adding a new cashier, PIN is mandatory (4 digits)
    if (!cashierToEdit && (pin.length !== 4 || !/^\d+$/.test(pin))) {
      setError('PIN operasional wajib 4 digit angka');
      return;
    }

    // If editing and PIN is filled, must be 4 digits
    if (cashierToEdit && pin && (pin.length !== 4 || !/^\d+$/.test(pin))) {
      setError('PIN baru harus berupa 4 digit angka');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: CashierUser = {
        id: cashierToEdit ? cashierToEdit.id : `c-${Date.now()}`,
        name: name.trim(),
        role: isEditingAdmin ? 'ADMIN' : 'CASHIER',
        pin: pin ? pin.trim() : (cashierToEdit ? cashierToEdit.pin : '1234'),
        phone: phone.trim(),
        isActive,
        totalShiftsCompleted: cashierToEdit ? cashierToEdit.totalShiftsCompleted : 0,
        totalSalesVolume: cashierToEdit ? cashierToEdit.totalSalesVolume : 0,
        createdAt: cashierToEdit ? cashierToEdit.createdAt : new Date().toISOString(),
      };

      const res = await onSave(payload);
      if (res !== false) {
        onClose();
      }
    } catch {
      setError('Terjadi kendala saat menyimpan data kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <span>{cashierToEdit ? 'Edit Profil Petugas' : 'Tambah Petugas Kasir Baru'}</span>
        </div>
      }
      description="Atur nama petugas, nomor telepon, status kerja, dan PIN operasional kasir."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 animate-in fade-in duration-150">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Nama Lengkap Petugas <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Peran / Hak Akses
            </label>
            {isEditingAdmin ? (
              <div className="w-full h-11 px-3.5 rounded-xl border border-purple-200 bg-purple-50 flex items-center gap-2 text-xs font-bold text-purple-800">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Administrator Toko (Role Permanen)</span>
              </div>
            ) : (
              <div className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Petugas Kasir (Operasional POS)</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              PIN Operasional (4 Digit) {!cashierToEdit && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder={cashierToEdit ? 'Kosongkan jika tidak diubah' : '4 Digit Angka'}
                className="font-mono font-bold text-center tracking-widest"
                required={!cashierToEdit}
                autoComplete="new-password"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {cashierToEdit
                ? 'PIN tersimpan aman & disembunyikan. Isi hanya jika ingin mereset PIN.'
                : 'PIN bersifat rahasia untuk autentikasi meja kasir.'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              No. Telepon / WhatsApp
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-xxxx-xxxx"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Status Akun
            </label>
            <Select
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(val) => setIsActive(val === 'ACTIVE')}
              options={[
                { value: 'ACTIVE', label: 'Aktif (Bisa Login Kasir)' },
                { value: 'INACTIVE', label: 'Nonaktif (Dibekukan)' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Kasir</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
