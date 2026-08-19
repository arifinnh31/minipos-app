import React from 'react';
import { ProductManagementView } from '@/components/admin/ProductManagementView';
import { getProductsAction } from '@/actions/products';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const res = await getProductsAction();
  const products = res.data || [];
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  return (
    <ProductManagementView
      initialProducts={products}
      categories={categories}
    />
  );
}
