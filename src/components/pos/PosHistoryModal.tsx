'use client';

import React, { useState } from 'react';
import { History, Search, Receipt } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Transaction } from '@/types/pos';
import { PosHistoryRow } from './PosHistoryRow';

interface PosHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectTransactionToReprint: (tx: Transaction) => void;
}

export function PosHistoryModal({
  isOpen,
  onClose,
  transactions,
  onSelectTransactionToReprint,
}: PosHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(
    (tx) =>
      tx.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.cashierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <History className="w-5 h-5 text-blue-600" />
          <span>Riwayat Transaksi Hari Ini</span>
        </div>
      }
      description="Cari transaksi sebelumnya untuk cetak ulang struk atau cek detail belanja pelanggan."
      size="2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Cari berdasarkan nomor struk (TR-...) atau nama kasir..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          autoFocus
        />

        {/* Transactions Table / List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50 stroke-[1.5]" />
              <p className="text-sm font-semibold">Tidak ada transaksi yang cocok</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <PosHistoryRow
                key={tx.id}
                tx={tx}
                onReprint={(selectedTx) => {
                  onSelectTransactionToReprint(selectedTx);
                  onClose();
                }}
              />
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} size="sm">
            <span>Tutup <span className="hidden sm:inline">(Esc)</span></span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
