'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  AlertTriangle,
} from 'lucide-react';
import { Product, Transaction } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardKpiCard } from './DashboardKpiCard';
import { DashboardPaymentBreakdown } from './DashboardPaymentBreakdown';
import { DashboardTopProductsTable } from './DashboardTopProductsTable';
import { DashboardSalesChart } from './DashboardSalesChart';
import { DateRangeFilter, DateRangeValue, computePresetRange } from './DateRangeFilter';

interface AdminDashboardViewProps {
  products: Product[];
  transactions: Transaction[];
}

export function AdminDashboardView({ products, transactions }: AdminDashboardViewProps) {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    const range = computePresetRange('today');
    return {
      preset: 'today',
      startDate: range.startDate,
      endDate: range.endDate,
      label: range.label,
    };
  });

  // Filter transactions based on active date range
  const filteredTransactions = transactions.filter((tx) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    const txDate = new Date(tx.createdAt);
    if (dateRange.startDate && txDate < dateRange.startDate) return false;
    if (dateRange.endDate && txDate > dateRange.endDate) return false;
    return true;
  });

  // Aggregate Metrics based on filtered data
  const totalSales = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalTransactionsCount = filteredTransactions.length;
  const avgBasketSize = totalTransactionsCount > 0 ? totalSales / totalTransactionsCount : 0;

  // Calculate gross profit based on filtered transactions
  let totalHpp = 0;
  filteredTransactions.forEach((tx) => {
    tx.items.forEach((it) => {
      totalHpp += it.product.hpp * it.quantity;
    });
  });
  const grossProfit = totalSales - totalHpp;
  const marginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  // Payment Breakdown
  const cashSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((acc, t) => acc + t.total, 0);
  const qrisSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((acc, t) => acc + t.total, 0);

  const cashPercent = totalSales > 0 ? (cashSales / totalSales) * 100 : 0;
  const qrisPercent = totalSales > 0 ? (qrisSales / totalSales) * 100 : 0;

  // Low stock products (always current master catalog inventory)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Top Selling Products Calculation based on filtered transactions
  const productSalesMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
  filteredTransactions.forEach((tx) => {
    tx.items.forEach((it) => {
      if (!productSalesMap[it.product.id]) {
        productSalesMap[it.product.id] = {
          name: it.product.name,
          qty: 0,
          revenue: 0,
        };
      }
      productSalesMap[it.product.id].qty += it.quantity;
      productSalesMap[it.product.id].revenue += it.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Header */}
      <PageHeader
        title="Dashboard Penjualan & Performa Toko"
        description="Ringkasan omset harian, laba rugi, dan tren perputaran stok barang."
        action={
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
          />
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <DashboardKpiCard
          title="Total Penjualan"
          value={formatRupiah(totalSales)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              {totalTransactionsCount > 0
                ? `${totalTransactionsCount} transaksi (${dateRange.label})`
                : `0 transaksi pada ${dateRange.label}`}
            </span>
          }
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />

        {/* Total Transaksi */}
        <DashboardKpiCard
          title="Total Transaksi"
          value={totalTransactionsCount.toString()}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Rata-rata: {formatRupiah(avgBasketSize)} / struk
            </span>
          }
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />

        {/* Laba Bersih */}
        <DashboardKpiCard
          title="Estimasi Laba Kotor"
          value={formatRupiah(grossProfit)}
          subtitle={
            <span className="text-xs text-slate-500 font-medium block">
              Margin Laba: <strong className="text-slate-800">{marginPercent.toFixed(1)}%</strong>
            </span>
          }
          icon={<PiggyBank className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          valueColor="text-emerald-600"
        />

        {/* Low Stock Alert */}
        <DashboardKpiCard
          title="Stok Perlu Restok"
          value={`${lowStockProducts.length} Produk`}
          subtitle={
            <span className="text-xs text-amber-700 font-medium block">
              Stok &le; Batas Minimum
            </span>
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          valueColor="text-amber-600"
        />
      </div>

      {/* Main Interactive Chart Section */}
      <DashboardSalesChart
        transactions={filteredTransactions}
        dateRange={dateRange}
      />

      {/* Row 3: Payment Method Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardPaymentBreakdown
          cashSales={cashSales}
          qrisSales={qrisSales}
          cashPercent={cashPercent}
          qrisPercent={qrisPercent}
        />

        <DashboardTopProductsTable
          topProducts={topProducts}
        />
      </div>
    </div>
  );
}
