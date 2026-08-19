'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
} from 'lucide-react';
import { Transaction, StoreSettings } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
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
import { PosReceiptModal } from '@/components/pos/PosReceiptModal';
import { SalesReportRow } from './SalesReportRow';
import { DateRangeFilter, DateRangeValue, computePresetRange } from './DateRangeFilter';
import { DashboardKpiCard } from './DashboardKpiCard';

interface SalesReportViewProps {
  transactions: Transaction[];
  storeSettings: StoreSettings;
}

export function SalesReportView({
  transactions,
  storeSettings,
}: SalesReportViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxToView, setSelectedTxToView] = useState<Transaction | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    const range = computePresetRange('today');
    return {
      preset: 'today',
      startDate: range.startDate,
      endDate: range.endDate,
      label: range.label,
    };
  });

  // Reset to page 1 on filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange]);

  // 1. Filter transactions by Date Range
  const dateFilteredTransactions = transactions.filter((tx) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    const txDate = new Date(tx.createdAt);
    if (dateRange.startDate && txDate < dateRange.startDate) return false;
    if (dateRange.endDate && txDate > dateRange.endDate) return false;
    return true;
  });

  // 2. Financial aggregates based on date-filtered transactions
  const totalSales = dateFilteredTransactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalCash = dateFilteredTransactions
    .filter((tx) => tx.paymentMethod === 'CASH')
    .reduce((acc, tx) => acc + tx.total, 0);
  const totalQris = dateFilteredTransactions
    .filter((tx) => tx.paymentMethod === 'QRIS')
    .reduce((acc, tx) => acc + tx.total, 0);
  const totalDiscounts = dateFilteredTransactions.reduce((acc, tx) => acc + tx.discountTotal, 0);

  // 3. Search query filter
  const displayedTransactions = dateFilteredTransactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    return (
      tx.receiptNumber.toLowerCase().includes(q) ||
      tx.cashierName.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(displayedTransactions.length / pageSize) || 1;
  const paginatedTransactions = displayedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Laporan Ringkasan Penjualan"
        description="Statistik transaksi, omzet kasir, dan rekonsiliasi penerimaan kas & QRIS."
        action={
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
          />
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <DashboardKpiCard
          title="Total Omzet Penjualan"
          value={formatRupiah(totalSales)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              {dateFilteredTransactions.length} transaksi ({dateRange.label})
            </span>
          }
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          valueColor="text-blue-700"
        />

        {/* Tunai */}
        <DashboardKpiCard
          title="Penerimaan Kas (Tunai)"
          value={formatRupiah(totalCash)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Uang masuk laci kasir
            </span>
          }
          icon={<Banknote className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          valueColor="text-emerald-600"
        />

        {/* QRIS */}
        <DashboardKpiCard
          title="Penerimaan QRIS / E-Wallet"
          value={formatRupiah(totalQris)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Settle langsung ke rekening
            </span>
          }
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          valueColor="text-indigo-600"
        />

        {/* Promo Diskon Toko */}
        <DashboardKpiCard
          title="Total Hemat Promo Toko"
          value={formatRupiah(totalDiscounts)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Potongan harga promo aktif
            </span>
          }
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          valueColor="text-rose-600"
        />
      </div>

      {/* Transactions Log Section */}
      <TableCard>
        <TableCardHeader>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Lengkap Transaksi Kasir
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {displayedTransactions.length !== dateFilteredTransactions.length
                ? `Ditemukan ${displayedTransactions.length} transaksi dari pencarian`
                : `Total ${dateFilteredTransactions.length} transaksi pada periode ${dateRange.label}`}
            </span>
          </div>
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Cari no. struk atau kasir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </TableCardHeader>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>No. Struk</TableHead>
              <TableHead>Waktu Transaksi</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead>Metode Bayar</TableHead>
              <TableHead align="right">Total Belanja</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                title="Tidak ada riwayat transaksi yang cocok"
                description={`Tidak ada transaksi yang sesuai pada periode ${dateRange.label}.`}
              />
            ) : (
              paginatedTransactions.map((tx) => (
                <SalesReportRow
                  key={tx.id}
                  transaction={tx}
                  onViewReceipt={(target) => setSelectedTxToView(target)}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={displayedTransactions.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="transaksi"
        />
      </TableCard>

      {/* Modal View Receipt (Reprint Mode) */}
      <PosReceiptModal
        isOpen={!!selectedTxToView}
        onClose={() => setSelectedTxToView(null)}
        transaction={selectedTxToView}
        storeSettings={storeSettings}
        isReprint={true}
        onNewTransaction={() => setSelectedTxToView(null)}
      />
    </div>
  );
}
