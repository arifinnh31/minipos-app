'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getStoreSettingsAction } from '@/actions/settings';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [storeName, setStoreName] = useState('TOKOKU');
  const [adminName, setAdminName] = useState<string>('Administrator');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('minipos_admin_user') || sessionStorage.getItem('minipos_active_cashier');
    let isValidAdmin = false;
    let currentAdminName = 'Administrator';

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'ADMIN') {
          isValidAdmin = true;
          currentAdminName = parsed.name || 'Administrator';
        }
      } catch {}
    }

    if (!isValidAdmin) {
      sessionStorage.removeItem('minipos_admin_authenticated');
      sessionStorage.removeItem('minipos_admin_user');
      setIsAuthenticated(false);
      router.replace('/');
      return;
    }

    setIsAuthenticated(true);
    setAdminName(currentAdminName);

    // Ambil Nama Toko Dinamis dari database
    getStoreSettingsAction().then((res) => {
      if (res.success && res.data?.storeName) {
        setStoreName(res.data.storeName);
      }
    });
  }, [pathname, router]);

  const handleLogout = async () => {
    sessionStorage.removeItem('minipos_admin_authenticated');
    sessionStorage.removeItem('minipos_admin_user');
    sessionStorage.removeItem('minipos_active_cashier');
    setIsAuthenticated(false);
    router.replace('/');
  };

  // Loading state during auth check
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Memeriksa otentikasi admin...</span>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex">
      {/* 1. Full-Height Sidebar (Logo Toko & Navigasi Terpadu di Kiri) */}
      <AdminSidebar
        storeName={storeName}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* 2. Right Content Column (Topbar di atas + Area Konten Scrollable di bawah) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader
          storeName={storeName}
          adminName={adminName}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
        />
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
