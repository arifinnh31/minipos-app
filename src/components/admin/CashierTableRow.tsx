'use client';

import React from 'react';
import { UserCheck, Shield, KeyRound, Edit2, History, Power } from 'lucide-react';
import { CashierUser } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface CashierTableRowProps {
  cashier: CashierUser;
  onEdit: (cashier: CashierUser) => void;
  onViewHistory: (cashier: CashierUser) => void;
  onToggleStatus: (id: string) => void;
}

export function CashierTableRow({
  cashier: c,
  onEdit,
  onViewHistory,
  onToggleStatus,
}: CashierTableRowProps) {
  const isManager = c.role === 'ADMIN';

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      {/* Nama & Role */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
              isManager
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {isManager ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">{c.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {c.id} &bull; Telp: {c.phone || '-'}
            </span>
          </div>
        </div>
      </td>

      {/* Role Badge */}
      <td className="py-3.5 px-4">
        <Badge variant={isManager ? 'purple' : 'blue'} size="sm">
          {isManager ? 'Manajer / Admin' : 'Petugas Kasir'}
        </Badge>
      </td>

      {/* PIN Operasional (Disembunyikan / Masked) */}
      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs border border-slate-200 text-slate-600">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span className="tracking-widest">••••</span>
        </div>
      </td>

      {/* Performa Shift */}
      <td className="py-3.5 px-4 text-center font-mono">
        <span className="font-bold text-slate-900">{c.totalShiftsCompleted} Shift</span>
        <span className="text-[10px] text-slate-400 block">Terselesaikan</span>
      </td>

      {/* Total Volume Penjualan */}
      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
        {formatRupiah(c.totalSalesVolume)}
      </td>

      {/* Status Aktif */}
      <td className="py-3.5 px-4 text-center">
        <Badge variant={c.isActive ? 'green' : 'red'} size="sm">
          {c.isActive ? 'Aktif Bertugas' : 'Nonaktif'}
        </Badge>
      </td>

      {/* Aksi */}
      <td className="py-3.5 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onViewHistory(c)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Lihat Riwayat Shift Kasir"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(c)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Profil & PIN"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(c.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              c.isActive
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={c.isActive ? 'Nonaktifkan Kasir' : 'Aktifkan Kasir'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
