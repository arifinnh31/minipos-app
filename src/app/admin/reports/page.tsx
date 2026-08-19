import React from 'react';
import { SalesReportView } from '@/components/admin/SalesReportView';
import { getTransactionsAction } from '@/actions/transactions';
import { getStoreSettingsAction } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const [transactionsRes, settingsRes] = await Promise.all([
    getTransactionsAction(),
    getStoreSettingsAction(),
  ]);

  return (
    <SalesReportView
      transactions={transactionsRes.data || []}
      storeSettings={settingsRes.data}
    />
  );
}
