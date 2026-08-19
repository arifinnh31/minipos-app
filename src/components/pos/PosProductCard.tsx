'use client';

import React from 'react';
import { Plus, AlertTriangle, Tag } from 'lucide-react';
import { Product } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface PosProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function PosProductCard({ product, onAddToCart }: PosProductCardProps) {
  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const isOutOfStock = product.stock <= 0;
  const hasPromo = product.isPromo && (product.promoPrice || product.price) < product.price;
  const effectivePrice = hasPromo ? (product.promoPrice || product.price) : product.price;

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={(e) => {
        e.stopPropagation();
        onAddToCart(product);
      }}
      className="product-grid-card group relative flex flex-col justify-between p-3.5 bg-white hover:bg-blue-50/40 rounded-2xl border-2 border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-md transition-all text-left cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none min-h-[135px]"
    >
      {/* Top Info: SKU + Promo Badge (Left) & Stock Status (Right) */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0">
              {product.sku}
            </span>
            {hasPromo && !isOutOfStock && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <Tag className="w-2.5 h-2.5" /> Promo
              </span>
            )}
          </div>

          {/* Stock Status is ALWAYS VISIBLE */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <Badge variant="red" size="sm">Habis</Badge>
            ) : isLowStock ? (
              <Badge variant="yellow" size="sm" className="flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Sisa {product.stock}</span>
              </Badge>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">
                Stok {product.stock}
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
          {product.name}
        </h3>
      </div>

      {/* Bottom Price & Action */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-end justify-between">
        <div>
          {hasPromo ? (
            <div>
              <span className="text-[10px] line-through text-slate-400 block -mb-0.5 font-mono">
                {formatRupiah(product.price)}
              </span>
              <span className="text-sm sm:text-base font-black text-rose-600 font-mono tracking-tight">
                {formatRupiah(effectivePrice)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono tracking-tight group-hover:text-blue-700">
                {formatRupiah(product.price)}
              </span>
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </button>
  );
}
