'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, UserCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { CashierUser, CashierShift } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  TableCard,
  TableCardHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableEmptyState,
  TablePagination,
} from '@/components/ui/Table';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { DashboardKpiCard } from './DashboardKpiCard';
import { CashierTableRow } from './CashierTableRow';
import { CashierFormModal } from './CashierFormModal';
import { CashierShiftHistoryModal } from './CashierShiftHistoryModal';

import {
  createCashierAction,
  updateCashierAction,
} from '@/actions/cashiers';

interface CashierManagementViewProps {
  initialCashiers: CashierUser[];
  initialShiftHistory: CashierShift[];
}

export function CashierManagementView({
  initialCashiers = [],
  initialShiftHistory = [],
}: CashierManagementViewProps) {
  const [cashiers, setCashiers] = useState<CashierUser[]>(initialCashiers);
  const [shiftHistory] = useState<CashierShift[]>(initialShiftHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierUser | null>(null);
  const [viewingHistoryCashier, setViewingHistoryCashier] = useState<CashierUser | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description: string,
    variant: 'success' | 'warning' | 'danger' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (initialCashiers) setCashiers(initialCashiers);
  }, [initialCashiers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter cashiers
  const filtered = cashiers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCashiers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalActive = cashiers.filter((c) => c.isActive).length;
  const totalShiftsCount = cashiers.reduce((acc, c) => acc + c.totalShiftsCompleted, 0);
  const totalVolumeSum = cashiers.reduce((acc, c) => acc + c.totalSalesVolume, 0);

  const handleOpenAdd = () => {
    setEditingCashier(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (c: CashierUser) => {
    setEditingCashier(c);
    setIsFormModalOpen(true);
  };

  const handleSave = async (c: CashierUser): Promise<boolean> => {
    if (editingCashier) {
      const res = await updateCashierAction(c.id, c);
      if (res.success && res.data) {
        setCashiers((prev) =>
          prev.map((item) => (item.id === c.id ? res.data! : item))
        );
        addToast('Data Kasir Diperbarui', `Data kasir "${c.name}" berhasil diupdate.`, 'success');
        return true;
      } else {
        addToast('Gagal Memperbarui', res.error || 'Terjadi kesalahan.', 'danger');
        return false;
      }
    } else {
      const res = await createCashierAction(c);
      if (res.success && res.data) {
        setCashiers((prev) => [...prev, res.data!]);
        addToast('Kasir Ditambahkan', `Kasir baru "${c.name}" telah didaftarkan.`, 'success');
        return true;
      } else {
        addToast('Gagal Menambah', res.error || 'Terjadi kesalahan.', 'danger');
        return false;
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = cashiers.find((c) => c.id === id);
    if (!target) return;

    const updatedStatus = !target.isActive;
    const res = await updateCashierAction(id, { isActive: updatedStatus });
    if (res.success && res.data) {
      setCashiers((prev) =>
        prev.map((c) => (c.id === id ? res.data! : c))
      );
      addToast(
        'Status Berubah',
        `Akun kasir "${target.name}" sekarang ${updatedStatus ? 'Aktif' : 'Non-aktif'}.`,
        updatedStatus ? 'success' : 'warning'
      );
    } else {
      addToast('Gagal Mengubah Status', res.error || 'Terjadi kesalahan.', 'danger');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Manajemen Petugas Kasir & Karyawan"
        description="Kelola data staf kasir, 4-digit PIN operasional, hak akses, dan histori kinerja shift kerja toko."
        action={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shrink-0 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kasir Baru</span>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          title="Total Petugas Terdaftar"
          value={`${cashiers.length} Orang`}
          subtitle={<span className="text-xs text-slate-500 font-medium block">Staf aktif &amp; admin</span>}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />

        <DashboardKpiCard
          title="Kasir Aktif Bertugas"
          value={`${totalActive} Orang`}
          subtitle={<span className="text-xs text-emerald-600 font-medium block">Siap login di meja kasir</span>}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          valueColor="text-emerald-600"
        />

        <DashboardKpiCard
          title="Total Shift Terselesaikan"
          value={`${totalShiftsCount} Shift`}
          subtitle={<span className="text-xs text-slate-500 font-medium block">Histori rekap shift</span>}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />

        <DashboardKpiCard
          title="Total Penjualan Staf"
          value={formatRupiah(totalVolumeSum)}
          subtitle={<span className="text-xs text-slate-500 font-medium block">Akumulasi omset kasir</span>}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          valueColor="text-indigo-700"
        />
      </div>

      {/* Filter & Table Container */}
      <TableCard>
        <TableCardHeader>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Petugas Kasir &amp; Hak Akses
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filtered.length !== cashiers.length
                ? `Ditemukan ${filtered.length} kasir dari pencarian`
                : `Total ${cashiers.length} staf kasir terdaftar`}
            </span>
          </div>
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Cari nama kasir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </TableCardHeader>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>Nama Petugas</TableHead>
              <TableHead>Peran / Role</TableHead>
              <TableHead>PIN Operasional</TableHead>
              <TableHead align="center">Total Shift</TableHead>
              <TableHead align="right">Volume Omset</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                title="Tidak ada data kasir yang cocok"
                description="Coba cari dengan kata kunci nama kasir yang lain."
              />
            ) : (
              paginatedCashiers.map((c) => (
                <CashierTableRow
                  key={c.id}
                  cashier={c}
                  onEdit={handleOpenEdit}
                  onViewHistory={(target) => setViewingHistoryCashier(target)}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 25, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="kasir"
        />
      </TableCard>

      {/* Modal Form Tambah / Edit Kasir */}
      <CashierFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        cashierToEdit={editingCashier}
        onSave={handleSave}
      />

      {/* Modal Riwayat Shift Kasir Terperinci */}
      <CashierShiftHistoryModal
        isOpen={!!viewingHistoryCashier}
        onClose={() => setViewingHistoryCashier(null)}
        cashier={viewingHistoryCashier}
        shiftHistory={shiftHistory}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
