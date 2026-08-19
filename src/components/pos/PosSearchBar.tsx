'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Search, Barcode, X, Plus, CornerDownLeft } from 'lucide-react';
import { Product } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';

interface PosSearchBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function PosSearchBar({
  products,
  onSelectProduct,
  inputRef,
}: PosSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const internalRef = useRef<HTMLInputElement>(null);
  const searchInput = inputRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode.includes(query.trim()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Reset selected index when query results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view when navigating with arrows
  useEffect(() => {
    if (listRef.current && isOpen) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const targetProduct = filtered[selectedIndex] || filtered[0];
      if (targetProduct) {
        handleSelect(targetProduct, e);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (p: Product, e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onSelectProduct(p);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
    searchInput.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full"
    >
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-blue-600">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={searchInput}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Scan Barcode atau Ketik Nama Produk / SKU..."
          className="w-full h-12 pl-11 pr-24 rounded-xl border-2 border-slate-300 bg-white text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                setIsOpen(false);
                searchInput.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-mono font-bold text-slate-500">
            <Barcode className="w-3.5 h-3.5 text-slate-600" /> F1
          </span>
        </div>
      </div>

      {/* Auto-complete Dropdown with Arrow Up/Down Navigation */}
      {isOpen && query.trim().length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
        >
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              Tidak ada produk yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const effectivePrice =
                item.isPromo && (item.promoPrice || item.price) < item.price
                  ? item.promoPrice || item.price
                  : item.price;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={(e) => handleSelect(item, e)}
                  className={`search-dropdown-item w-full p-3 flex items-center justify-between text-left transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-50/90 text-blue-950 ring-inset ring-2 ring-blue-500'
                      : 'hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span className={isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-900'}>
                        {item.name}
                      </span>
                      {isSelected && (
                        <span className="hidden sm:inline-flex text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold items-center gap-1 shadow-2xs">
                          <CornerDownLeft className="w-3 h-3 stroke-[2.5]" /> ENTER
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-mono">
                      <span>SKU: {item.sku}</span>
                      <span>•</span>
                      <span>Barcode: {item.barcode}</span>
                      <span>•</span>
                      <span className={item.stock <= item.minStock ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                        Stok: {item.stock} {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-700 text-base font-mono">
                      {formatRupiah(effectivePrice)}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
