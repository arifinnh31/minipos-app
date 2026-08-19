import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { adminLoginAction, verifyCashierPinAction, changeCashierPinAction } from '../src/actions/auth';
import { getProductsAction, createProductAction, updateProductAction, deleteProductAction } from '../src/actions/products';
import { getActiveShiftAction, openShiftAction, closeShiftAction, getShiftHistoryAction } from '../src/actions/shifts';
import { createTransactionAction, getTransactionsAction } from '../src/actions/transactions';
import { createHeldCartAction, getHeldCartsAction, deleteHeldCartAction } from '../src/actions/heldCarts';
import { getCashiersAction, createCashierAction, updateCashierAction, deleteCashierAction } from '../src/actions/cashiers';
import { getStoreSettingsAction, updateStoreSettingsAction } from '../src/actions/settings';
import { saveStockOpnameAdjustmentAction } from '../src/actions/stockOpname';

async function runE2ETests() {
  console.log('🚀 Starting Comprehensive E2E Simulation on Live Supabase Database...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`  ✅ [PASS] ${testName}`);
      if (detail) console.log(`     ↳ ${detail}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     ↳ ${detail}`);
    }
  }

  // 1. Admin Auth
  console.log('\n--- 1. Admin Authentication ---');
  const validLogin = await adminLoginAction({ email: 'admin@tokoku.com', password: 'admin123' });
  assert(validLogin.success === true, 'Admin Login Valid Credentials', `Logged in as ${validLogin.user?.name}`);

  const invalidLogin = await adminLoginAction({ email: 'admin@tokoku.com', password: 'wrongpassword' });
  assert(invalidLogin.success === false, 'Admin Login Invalid Password Rejection', `Error: ${invalidLogin.error}`);

  // 2. Cashier CRUD & PIN
  console.log('\n--- 2. Cashier Management & PIN System ---');
  const newCashierRes = await createCashierAction({
    name: 'Budi Santoso (E2E Test)',
    role: 'CASHIER',
    pin: '5678',
    phone: '081234567890',
  });
  assert(newCashierRes.success && !!newCashierRes.data?.id, 'Create New Cashier', `Cashier ID: ${newCashierRes.data?.id}`);
  const testCashierId = newCashierRes.data!.id;

  const pinVerifyRes = await verifyCashierPinAction(testCashierId, '5678');
  assert(pinVerifyRes.success === true, 'Verify Initial Cashier PIN (5678)', `Verified cashier: ${pinVerifyRes.cashier?.name}`);

  const changePinRes = await changeCashierPinAction(testCashierId, '5678', '9999');
  assert(changePinRes.success === true, 'Change Cashier PIN to 9999');

  const newPinVerifyRes = await verifyCashierPinAction(testCashierId, '9999');
  assert(newPinVerifyRes.success === true, 'Verify New PIN (9999)');

  // 3. Product Catalog CRUD & Promo Logic
  console.log('\n--- 3. Product Management & Promo Calculation ---');
  const testBarcode = `899${Date.now().toString().slice(-9)}`;
  const newProdRes = await createProductAction({
    sku: `TEST-${Date.now().toString().slice(-4)}`,
    barcode: testBarcode,
    name: 'Kopi Susu Gula Aren Botol 250ml (E2E)',
    category: 'Minuman Dingin',
    hpp: 6500,
    price: 10000,
    isPromo: true,
    discountType: 'PERCENT',
    discountValue: 10, // 10% off -> promoPrice = 9000
    stock: 50,
    minStock: 10,
    unit: 'Btl',
  });
  assert(newProdRes.success && newProdRes.data?.promoPrice === 9000, 'Create Promo Product (10% discount computed)', `Price: Rp 10.000 -> Promo: Rp ${newProdRes.data?.promoPrice}`);
  const testProduct = newProdRes.data!;

  // 4. Shift Management
  console.log('\n--- 4. Shift Lifecycle & Opening ---');
  const openShiftRes = await openShiftAction({
    cashierId: testCashierId,
    shiftName: 'Shift 1 (Pagi)',
    startingCash: 250000,
    notes: 'Modal awal uang kembalian Rp 250.000',
  });
  assert(openShiftRes.success && openShiftRes.data?.status === 'OPEN', 'Open Cashier Shift with Modal Awal', `Shift ID: ${openShiftRes.data?.id}, Starting Cash: Rp ${openShiftRes.data?.startingCash}`);
  const testShiftId = openShiftRes.data!.id;

  // 5. Transaction & Stock Deduction (Atomic)
  console.log('\n--- 5. Atomic Checkout & Stock Deduction ---');
  const initialStock = testProduct.stock;
  const txRes = await createTransactionAction({
    cashierName: 'Budi Santoso (E2E Test)',
    shiftId: testShiftId,
    paymentMethod: 'CASH',
    cashReceived: 50000,
    changeGiven: 32000,
    subtotal: 20000,
    discountTotal: 2000, // 2 x 1000 diskon
    taxTotal: 0,
    total: 18000,
    items: [
      {
        productId: testProduct.id,
        quantity: 2,
        unitPrice: 9000,
        originalPrice: 10000,
        discountPerItem: 1000,
        discountTotal: 2000,
        subtotal: 18000,
      },
    ],
  });
  assert(txRes.success && !!txRes.data?.receiptNumber, 'Process Cash Transaction', `No. Struk: ${txRes.data?.receiptNumber}`);

  // Check product stock after transaction
  const updatedProd = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert(updatedProd?.stock === initialStock - 2, 'Stock Deducted in Database', `Initial: ${initialStock} -> Now: ${updatedProd?.stock} (-2 items)`);

  // 6. Hold & Resume Cart
  console.log('\n--- 6. Hold Cart & Resume ---');
  const holdRes = await createHeldCartAction({
    label: 'Antrean #99 - Pelanggan Baju Merah',
    customerName: 'Pelanggan Baju Merah',
    note: 'Ambil uang di ATM terdekat',
    total: 18000,
    items: [
      {
        productId: testProduct.id,
        quantity: 2,
        unitPrice: 9000,
        originalPrice: 10000,
        discountPerItem: 1000,
        discountTotal: 2000,
        subtotal: 18000,
      },
    ],
  });
  assert(holdRes.success && !!holdRes.data?.id, 'Create Held Cart in Database', `Held Cart ID: ${holdRes.data?.id}`);
  const testHeldCartId = holdRes.data!.id;

  const getHeldRes = await getHeldCartsAction();
  assert(getHeldRes.data?.some((h) => h.id === testHeldCartId) === true, 'Retrieve Active Held Carts List');

  const delHeldRes = await deleteHeldCartAction(testHeldCartId);
  assert(delHeldRes.success === true, 'Delete / Resume Held Cart');

  // 7. Stock Opname Audit
  console.log('\n--- 7. Stock Opname Audit ---');
  const opnameRes = await saveStockOpnameAdjustmentAction({
    auditorName: 'Budi Santoso',
    notes: 'Audit mingguan fisik rak pajang',
    items: [
      {
        productId: testProduct.id,
        sku: testProduct.sku,
        barcode: testProduct.barcode,
        productName: testProduct.name,
        category: testProduct.category,
        systemStock: 48,
        physicalStock: 47, // 1 hilang/rusak
        difference: -1,
        hpp: testProduct.hpp,
        lossValue: testProduct.hpp,
        reason: 'RUSAK',
        notes: 'Kemasan penyok saat display',
      },
    ],
  });
  assert(opnameRes.success === true, 'Execute Stock Opname Adjustment');
  const postOpnameProd = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert(postOpnameProd?.stock === 47, 'Database Stock Updated from Opname', `Stock updated to ${postOpnameProd?.stock}`);

  // 8. Close Shift & Blind Count Reconciliation
  console.log('\n--- 8. Shift Close & Cash Reconciliation ---');
  const closeShiftRes = await closeShiftAction({
    shiftId: testShiftId,
    actualCashCount: 268000, // Expected: 250000 + 18000 = 268000
    notes: 'Shift selesai, kas laci sesuai dan seimbang.',
  });
  assert(closeShiftRes.success && closeShiftRes.data?.difference === 0, 'Close Shift with Zero Cash Discrepancy', `Expected: Rp ${closeShiftRes.data?.expectedCashInDrawer}, Actual: Rp ${closeShiftRes.data?.actualCashCount}, Difference: Rp ${closeShiftRes.data?.difference}`);

  // 9. Store Settings
  console.log('\n--- 9. Store Settings Management ---');
  const currentSettings = await getStoreSettingsAction();
  const updateSettingsRes = await updateStoreSettingsAction({
    ...currentSettings.data!,
    tagline: 'Minimarket Paling Lengkap & Terpercaya (E2E Verified)',
  });
  assert(updateSettingsRes.success === true, 'Update Store Settings in PostgreSQL');

  // 10. Comprehensive Cleanup of Test Data
  console.log('\n--- 10. Cleanup Test Fixtures ---');
  await prisma.transactionItem.deleteMany({ where: { transaction: { shiftId: testShiftId } } });
  await prisma.transaction.deleteMany({ where: { shiftId: testShiftId } });
  await prisma.stockOpnameItem.deleteMany({ where: { productId: testProduct.id } });
  await prisma.stockOpnameAudit.deleteMany({ where: { notes: 'Audit mingguan fisik rak pajang' } });
  await prisma.product.deleteMany({ where: { id: testProduct.id } });
  await prisma.cashierShift.deleteMany({ where: { id: testShiftId } });
  await prisma.user.deleteMany({ where: { id: testCashierId } });
  await prisma.storeSettings.updateMany({
    where: { id: 'default-store' },
    data: { tagline: 'Minimarket Hemat, Cepat & Bersahabat' },
  });
  console.log('  🧹 Cleaned up temporary test transactions, audit, product, shift, cashier, and restored settings.');

  console.log(`\n======================================================`);
  console.log(`📊 FINAL RESULT: ${testsPassed} / ${testsTotal} Tests Passed (${Math.round((testsPassed / testsTotal) * 100)}%)`);
  console.log(`======================================================\n`);

  if (testsPassed === testsTotal) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E Test Error:', err);
  process.exit(1);
});
