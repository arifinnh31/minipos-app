import React from 'react';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { getProductsAction } from '@/actions/products';
import { getTransactionsAction } from '@/actions/transactions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [productsRes, transactionsRes] = await Promise.all([
    getProductsAction(),
    getTransactionsAction(),
  ]);

  return (
    <AdminDashboardView
      products={productsRes.data || []}
      transactions={transactionsRes.data || []}
    />
  );
}
