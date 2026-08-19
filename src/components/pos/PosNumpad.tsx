'use client';

import React, { useState, useEffect } from 'react';
import { Delete, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '@/types/pos';

interface PosNumpadProps {
  selectedItem: CartItem | null;
  onSetQuantity: (qty: number) => void;
  onQuickAdd: (amount: number) => void;
  onVoidSelectedItem: () => void;
}

export function PosNumpad({
  selectedItem,
  onSetQuantity,
  onQuickAdd,
  onVoidSelectedItem,
}: PosNumpadProps) {
  const [qtyBuffer, setQtyBuffer] = useState<string>('');

  // Reset Qty buffer when active selected item changes or is cleared
  useEffect(() => {
    setQtyBuffer('');
  }, [selectedItem?.id]);

  const handleDigit = (digit: string) => {
    if (!selectedItem) return;
    const nextVal = qtyBuffer === '' ? digit : qtyBuffer + digit;
    const parsed = parseInt(nextVal) || 1;
    setQtyBuffer(nextVal);
    onSetQuantity(Math.max(1, parsed));
  };

  const handleBackspace = () => {
    if (!selectedItem) return;
    if (qtyBuffer.length > 1) {
      const nextVal = qtyBuffer.slice(0, -1);
      setQtyBuffer(nextVal);
      onSetQuantity(parseInt(nextVal) || 1);
    } else {
      setQtyBuffer('');
      onSetQuantity(1);
    }
  };

  const handleClear = () => {
    setQtyBuffer('');
    if (selectedItem) {
      onSetQuantity(1);
    }
  };

  const handleMultiplier = (amount: number) => {
    setQtyBuffer(''); // Reset buffer so subsequent digit typing starts fresh
    onQuickAdd(amount);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="numpad-container bg-slate-50 p-2.5 rounded-2xl border border-slate-200/90 flex flex-col gap-2 shadow-2xs select-none"
    >
      {/* Restored Clean Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
          Touch Numpad
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {selectedItem ? 'Atur kuantitas barang terpilih' : 'Pilih barang di keranjang'}
        </span>
      </div>

      {/* Main Numpad & Side Action Grid */}
      <div className="grid grid-cols-12 gap-1.5">
        {/* Digits 7,8,9, 4,5,6, 1,2,3, C,0,⌫ (8 Cols) */}
        <div className="col-span-8 grid grid-cols-3 gap-1.5">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDigit(num);
              }}
              disabled={!selectedItem}
              className="h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-mono font-bold text-base text-slate-800 shadow-2xs active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            disabled={!selectedItem}
            className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-mono font-bold text-xs shadow-2xs active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            title="Reset Kuantitas ke 1 (Clear)"
          >
            C
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDigit('0');
            }}
            disabled={!selectedItem}
            className="h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-mono font-bold text-base text-slate-800 shadow-2xs active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            0
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBackspace();
            }}
            disabled={!selectedItem}
            className="h-10 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold shadow-2xs active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            title="Hapus Satu Karakter"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Dedicated Retail Multipliers (4 Cols) */}
        <div className="col-span-4 flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMultiplier(1);
              }}
              disabled={!selectedItem}
              className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold text-xs flex items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              title="Tambah 1 Qty"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>1</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMultiplier(-1);
              }}
              disabled={!selectedItem}
              className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              title="Kurangi 1 Qty"
            >
              <Minus className="w-3 h-3 stroke-[2.5]" />
              <span>1</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMultiplier(5);
              }}
              disabled={!selectedItem}
              className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold text-xs flex items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              title="Tambah 5 Qty"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>5</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMultiplier(10);
              }}
              disabled={!selectedItem}
              className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold text-xs flex items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              title="Tambah 10 Qty"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>10</span>
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMultiplier(20);
            }}
            disabled={!selectedItem}
            className="h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            title="Tambah 20 Qty (1 Dus / Karton)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>20 (Karton)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVoidSelectedItem();
            }}
            disabled={!selectedItem}
            className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            title="Hapus Item Terpilih dari Keranjang"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Void Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
