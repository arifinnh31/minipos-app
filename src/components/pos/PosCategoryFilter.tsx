'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Coffee, Cookie, Utensils, Home, HeartPulse, Smile, LayoutGrid } from 'lucide-react';

interface PosCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function PosCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: PosCategoryFilterProps) {
  const getIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'semua':
        return <LayoutGrid className="w-4 h-4" />;
      case 'minuman':
        return <Coffee className="w-4 h-4" />;
      case 'makanan':
        return <Utensils className="w-4 h-4" />;
      case 'snack':
        return <Cookie className="w-4 h-4" />;
      case 'kebutuhan rumah':
        return <Home className="w-4 h-4" />;
      case 'perawatan diri':
        return <Smile className="w-4 h-4" />;
      case 'obat & vitamin':
        return <HeartPulse className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full overflow-x-auto no-scrollbar py-1"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory(cat);
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none border',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
              )}
            >
              <span className={isSelected ? 'text-white' : 'text-slate-500'}>
                {getIcon(cat)}
              </span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
