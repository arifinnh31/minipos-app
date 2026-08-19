import React from 'react';
import { StockOpnameView } from '@/components/admin/StockOpnameView';
import { getProductsAction } from '@/actions/products';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const res = await getProductsAction();

  return (
    <StockOpnameView
      initialProducts={res.data || []}
    />
  );
}
