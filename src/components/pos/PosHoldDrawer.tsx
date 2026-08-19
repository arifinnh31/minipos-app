'use client';

import React from 'react';
import { PauseCircle, Clock, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { HeldCart, CartItem } from '@/types/pos';
import { PosHeldCartCard } from './PosHeldCartCard';

interface PosHoldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  heldCarts: HeldCart[];
  activeCartItems: CartItem[];
  onResumeCart: (heldCart: HeldCart) => void;
  onDeleteHeldCart: (id: string) => void;
  onOpenHoldModal: () => void;
}

export function PosHoldDrawer({
  isOpen,
  onClose,
  heldCarts,
  activeCartItems,
  onResumeCart,
  onDeleteHeldCart,
  onOpenHoldModal,
}: PosHoldDrawerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <PauseCircle className="w-5 h-5 text-amber-500" />
          <span>Antrean Transaksi Tertahan (Hold Carts)</span>
        </div>
      }
      description="Simpan sementara belanjaan pelanggan dan layani pelanggan lain terlebih dahulu."
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Hold Current Cart Action Box */}
        {activeCartItems.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Tahan Keranjang Aktif ({activeCartItems.reduce((a, b) => a + b.quantity, 0)} Items)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Simpan transaksi yang sedang berjalan agar layar kasir bersih untuk pembeli berikutnya.
              </p>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={onOpenHoldModal}
              className="shrink-0 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>
                Tahan Sekarang <span className="hidden sm:inline">(F4)</span>
              </span>
            </Button>
          </div>
        )}

        {/* Held Carts List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {heldCarts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 flex flex-col items-center justify-center">
              <Clock className="w-10 h-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada antrean tertahan</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua transaksi berjalan lancar.</p>
            </div>
          ) : (
            heldCarts.map((held) => (
              <PosHeldCartCard
                key={held.id}
                held={held}
                onResume={onResumeCart}
                onDelete={onDeleteHeldCart}
              />
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} size="sm">
            <span>
              Tutup <span className="hidden sm:inline">(Esc)</span>
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
