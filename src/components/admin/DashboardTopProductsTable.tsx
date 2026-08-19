'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

import {
  TableCard,
  TableCardHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState,
} from '@/components/ui/Table';

interface TopProductItem {
  name: string;
  qty: number;
  revenue: number;
}

interface DashboardTopProductsTableProps {
  topProducts: TopProductItem[];
}

export function DashboardTopProductsTable({ topProducts }: DashboardTopProductsTableProps) {
  return (
    <TableCard className="lg:col-span-2">
      <TableCardHeader>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Top Produk Paling Laris</span>
          </h3>
          <p className="text-xs text-slate-500">Berdasarkan volume kuantitas penjualan hari ini</p>
        </div>
      </TableCardHeader>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Peringkat</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead align="center">Terjual</TableHead>
            <TableHead align="right">Total Pendapatan</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {topProducts.length === 0 ? (
            <TableEmptyState
              colSpan={4}
              title="Belum ada penjualan"
              description="Belum ada produk terjual yang tercatat hari ini."
            />
          ) : (
            topProducts.map((p, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono font-bold text-slate-500">
                  #{i + 1}
                </TableCell>
                <TableCell className="font-bold text-slate-900">
                  {p.name}
                </TableCell>
                <TableCell align="center" className="font-mono font-bold text-blue-600">
                  {p.qty} Pcs
                </TableCell>
                <TableCell align="right" className="font-mono font-bold text-slate-900">
                  {formatRupiah(p.revenue)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableCard>
  );
}
