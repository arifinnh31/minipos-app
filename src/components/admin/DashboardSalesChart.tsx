'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  BarChart3,
  Calendar,
  Clock,
} from 'lucide-react';
import { Transaction } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { DateRangeValue } from './DateRangeFilter';

interface DashboardSalesChartProps {
  transactions: Transaction[];
  dateRange: DateRangeValue;
}

type ChartMetric = 'revenue' | 'count' | 'profit';

interface ChartDataPoint {
  key: string;
  label: string;
  fullDateLabel: string;
  revenue: number;
  profit: number;
  count: number;
  isPeak?: boolean;
}

export function DashboardSalesChart({
  transactions,
  dateRange,
}: DashboardSalesChartProps) {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Group transactions into continuous chronological intervals
  const chartData = useMemo(() => {
    const isHourly = dateRange.preset === 'today' || dateRange.preset === 'yesterday';

    if (isHourly) {
      // Group by all 24 hours (00:00 to 23:00) so no transaction is ever dropped
      const hourBuckets: { [hour: number]: { revenue: number; profit: number; count: number } } = {};
      for (let h = 0; h <= 23; h++) {
        hourBuckets[h] = { revenue: 0, profit: 0, count: 0 };
      }

      transactions.forEach((tx) => {
        const d = new Date(tx.createdAt);
        const h = d.getHours();
        if (hourBuckets[h] !== undefined) {
          hourBuckets[h].revenue += tx.total;
          hourBuckets[h].count += 1;
          const hpp = tx.items.reduce((acc, it) => acc + it.product.hpp * it.quantity, 0);
          hourBuckets[h].profit += tx.total - hpp;
        }
      });

      // Filter hours range to display: from 06:00 to 23:00 (or include earlier hours if they have data)
      const hasEarlyHours = [0, 1, 2, 3, 4, 5].some((h) => hourBuckets[h].count > 0);
      const startHour = hasEarlyHours ? 0 : 6;
      const endHour = 23;

      const points: ChartDataPoint[] = [];
      for (let h = startHour; h <= endHour; h++) {
        const padded = String(h).padStart(2, '0');
        points.push({
          key: `hour-${h}`,
          label: `${padded}:00`,
          fullDateLabel: `Pukul ${padded}:00 - ${padded}:59`,
          revenue: hourBuckets[h].revenue,
          profit: hourBuckets[h].profit,
          count: hourBuckets[h].count,
        });
      }
      return points;
    }

    // Daily grouping
    const dayBuckets: { [dateStr: string]: { label: string; fullDateLabel: string; revenue: number; profit: number; count: number; rawDate: Date } } = {};

    // If preset has bounded range, populate zero baseline days
    if (dateRange.startDate && dateRange.endDate) {
      const cur = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const now = new Date();
      // Cap at today for thisMonth if in the future
      const targetEnd = end > now && (dateRange.preset === 'thisMonth' || dateRange.preset === 'last7days') ? now : end;

      while (cur <= targetEnd) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        const shortLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(cur);
        const fullLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(cur);

        dayBuckets[key] = {
          label: shortLabel,
          fullDateLabel: fullLabel,
          revenue: 0,
          profit: 0,
          count: 0,
          rawDate: new Date(cur),
        };
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Populate actual transactions
    transactions.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;

      if (!dayBuckets[key]) {
        const shortLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
        const fullLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
        dayBuckets[key] = {
          label: shortLabel,
          fullDateLabel: fullLabel,
          revenue: 0,
          profit: 0,
          count: 0,
          rawDate: new Date(d),
        };
      }

      dayBuckets[key].revenue += tx.total;
      dayBuckets[key].count += 1;
      const hpp = tx.items.reduce((acc, it) => acc + it.product.hpp * it.quantity, 0);
      dayBuckets[key].profit += tx.total - hpp;
    });

    const sortedKeys = Object.keys(dayBuckets).sort();
    return sortedKeys.map((k) => ({
      key: k,
      label: dayBuckets[k].label,
      fullDateLabel: dayBuckets[k].fullDateLabel,
      revenue: dayBuckets[k].revenue,
      profit: dayBuckets[k].profit,
      count: dayBuckets[k].count,
    }));
  }, [transactions, dateRange]);

  // Determine max value for scaling chart
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    const values = chartData.map((d) => (activeMetric === 'revenue' ? d.revenue : activeMetric === 'profit' ? d.profit : d.count));
    const max = Math.max(...values, 0);
    return max === 0 ? (activeMetric === 'count' ? 5 : 100000) : max;
  }, [chartData, activeMetric]);

  const totalCurrentMetric = useMemo(() => {
    if (activeMetric === 'revenue') {
      return chartData.reduce((acc, d) => acc + d.revenue, 0);
    }
    if (activeMetric === 'profit') {
      return chartData.reduce((acc, d) => acc + d.profit, 0);
    }
    return chartData.reduce((acc, d) => acc + d.count, 0);
  }, [chartData, activeMetric]);

  const activePointsCount = chartData.filter((d) => (activeMetric === 'revenue' ? d.revenue : activeMetric === 'profit' ? d.profit : d.count) > 0).length;
  const avgCurrentMetric = activePointsCount > 0 ? totalCurrentMetric / activePointsCount : 0;

  // Chart styling colors per active metric
  const theme = useMemo(() => {
    switch (activeMetric) {
      case 'revenue':
        return {
          barColor: 'bg-blue-600 hover:bg-blue-700',
          barActive: 'bg-blue-700',
          textClass: 'text-blue-700',
          bgLight: 'bg-blue-50',
          borderClass: 'border-blue-200',
          unitLabel: 'Total Omzet',
          formatFn: (val: number) => formatRupiah(val),
        };
      case 'profit':
        return {
          barColor: 'bg-emerald-600 hover:bg-emerald-700',
          barActive: 'bg-emerald-700',
          textClass: 'text-emerald-700',
          bgLight: 'bg-emerald-50',
          borderClass: 'border-emerald-200',
          unitLabel: 'Estimasi Laba Kotor',
          formatFn: (val: number) => formatRupiah(val),
        };
      case 'count':
        return {
          barColor: 'bg-purple-600 hover:bg-purple-700',
          barActive: 'bg-purple-700',
          textClass: 'text-purple-700',
          bgLight: 'bg-purple-50',
          borderClass: 'border-purple-200',
          unitLabel: 'Jumlah Transaksi',
          formatFn: (val: number) => `${val} Struk`,
        };
    }
  }, [activeMetric]);

  const isHourly = dateRange.preset === 'today' || dateRange.preset === 'yesterday';

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
      {/* Chart Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${theme.bgLight} ${theme.textClass} flex items-center justify-center shrink-0`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Grafik Tren Penjualan &amp; Aktivitas Kasir
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                {isHourly ? <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                <span className="truncate">
                  {isHourly ? 'Dikelompokkan per jam aktivitas kasir' : 'Dikelompokkan per tanggal penjualan'} ({dateRange.label})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Metric Selector Buttons (Scrollable on small mobile screens) */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/90 gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveMetric('revenue')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeMetric === 'revenue'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>Omzet (Rp)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('profit')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeMetric === 'profit'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5 shrink-0" />
            <span>Laba Kotor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('count')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeMetric === 'count'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span>Jumlah Struk</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges (Tampilan Semula) */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{theme.unitLabel}:</span>
          <strong className={`font-mono font-bold ${theme.textClass}`}>
            {theme.formatFn(totalCurrentMetric)}
          </strong>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Rata-rata:</span>
          <strong className="font-mono font-bold text-slate-800">
            {theme.formatFn(Math.round(avgCurrentMetric))} / {isHourly ? 'jam aktif' : 'hari'}
          </strong>
        </div>
      </div>

      {/* Chart Canvas Area with Floating Tooltip */}
      <div className="relative pt-6">
        {/* Floating Tooltip Pill (Selalu persis di tengah layar card, tidak terpotong batas scroll) */}
        {hoveredPoint && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl shadow-xl text-xs z-30 flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100 border border-slate-700 whitespace-nowrap max-w-[92vw]">
            {isHourly ? <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
            <span className="font-medium text-slate-300">{hoveredPoint.fullDateLabel}:</span>
            <strong className="font-mono font-bold text-white">
              {theme.formatFn(
                activeMetric === 'revenue'
                  ? hoveredPoint.revenue
                  : activeMetric === 'profit'
                  ? hoveredPoint.profit
                  : hoveredPoint.count
              )}
            </strong>
            <span className="text-[10px] text-slate-400">({hoveredPoint.count} struk)</span>
          </div>
        )}

        {/* Interactive Bar Chart Horizontal Scroll Area for Mobile */}
        <div className="w-full overflow-x-auto pb-2 -mx-1 px-1">
          <div className="min-w-[480px] sm:min-w-full relative pt-2 pb-2">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-slate-200 border-dashed w-full" />
              <div className="border-b border-slate-200 border-dashed w-full" />
              <div className="border-b border-slate-200 border-dashed w-full" />
              <div className="border-b border-slate-300 w-full" />
            </div>

            {/* Bars Container */}
            <div className="relative z-10 flex items-end justify-between gap-1 sm:gap-1.5 h-52 sm:h-60 pt-2 px-1">
            {chartData.map((d, index) => {
              const val = activeMetric === 'revenue' ? d.revenue : activeMetric === 'profit' ? d.profit : d.count;
              const heightPercent = maxValue > 0 ? Math.max(4, (val / maxValue) * 100) : 4;
              const hasData = val > 0;

              // Only show every other label if too many hourly bars on mobile
              const showLabel = !isHourly || chartData.length <= 12 || index % 2 === 0 || index === chartData.length - 1;

              return (
                <div
                  key={d.key}
                  className="flex-1 min-w-0 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Bar Value on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-slate-700 mb-1 whitespace-nowrap hidden sm:block">
                    {hasData ? (activeMetric === 'count' ? val : `${Math.round(val / 1000)}k`) : ''}
                  </div>

                  {/* Animated Column Bar */}
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 shadow-2xs ${
                      hasData
                        ? `${theme.barColor} group-hover:scale-y-105 group-hover:brightness-110`
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* X-Axis Label */}
                  <span className={`text-[10px] font-medium text-slate-500 mt-2 truncate max-w-full text-center group-hover:text-slate-900 group-hover:font-bold ${showLabel ? 'opacity-100' : 'opacity-0 sm:opacity-70'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
