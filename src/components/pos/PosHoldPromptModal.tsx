'use client';

import React, { useState, useEffect } from 'react';
import { PauseCircle, User, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PosHoldPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string, note: string) => void;
  defaultCustomerName?: string;
}

export function PosHoldPromptModal({
  isOpen,
  onClose,
  onConfirm,
  defaultCustomerName = '',
}: PosHoldPromptModalProps) {
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName(defaultCustomerName || `Pelanggan #${Math.floor(1 + Math.random() * 9)}`);
      setNote('');
    }
  }, [isOpen, defaultCustomerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customerName.trim() || 'Pelanggan';
    onConfirm(finalName, note.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <PauseCircle className="w-5 h-5 text-amber-600" />
          <span>Tahan Keranjang (Hold Cart)</span>
        </div>
      }
      description="Simpan keranjang belanja saat ini ke dalam antrean tertahan untuk melayani pelanggan berikutnya."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Nama / Ciri Pelanggan:
          </label>
          <Input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Contoh: Ibu Baju Biru / Meja 3..."
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Catatan Tambahan (Opsional):
          </label>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Ambil dompet di motor / titip belanjaan..."
            leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 font-bold"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Simpan ke Antrean</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
