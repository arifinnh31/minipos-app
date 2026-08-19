'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/authGuard';
import { StockOpnameItem, StockOpnameReason } from '@/types/pos';

export async function saveStockOpnameAdjustmentAction(data: {
  auditorName: string;
  notes?: string;
  items: StockOpnameItem[];
}) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat menyimpan audit stok opname.' };
    }

    const totalDiscrepancy = data.items.reduce((acc, it) => acc + (it.lossValue || 0), 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Audit Record
      const audit = await tx.stockOpnameAudit.create({
        data: {
          auditDate: new Date(),
          auditorName: data.auditorName || 'Admin Toko',
          notes: data.notes || null,
          totalDiscrepancyValue: totalDiscrepancy,
          items: {
            create: data.items.map((it) => ({
              productId: it.productId,
              productName: it.productName,
              category: it.category,
              systemStock: it.systemStock,
              physicalStock: it.physicalStock,
              difference: it.difference,
              hpp: it.hpp,
              lossValue: it.lossValue,
              reason: it.reason as StockOpnameReason,
              notes: it.notes || null,
            })),
          },
        },
      });

      // 2. Adjust Product Stocks in master table
      for (const it of data.items) {
        if (it.difference !== 0) {
          await tx.product.update({
            where: { id: it.productId },
            data: {
              stock: it.physicalStock,
            },
          });
        }
      }

      return audit;
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin/inventory');
    safeRevalidatePath('/admin');

    return {
      success: true,
      message: 'Penyesuaian stok opname berhasil disimpan dan stok produk telah diperbarui!',
      auditId: result.id,
    };
  } catch (error: any) {
    console.error('Error in saveStockOpnameAdjustmentAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan stok opname.' };
  }
}
