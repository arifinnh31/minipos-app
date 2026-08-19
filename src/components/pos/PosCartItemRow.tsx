'use client';

import React from 'react';
import { Trash2, Plus, Minus, Tag, Edit3 } from 'lucide-react';
import { CartItem } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';

interface PosCartItemRowProps {
  item: CartItem;
  index: number;
  isSelected: boolean;
  onSelectItem?: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenItemDetail: (item: CartItem) => void;
}

export function PosCartItemRow({
  item,
  index,
  isSelected,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
  onOpenItemDetail,
}: PosCartItemRowProps) {
  const hasPromo = item.discountPerItem > 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectItem) onSelectItem(item.id);
      }}
      className={`cart-item-row p-3 rounded-xl transition-all border cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-mono font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
              {index + 1}.
            </span>
            <h4 className={`font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
              {item.product.name}
            </h4>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
            {hasPromo ? (
              <div className="flex items-center gap-1.5">
                <span className="line-through text-slate-400">{formatRupiah(item.originalPrice)}</span>
                <span className="font-bold text-rose-600">{formatRupiah(item.unitPrice)} / {item.product.unit}</span>
                <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-sans font-extrabold text-[10px]">
                  <Tag className="w-2.5 h-2.5" /> Hemat {formatRupiah(item.discountPerItem)}
                </span>
              </div>
            ) : (
              <span>{formatRupiah(item.unitPrice)} / {item.product.unit}</span>
            )}
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono">
            {formatRupiah(item.subtotal)}
          </span>
        </div>
      </div>

      {/* Stepper & Actions */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(item.id, item.quantity - 1);
            }}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            title="Kurangi Qty"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenItemDetail(item);
            }}
            className="min-w-[40px] h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 text-sm flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
            title="Ketik angka kuantitas"
          >
            {item.quantity}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(item.id, item.quantity + 1);
            }}
            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            title="Tambah Qty"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenItemDetail(item);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Ubah Kuantitas"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveItem(item.id);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus barang ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
