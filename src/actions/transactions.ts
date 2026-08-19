'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { Transaction, PaymentMethod, CartItem } from '@/types/pos';

export async function getTransactionsAction(): Promise<{
  success: boolean;
  data: Transaction[];
  error?: string;
}> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const formatted: Transaction[] = transactions.map((t) => ({
      id: t.id,
      receiptNumber: t.receiptNumber,
      cashierName: t.cashierName,
      shiftId: t.shiftId ?? undefined,
      items: t.items.map((it) => ({
        id: it.id,
        product: {
          id: it.product.id,
          sku: it.product.sku,
          barcode: it.product.barcode,
          name: it.product.name,
          category: it.product.category,
          hpp: it.product.hpp,
          price: it.product.price,
          isPromo: it.product.isPromo,
          discountType: it.product.discountType as any,
          discountValue: it.product.discountValue,
          promoPrice: it.product.promoPrice ?? undefined,
          stock: it.product.stock,
          minStock: it.product.minStock,
          unit: it.product.unit,
          image: it.product.image ?? undefined,
        },
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        originalPrice: it.originalPrice,
        discountPerItem: it.discountPerItem,
        discountTotal: it.discountTotal,
        subtotal: it.subtotal,
        notes: it.notes ?? undefined,
      })),
      subtotal: t.subtotal,
      discountTotal: t.discountTotal,
      taxTotal: t.taxTotal,
      total: t.total,
      paymentMethod: t.paymentMethod as PaymentMethod,
      cashReceived: t.cashReceived ?? undefined,
      changeGiven: t.changeGiven ?? undefined,
      createdAt: t.createdAt.toISOString(),
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getTransactionsAction:', error);
    return { success: false, data: [], error: error.message || 'Gagal memuat daftar transaksi.' };
  }
}

export async function createTransactionAction(data: {
  receiptNumber?: string;
  cashierId?: string;
  cashierName: string;
  shiftId?: string;
  items: (CartItem | {
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    originalPrice: number;
    discountPerItem: number;
    discountTotal: number;
    subtotal: number;
    notes?: string;
  })[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
}) {
  try {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let receiptNumber = data.receiptNumber;
    if (!receiptNumber) {
      const countToday = await prisma.transaction.count();
      const baseNum = `BM-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;
      const existing = await prisma.transaction.findUnique({ where: { receiptNumber: baseNum } });
      if (existing) {
        const salt = Math.floor(100 + Math.random() * 900);
        receiptNumber = `BM-${todayStr}-${String(countToday + 1).padStart(4, '0')}-${salt}`;
      } else {
        receiptNumber = baseNum;
      }
    }

    // Pre-resolve product names if not provided
    const productIds = data.items.map((i: any) => i.product?.id || i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productNameMap = new Map(dbProducts.map((p) => [p.id, p.name]));

    // Execute transaction: Create transaction record and decrement stock atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction
      const createdTx = await tx.transaction.create({
        data: {
          receiptNumber,
          cashierId: data.cashierId || null,
          cashierName: data.cashierName,
          shiftId: data.shiftId || null,
          subtotal: data.subtotal,
          discountTotal: data.discountTotal,
          taxTotal: data.taxTotal,
          total: data.total,
          paymentMethod: data.paymentMethod,
          cashReceived: data.cashReceived || null,
          changeGiven: data.changeGiven || null,
          items: {
            create: data.items.map((item: any) => {
              const pId = item.product?.id || item.productId;
              const pName = item.product?.name || item.productName || productNameMap.get(pId) || 'Produk';
              return {
                productId: pId,
                productName: pName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                originalPrice: item.originalPrice,
                discountPerItem: item.discountPerItem,
                discountTotal: item.discountTotal,
                subtotal: item.subtotal,
                notes: item.notes || null,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 2. Decrement stock for each product
      for (const item of data.items) {
        const pId = (item as any).product?.id || (item as any).productId;
        await tx.product.update({
          where: { id: pId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Update active shift sales numbers (if shiftId provided)
      if (data.shiftId) {
        const isCash = data.paymentMethod === 'CASH';
        await tx.cashierShift.update({
          where: { id: data.shiftId },
          data: {
            totalTransactions: { increment: 1 },
            totalCashSales: isCash ? { increment: data.total } : undefined,
            totalQrisSales: !isCash ? { increment: data.total } : undefined,
            expectedCashInDrawer: isCash ? { increment: data.total } : undefined,
          },
        });
      }

      // 4. Update cashier user total sales volume
      if (data.cashierId) {
        try {
          await tx.user.update({
            where: { id: data.cashierId },
            data: {
              totalSalesVolume: { increment: data.total },
            },
          });
        } catch {
          // If cashierId doesn't exist in user table, continue safely
        }
      }

      return createdTx;
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/cashiers');
    safeRevalidatePath('/admin/reports');
    safeRevalidatePath('/admin/products');

    const formattedTx: Transaction = {
      id: result.id,
      receiptNumber: result.receiptNumber,
      cashierName: result.cashierName,
      shiftId: result.shiftId ?? undefined,
      items: result.items.map((it) => ({
        id: it.id,
        product: {
          id: it.product.id,
          sku: it.product.sku,
          barcode: it.product.barcode,
          name: it.product.name,
          category: it.product.category,
          hpp: it.product.hpp,
          price: it.product.price,
          isPromo: it.product.isPromo,
          discountType: it.product.discountType as any,
          discountValue: it.product.discountValue,
          promoPrice: it.product.promoPrice ?? undefined,
          stock: it.product.stock,
          minStock: it.product.minStock,
          unit: it.product.unit,
        },
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        originalPrice: it.originalPrice,
        discountPerItem: it.discountPerItem,
        discountTotal: it.discountTotal,
        subtotal: it.subtotal,
        notes: it.notes ?? undefined,
      })),
      subtotal: result.subtotal,
      discountTotal: result.discountTotal,
      taxTotal: result.taxTotal,
      total: result.total,
      paymentMethod: result.paymentMethod as PaymentMethod,
      cashReceived: result.cashReceived ?? undefined,
      changeGiven: result.changeGiven ?? undefined,
      createdAt: result.createdAt.toISOString(),
    };

    return {
      success: true,
      data: formattedTx,
    };
  } catch (error: any) {
    console.error('Error in createTransactionAction:', error);
    return { success: false, error: error.message || 'Gagal memproses transaksi kasir.' };
  }
}
