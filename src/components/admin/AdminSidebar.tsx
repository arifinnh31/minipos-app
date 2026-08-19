'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Users,
  Settings,
  ShoppingCart,
  LogOut,
  X,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  storeName?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export function AdminSidebar({
  storeName = 'TOKOKU',
  isMobileOpen = false,
  onCloseMobile,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: 'Master Produk',
      href: '/admin/products',
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: 'Stok Opname',
      href: '/admin/inventory',
      icon: <Boxes className="w-4 h-4" />,
    },
    {
      label: 'Laporan Penjualan',
      href: '/admin/reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Manajemen Kasir',
      href: '/admin/cashiers',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Pengaturan Toko',
      href: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-5">
        {/* Brand / Store Identity Header at Top of Sidebar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-white text-sm leading-tight truncate">
                  {storeName}
                </h2>
                <span className="text-[9px] font-extrabold bg-blue-900/60 text-blue-300 border border-blue-700/60 px-1.5 py-0.2 rounded shrink-0">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                Panel Admin & Manajemen Toko
              </span>
            </div>
          </div>

          {/* Mobile close button if inside drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Menu Utama
          </span>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Area: Switch to POS & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Kembali ke POS Kasir</span>
        </Link>

        {onLogout && (
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onLogout();
            }}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 font-bold text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 shrink-0 h-full overflow-y-auto border-r border-slate-800 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-300 h-full shadow-2xl z-10 transition-transform duration-300 ease-out animate-in slide-in-from-left fade-in flex flex-col overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
