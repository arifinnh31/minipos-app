import React from 'react';
import { StoreSettingsView } from '@/components/admin/StoreSettingsView';
import { getStoreSettingsAction } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const res = await getStoreSettingsAction();

  return (
    <StoreSettingsView
      initialSettings={res.data}
    />
  );
}
