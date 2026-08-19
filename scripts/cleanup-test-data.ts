import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function cleanup() {
  console.log('🧹 Menghapus semua data sisa hasil pengujian / testing dari database...');

  // 1. Delete test transactions & transaction items
  const testTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { cashierName: { contains: 'E2E' } },
        { cashierName: { contains: 'Test' } },
      ],
    },
  });

  const txIds = testTransactions.map((t) => t.id);
  if (txIds.length > 0) {
    const deletedItems = await prisma.transactionItem.deleteMany({
      where: { transactionId: { in: txIds } },
    });
    const deletedTx = await prisma.transaction.deleteMany({
      where: { id: { in: txIds } },
    });
    console.log(`  - Dihapus ${deletedItems.count} item transaksi test & ${deletedTx.count} transaksi test.`);
  }

  // 2. Delete test stock opname audits & items
  const testAudits = await prisma.stockOpnameAudit.findMany({
    where: {
      OR: [
        { auditorName: { contains: 'Budi Santoso' } },
        { auditorName: { contains: 'Test' } },
        { notes: { contains: 'E2E' } },
      ],
    },
  });

  const auditIds = testAudits.map((a) => a.id);
  if (auditIds.length > 0) {
    const deletedAuditItems = await prisma.stockOpnameItem.deleteMany({
      where: { auditId: { in: auditIds } },
    });
    const deletedAudits = await prisma.stockOpnameAudit.deleteMany({
      where: { id: { in: auditIds } },
    });
    console.log(`  - Dihapus ${deletedAuditItems.count} item audit test & ${deletedAudits.count} audit test.`);
  }

  // Delete orphaned test stock opname items
  await prisma.stockOpnameItem.deleteMany({
    where: {
      productName: { contains: 'E2E' },
    },
  });

  // 3. Delete test held carts
  const deletedHeld = await prisma.heldCart.deleteMany({
    where: {
      OR: [
        { label: { contains: 'E2E' } },
        { label: { contains: '#99' } },
        { customerName: { contains: 'Baju Merah' } },
      ],
    },
  });
  if (deletedHeld.count > 0) {
    console.log(`  - Dihapus ${deletedHeld.count} antrean held cart test.`);
  }

  // 4. Delete test products
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      OR: [
        { name: { contains: 'E2E' } },
        { sku: { startsWith: 'TEST-' } },
      ],
    },
  });
  if (deletedProducts.count > 0) {
    console.log(`  - Dihapus ${deletedProducts.count} produk test.`);
  }

  // 5. Delete test cashier shifts & test users
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'E2E' } },
        { name: { contains: 'Test' } },
      ],
    },
  });

  const userIds = testUsers.map((u) => u.id);
  if (userIds.length > 0) {
    const deletedShifts = await prisma.cashierShift.deleteMany({
      where: { cashierId: { in: userIds } },
    });
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`  - Dihapus ${deletedShifts.count} shift test & ${deletedUsers.count} user kasir test.`);
  }

  // 6. Reset Store Settings tagline to standard
  await prisma.storeSettings.updateMany({
    where: { id: 'default-store' },
    data: {
      tagline: 'Minimarket Hemat, Cepat & Bersahabat',
    },
  });
  console.log('  - Tagline toko berhasil di-reset ke standar: "Minimarket Hemat, Cepat & Bersahabat".');

  console.log('\n✨ Seluruh data pengujian telah dibersihkan secara tuntas!');
}

cleanup().catch((err) => {
  console.error('Error saat membersihkan data:', err);
  process.exit(1);
});
