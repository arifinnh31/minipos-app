'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Plus, Minus, Calculator, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';

interface PosItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onSaveItem: (updatedItem: CartItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function PosItemDetailModal({
  isOpen,
  onClose,
  item,
  onSaveItem,
  onDeleteItem,
}: PosItemDetailModalProps) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) {
      setQty(item.quantity);
    }
  }, [item]);

  if (!item) return null;

  const calculatedSubtotal = Math.round(item.unitPrice * qty);
  const totalDiscountSavings = item.discountPerItem * qty;

  const handleSave = () => {
    onSaveItem({
      ...item,
      quantity: Math.max(1, qty),
      discountTotal: totalDiscountSavings,
      subtotal: calculatedSubtotal,
    });
    onClose();
  };

  const handleDelete = () => {
    onDeleteItem(item.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Edit3 className="w-5 h-5 text-blue-600" />
          <span>Ubah Kuantitas Item Belanja</span>
        </div>
      }
      description="Sesuaikan kuantitas barang belanjaan pelanggan di keranjang."
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Product Summary Header */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <h4 className="font-extrabold text-slate-900 text-base">{item.product.name}</h4>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>SKU: {item.product.sku}</span>
            <div className="text-right">
              {item.discountPerItem > 0 ? (
                <div>
                  <span className="line-through text-slate-400 mr-1.5">{formatRupiah(item.originalPrice)}</span>
                  <span className="font-bold text-rose-600">{formatRupiah(item.unitPrice)} / {item.product.unit}</span>
                </div>
              ) : (
                <span className="font-bold text-slate-800">
                  {formatRupiah(item.unitPrice)} / {item.product.unit}
                </span>
              )}
            </div>
          </div>

          {item.discountPerItem > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
              <Tag className="w-3 h-3" />
              <span>Promo Otomatis: Hemat {formatRupiah(item.discountPerItem)} / {item.product.unit}</span>
            </div>
          )}
        </div>

        {/* Quantity Stepper */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Jumlah Kuantitas (Qty)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-95 transition-transform cursor-pointer"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </button>

            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 h-12 rounded-xl border-2 border-slate-300 font-mono font-black text-center text-xl text-slate-900 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setQty((prev) => prev + 1)}
              className="w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white flex items-center justify-center font-bold active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 5, 10, 20].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setQty(val)}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border cursor-pointer transition-colors ${
                  qty === val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Subtotal Calculation Card */}
        <div className="p-3.5 bg-blue-50/70 border-2 border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold">Subtotal Baru ({qty} Pcs):</span>
          </div>
          <span className="text-lg font-black text-blue-700 font-mono">
            {formatRupiah(calculatedSubtotal)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Item</span>
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Simpan Kuantitas
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
