import { PosWorkspace } from '@/components/pos/PosWorkspace';
import { getProductsAction } from '@/actions/products';
import { getActiveShiftAction } from '@/actions/shifts';
import { getHeldCartsAction } from '@/actions/heldCarts';
import { getStoreSettingsAction } from '@/actions/settings';
import { getCashiersAction } from '@/actions/cashiers';
import { getTransactionsAction } from '@/actions/transactions';

export const dynamic = 'force-dynamic';

export default async function PosPage() {
  const [productsRes, activeShiftRes, heldCartsRes, settingsRes, cashiersRes, transactionsRes] =
    await Promise.all([
      getProductsAction(),
      getActiveShiftAction(),
      getHeldCartsAction(),
      getStoreSettingsAction(),
      getCashiersAction(),
      getTransactionsAction(),
    ]);

  return (
    <PosWorkspace
      initialProducts={productsRes.data || []}
      initialActiveShift={activeShiftRes.data || null}
      initialHeldCarts={heldCartsRes.data || []}
      initialStoreSettings={settingsRes.data}
      initialCashiers={cashiersRes.data || []}
      initialTransactions={transactionsRes.data || []}
    />
  );
}
