'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Store, LayoutDashboard, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-[480px] w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4 shadow-xs">
          <Store className="w-8 h-8" />
        </div>

        {/* 404 Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <SearchX className="w-4 h-4" />
          <span>Error 404: Not Found</span>
        </div>

        {/* Professional Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-sm">
          Maaf, tautan atau alamat URL yang Anda tuju tidak tersedia atau tidak terdaftar di sistem aplikasi ini.
        </p>

        {/* Quick Action Navigation Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
          <Link href="/" className="w-full">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="h-12 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm px-4"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Buka POS Kasir</span>
            </Button>
          </Link>

          <Link href="/admin" className="w-full">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              className="h-12 border-slate-300 hover:bg-slate-50 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-700 px-4"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="whitespace-nowrap">Dashboard Admin</span>
            </Button>
          </Link>
        </div>

        {/* Footnote */}
        <span className="text-[11px] text-slate-400 font-mono mt-6 block">
          Sistem POS &amp; Inventory Management
        </span>
      </div>
    </div>
  );
}
