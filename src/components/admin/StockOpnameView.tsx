'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Loader2,
  Search,
  Layers,
  Filter,
} from 'lucide-react';
import { Product, StockOpnameItem, StockOpnameReason } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import { StockOpnameRow } from './StockOpnameRow';
import { DashboardKpiCard } from './DashboardKpiCard';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { saveStockOpnameAdjustmentAction } from '@/actions/stockOpname';

interface StockOpnameViewProps {
  initialProducts: Product[];
}

export function StockOpnameView({ initialProducts = [] }: StockOpnameViewProps) {
  // Initialize opname list with current system stock
  const [opnameItems, setOpnameItems] = useState<StockOpnameItem[]>(() =>
    initialProducts.map((p) => ({
      productId: p.id,
      sku: p.sku,
      barcode: p.barcode,
      productName: p.name,
      category: p.category,
      systemStock: p.stock,
      physicalStock: p.stock,
      difference: 0,
      hpp: p.hpp,
      lossValue: 0,
      reason: 'SESUAI',
      notes: '',
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [filterDiff, setFilterDiff] = useState<'ALL' | 'DIFF_ONLY' | 'NO_DIFF'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const categories = [
    'Semua',
    ...Array.from(new Set(initialProducts.map((p) => p.category).filter(Boolean))),
  ];

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
    if (initialProducts.length > 0) {
      setOpnameItems(
        initialProducts.map((p) => ({
          productId: p.id,
          sku: p.sku,
          barcode: p.barcode,
          productName: p.name,
          category: p.category,
          systemStock: p.stock,
          physicalStock: p.stock,
          difference: 0,
          hpp: p.hpp,
          lossValue: 0,
          reason: 'SESUAI',
          notes: '',
        }))
      );
    }
  }, [initialProducts]);

  const handlePhysicalCountChange = (productId: string, count: number) => {
    setOpnameItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const validCount = Math.max(0, count);
        const diff = validCount - item.systemStock;
        const loss = diff < 0 ? Math.abs(diff) * item.hpp : 0;
        return {
          ...item,
          physicalStock: validCount,
          difference: diff,
          lossValue: loss,
          reason:
            diff === 0
              ? 'SESUAI'
              : item.reason === 'SESUAI'
              ? 'SELISIH_HITUNG'
              : item.reason,
        };
      })
    );
    setSavedSuccess(false);
  };

  const handleReasonChange = (productId: string, reason: StockOpnameReason) => {
    setOpnameItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, reason } : item))
    );
    setSavedSuccess(false);
  };

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterDiff]);

  const totalDiscrepantItems = opnameItems.filter((i) => i.difference !== 0).length;
  const totalFinancialLoss = opnameItems.reduce((acc, i) => acc + (i.lossValue || 0), 0);

  // Filtered view items based on search and dropdown filters
  const filteredOpnameItems = opnameItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.productName.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q);

    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;

    const matchDiff =
      filterDiff === 'ALL'
        ? true
        : filterDiff === 'DIFF_ONLY'
        ? item.difference !== 0
        : item.difference === 0;

    return matchQuery && matchCategory && matchDiff;
  });

  const totalPages = Math.ceil(filteredOpnameItems.length / pageSize) || 1;
  const paginatedOpnameItems = filteredOpnameItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApplyAdjustment = async () => {
    setIsSaving(true);
    const res = await saveStockOpnameAdjustmentAction({
      auditorName: 'Admin Toko',
      items: opnameItems,
      notes: 'Penyesuaian stok opname fisik toko berkala.',
    });
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      // Update system stock in local UI
      setOpnameItems((prev) =>
        prev.map((it) => ({
          ...it,
          systemStock: it.physicalStock,
          difference: 0,
          lossValue: 0,
          reason: 'SESUAI',
        }))
      );
      addToast('Stok Opname Berhasil', 'Hasil hitung fisik telah disinkronkan ke database.', 'success');
    } else {
      addToast('Gagal Menerapkan', res.error || 'Terjadi kesalahan.', 'danger');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Audit Stok Opname Fisik (Stock Opname)"
        description="Rekonsiliasi pencatatan stok sistem dengan hitungan fisik riil di rak pajang & gudang toko."
        action={
          <Button
            variant="primary"
            onClick={handleApplyAdjustment}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shrink-0 shadow-md shadow-blue-500/20"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Menyimpan ke DB...' : 'Terapkan Penyesuaian Stok'}</span>
          </Button>
        }
      />

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in duration-150">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Penyesuaian Stok Berhasil Diterapkan ke Database!</h4>
            <p className="text-xs text-emerald-700">
              Data stok pada layar kasir telah disinkronkan dengan hasil hitung fisik terbaru.
            </p>
          </div>
        </div>
      )}

      {/* Summary Discrepancy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardKpiCard
          title="Produk dengan Selisih"
          value={`${totalDiscrepantItems} Barang`}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              {totalDiscrepantItems > 0 ? 'Perlu rekonsiliasi alasan' : 'Semua stok fisik sesuai'}
            </span>
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          valueColor={totalDiscrepantItems > 0 ? 'text-amber-600' : 'text-slate-900'}
        />

        <DashboardKpiCard
          title="Estimasi Nilai Selisih / Kerugian"
          value={formatRupiah(totalFinancialLoss)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Akumulasi nilai HPP selisih
            </span>
          }
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          valueColor={totalFinancialLoss > 0 ? 'text-rose-600' : 'text-slate-900'}
        />
      </div>

      {/* Stock Opname Table */}
      <TableCard>
        <TableCardHeader className="flex-col lg:flex-row">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Hitung Fisik Rak &amp; Gudang
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredOpnameItems.length !== opnameItems.length
                ? `Ditemukan ${filteredOpnameItems.length} produk dari filter audit`
                : `Total ${opnameItems.length} produk siap dihitung fisiknya`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input Box */}
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Cari nama, barcode, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                labelPrefix="Kategori:"
                icon={<Layers className="w-4 h-4 text-blue-600" />}
                variant="filter"
                menuClassName="w-56"
              />
            </div>

            {/* Discrepancy Status Filter */}
            <div className="w-full sm:w-auto">
              <Select
                value={filterDiff}
                onChange={(val) => setFilterDiff(val as 'ALL' | 'DIFF_ONLY' | 'NO_DIFF')}
                options={[
                  { value: 'ALL', label: 'Semua Status' },
                  { value: 'DIFF_ONLY', label: '⚠️ Ada Selisih' },
                  { value: 'NO_DIFF', label: '✅ Stok Sesuai' },
                ]}
                labelPrefix="Status:"
                icon={<Filter className="w-4 h-4 text-blue-600" />}
                variant="filter"
                align="right"
                menuClassName="w-56"
              />
            </div>
          </div>
        </TableCardHeader>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>Nama Produk / SKU</TableHead>
              <TableHead align="center">Stok Sistem</TableHead>
              <TableHead align="center">Hitung Fisik di Rak</TableHead>
              <TableHead align="center">Selisih</TableHead>
              <TableHead>Alasan Penyesuaian</TableHead>
              <TableHead align="right">Potensi Kerugian</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredOpnameItems.length > 0 ? (
              paginatedOpnameItems.map((item) => (
                <StockOpnameRow
                  key={item.productId}
                  item={item}
                  onPhysicalCountChange={handlePhysicalCountChange}
                  onReasonChange={handleReasonChange}
                />
              ))
            ) : (
              <TableEmptyState
                colSpan={6}
                title="Tidak ada produk yang cocok"
                description="Coba ganti kata kunci pencarian atau reset filter kategori/status."
              />
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOpnameItems.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="produk audit"
        />
      </TableCard>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
