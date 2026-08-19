'use client';

import React, { useState } from 'react';
import { History } from 'lucide-react';
import { CashierUser, CashierShift } from '@/types/pos';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CashierShiftHistoryRow } from './CashierShiftHistoryRow';
import { DateRangeFilter, DateRangeValue, computePresetRange } from './DateRangeFilter';

interface CashierShiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: CashierUser | null;
  shiftHistory: CashierShift[];
}

export function CashierShiftHistoryModal({
  isOpen,
  onClose,
  cashier,
  shiftHistory,
}: CashierShiftHistoryModalProps) {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    const range = computePresetRange('thisMonth');
    return {
      preset: 'thisMonth',
      startDate: range.startDate,
      endDate: range.endDate,
      label: range.label,
    };
  });

  if (!cashier) return null;

  const cashierShifts = shiftHistory
    .filter(
      (s) => s.cashierId === cashier.id || s.cashierName.toLowerCase().includes(cashier.name.toLowerCase())
    )
    .filter((s) => {
      if (!dateRange.startDate && !dateRange.endDate) return true;
      const shiftDate = new Date(s.startTime);
      if (dateRange.startDate && shiftDate < dateRange.startDate) return false;
      if (dateRange.endDate && shiftDate > dateRange.endDate) return false;
      return true;
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <History className="w-5 h-5 text-blue-600" />
          <span>Riwayat Shift: {cashier.name}</span>
        </div>
      }
      description="Histori pembukaan shift kasir, perolehan omset tunai vs QRIS, dan pencatatan selisih kas fisik laci."
      size="xl"
    >
      <div className="space-y-4">
        {/* Date Filter Dropdown */}
        <div className="flex justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        {cashierShifts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Riwayat Shift pada Periode Ini</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tidak ada catatan shift kasir yang terekam pada periode {dateRange.label}.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {cashierShifts.map((shift) => (
              <CashierShiftHistoryRow key={shift.id} shift={shift} />
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" size="md" onClick={onClose}>
            Tutup (Esc)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
