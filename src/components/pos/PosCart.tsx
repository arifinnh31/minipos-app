'use client';

import React from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/types/pos';
import { Button } from '@/components/ui/Button';
import { PosCartItemRow } from './PosCartItemRow';

interface PosCartProps {
  items: CartItem[];
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenItemDetail: (item: CartItem) => void;
}

export function PosCart({
  items,
  selectedItemId,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenItemDetail,
}: PosCartProps) {
  if (items.length === 0) {
    return (
      <div className="h-full min-h-[160px] flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
          <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Keranjang Masih Kosong</h3>
        <p className="text-[11px] text-slate-500 max-w-[220px] mt-0.5">
          Pilih produk dari katalog atau scan barcode untuk menambah belanjaan.
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
    >
      {/* Cart Header */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-slate-800 text-sm">
            Daftar Belanjaan ({items.reduce((acc, curr) => acc + curr.quantity, 0)} Pcs)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClearCart();
          }}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 h-7 gap-1 font-semibold"
          title="Void / Bersihkan Semua Keranjang (F9)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Void Semua <span className="hidden sm:inline text-[10px] font-mono opacity-80">(F9)</span></span>
        </Button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5 min-h-0">
        {items.map((item, index) => (
          <PosCartItemRow
            key={item.id}
            item={item}
            index={index}
            isSelected={selectedItemId === item.id}
            onSelectItem={onSelectItem}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onOpenItemDetail={onOpenItemDetail}
          />
        ))}
      </div>
    </div>
  );
}
