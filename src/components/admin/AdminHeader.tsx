'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShoppingCart, UserCheck, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminHeaderProps {
  storeName: string;
  adminName?: string;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
  onLogout?: () => void;
}

export function AdminHeader({
  storeName,
  adminName,
  isMobileSidebarOpen = false,
  onToggleMobileSidebar,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Buka Menu Navigasi"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Only Store Brand (When Sidebar is closed) */}
        <div className="flex md:hidden items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-black text-slate-900 text-xs sm:text-sm leading-tight truncate">
                {storeName}
              </h2>
              <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded shrink-0">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              Panel Admin &amp; Manajemen Toko
            </span>
          </div>
        </div>

      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Primary Action: POS Kasir Navigation */}
        <Link href="/">
          <Button
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-sm text-xs sm:text-sm px-2.5 sm:px-4 h-9 sm:h-10"
            title="Buka Terminal POS Kasir"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">POS Kasir</span>
          </Button>
        </Link>

        {/* 2. User Identity */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>{adminName ? `${adminName} (Admin)` : 'Administrator'}</span>
        </div>

        {/* 3. Session Termination: Logout */}
        {onLogout && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold gap-1.5 px-2.5"
            title="Keluar / Logout dari Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        )}
      </div>
    </header>
  );
}
