'use client';

import React from 'react';
import { Barcode, AlertTriangle, Edit2, Trash2, Tag } from 'lucide-react';
import { Product } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTableRow({
  product: prod,
  onEdit,
  onDelete,
}: ProductTableRowProps) {
  const isLowStock = prod.stock <= prod.minStock;
  const hasPromo = prod.isPromo && (prod.promoPrice || prod.price) < prod.price;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 font-mono">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
          <Barcode className="w-3.5 h-3.5 text-blue-600" />
          <span>{prod.barcode}</span>
        </div>
        <span className="text-[10px] text-slate-400 block">{prod.sku}</span>
      </td>
      <td className="py-3.5 px-4 font-bold text-slate-900">
        {prod.name}
      </td>
      <td className="py-3.5 px-4">
        <Badge variant="blue" size="sm">
          {prod.category}
        </Badge>
      </td>
      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
        {formatRupiah(prod.hpp)}
      </td>
      <td className="py-3.5 px-4 text-right font-mono">
        {hasPromo ? (
          <div>
            <span className="text-xs line-through text-slate-400 block">
              {formatRupiah(prod.price)}
            </span>
            <span className="font-extrabold text-rose-600 text-sm">
              {formatRupiah(prod.promoPrice || prod.price)}
            </span>
          </div>
        ) : (
          <span className="font-extrabold text-slate-900 text-sm">
            {formatRupiah(prod.price)}
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-center">
        {hasPromo ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <Tag className="w-3 h-3" />
            {prod.discountType === 'PERCENT'
              ? `Promo -${prod.discountValue}%`
              : `Promo -${formatRupiah(prod.discountValue || 0)}`}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">Harga Normal</span>
        )}
      </td>
      <td className="py-3.5 px-4 text-center">
        {isLowStock ? (
          <Badge variant="yellow" size="sm" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{prod.stock} {prod.unit}</span>
          </Badge>
        ) : (
          <span className="font-mono font-bold text-slate-700">
            {prod.stock} {prod.unit}
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(prod)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Produk & Promo"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(prod)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus Produk"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
