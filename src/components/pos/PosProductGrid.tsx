'use client';

import React from 'react';
import { PackageCheck } from 'lucide-react';
import { Product } from '@/types/pos';
import { PosProductCard } from './PosProductCard';

interface PosProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function PosProductGrid({ products, onAddToCart }: PosProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
        <PackageCheck className="w-10 h-10 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">Tidak ada produk dalam kategori ini</p>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-full overflow-y-auto pr-1 pb-2"
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {products.map((product) => (
          <PosProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
