import React from 'react';
import { CashierManagementView } from '@/components/admin/CashierManagementView';
import { getCashiersAction } from '@/actions/cashiers';
import { getShiftHistoryAction } from '@/actions/shifts';

export const dynamic = 'force-dynamic';

export default async function AdminCashiersPage() {
  const [cashiersRes, shiftRes] = await Promise.all([
    getCashiersAction(),
    getShiftHistoryAction(),
  ]);

  return (
    <CashierManagementView
      initialCashiers={cashiersRes.data || []}
      initialShiftHistory={shiftRes.data || []}
    />
  );
}
