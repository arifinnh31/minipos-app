'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { HeldCart, CartItem } from '@/types/pos';

export async function getHeldCartsAction(): Promise<{
  success: boolean;
  data: HeldCart[];
  error?: string;
}> {
  try {
    const heldCarts = await prisma.heldCart.findMany({
      orderBy: { heldAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const formatted: HeldCart[] = heldCarts.map((hc) => ({
      id: hc.id,
      label: hc.label,
      customerName: hc.customerName,
      note: hc.note ?? undefined,
      total: hc.total,
      heldAt: hc.heldAt.toISOString(),
      items: hc.items.map((it) => ({
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
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getHeldCartsAction:', error);
    return { success: false, data: [], error: error.message || 'Gagal memuat antrean tertahan.' };
  }
}

export async function createHeldCartAction(data: {
  label: string;
  customerName: string;
  note?: string;
  total: number;
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
}) {
  try {
    const productIds = data.items.map((it: any) => it.product?.id || it.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productNameMap = new Map(dbProducts.map((p) => [p.id, p.name]));

    const created = await prisma.heldCart.create({
      data: {
        label: data.label,
        customerName: data.customerName,
        note: data.note || null,
        total: data.total,
        heldAt: new Date(),
        items: {
          create: data.items.map((it: any) => {
            const pId = it.product?.id || it.productId;
            const pName = it.product?.name || it.productName || productNameMap.get(pId) || 'Produk';
            return {
              productId: pId,
              productName: pName,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              originalPrice: it.originalPrice,
              discountPerItem: it.discountPerItem,
              discountTotal: it.discountTotal,
              subtotal: it.subtotal,
              notes: it.notes || null,
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

    safeRevalidatePath('/');

    const formatted: HeldCart = {
      id: created.id,
      label: created.label,
      customerName: created.customerName,
      note: created.note ?? undefined,
      total: created.total,
      heldAt: created.heldAt.toISOString(),
      items: created.items.map((it) => ({
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
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in createHeldCartAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan antrean belanja.' };
  }
}

export async function deleteHeldCartAction(id: string) {
  try {
    await prisma.heldCart.delete({
      where: { id },
    });

    safeRevalidatePath('/');

    return { success: true, message: 'Antrean belanja berhasil dihapus/dimuat.' };
  } catch (error: any) {
    console.error('Error in deleteHeldCartAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus antrean belanja.' };
  }
}
