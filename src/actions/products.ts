'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/authGuard';
import { Product, DiscountType } from '@/types/pos';

function calculatePromoPrice(
  price: number,
  isPromo?: boolean,
  discountType?: DiscountType | 'NONE' | 'PERCENT' | 'NOMINAL',
  discountValue?: number,
  explicitPromoPrice?: number | null
): number | null {
  if (!isPromo || discountType === 'NONE' || !discountValue) {
    return null;
  }
  if (explicitPromoPrice !== undefined && explicitPromoPrice !== null) {
    return explicitPromoPrice;
  }
  if (discountType === 'PERCENT') {
    return Math.round(price * (1 - discountValue / 100));
  }
  if (discountType === 'NOMINAL') {
    return Math.max(0, price - discountValue);
  }
  return null;
}

export async function getProductsAction(): Promise<{ success: boolean; data: Product[]; error?: string }> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const formatted: Product[] = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      hpp: p.hpp,
      price: p.price,
      isPromo: p.isPromo,
      discountType: p.discountType as DiscountType,
      discountValue: p.discountValue,
      promoPrice: p.promoPrice ?? undefined,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      image: p.image ?? undefined,
      isActive: p.isActive,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getProductsAction:', error);
    return { success: false, data: [], error: error.message || 'Gagal memuat katalog produk.' };
  }
}

export async function createProductAction(data: Omit<Product, 'id'>) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat menambah produk.' };
    }

    const computedPromoPrice = calculatePromoPrice(
      data.price,
      data.isPromo,
      data.discountType,
      data.discountValue,
      data.promoPrice
    );

    // Check barcode duplicate
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: data.barcode.trim() },
      });
      if (existingBarcode) {
        if (!existingBarcode.isActive) {
          // Reactivate archived product with new data
          const updated = await prisma.product.update({
            where: { id: existingBarcode.id },
            data: {
              sku: data.sku ? data.sku.trim() : existingBarcode.sku,
              name: data.name.trim(),
              category: data.category,
              hpp: data.hpp,
              price: data.price,
              isPromo: data.isPromo || false,
              discountType: (data.discountType as DiscountType) || 'NONE',
              discountValue: data.discountValue || 0,
              promoPrice: computedPromoPrice,
              stock: data.stock || 0,
              minStock: data.minStock || 5,
              unit: data.unit || 'Pcs',
              image: data.image || null,
              isActive: true,
            },
          });

          safeRevalidatePath('/');
          safeRevalidatePath('/admin/products');
          safeRevalidatePath('/admin');

          return {
            success: true,
            data: {
              id: updated.id,
              sku: updated.sku,
              barcode: updated.barcode,
              name: updated.name,
              category: updated.category,
              hpp: updated.hpp,
              price: updated.price,
              isPromo: updated.isPromo,
              discountType: updated.discountType as DiscountType,
              discountValue: updated.discountValue,
              promoPrice: updated.promoPrice ?? undefined,
              stock: updated.stock,
              minStock: updated.minStock,
              unit: updated.unit,
              image: updated.image ?? undefined,
              isActive: updated.isActive,
            } as Product,
          };
        }
        return { success: false, error: `Barcode "${data.barcode}" sudah digunakan oleh produk "${existingBarcode.name}".` };
      }
    }

    // Check SKU duplicate
    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku.trim() },
      });
      if (existingSku && existingSku.isActive) {
        return { success: false, error: `SKU "${data.sku}" sudah digunakan oleh produk "${existingSku.name}".` };
      }
    }

    const created = await prisma.product.create({
      data: {
        sku: data.sku.trim(),
        barcode: data.barcode.trim(),
        name: data.name.trim(),
        category: data.category,
        hpp: data.hpp,
        price: data.price,
        isPromo: data.isPromo || false,
        discountType: data.discountType || 'NONE',
        discountValue: data.discountValue || 0,
        promoPrice: computedPromoPrice,
        stock: data.stock || 0,
        minStock: data.minStock || 5,
        unit: data.unit || 'Pcs',
        image: data.image || null,
        isActive: true,
      },
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        id: created.id,
        sku: created.sku,
        barcode: created.barcode,
        name: created.name,
        category: created.category,
        hpp: created.hpp,
        price: created.price,
        isPromo: created.isPromo,
        discountType: created.discountType as DiscountType,
        discountValue: created.discountValue,
        promoPrice: created.promoPrice ?? undefined,
        stock: created.stock,
        minStock: created.minStock,
        unit: created.unit,
        image: created.image ?? undefined,
        isActive: created.isActive,
      } as Product,
    };
  } catch (error: any) {
    console.error('Error in createProductAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan produk baru.' };
  }
}

export async function updateProductAction(id: string, data: Partial<Product>) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat mengubah produk.' };
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Produk tidak ditemukan di database.' };
    }

    // Check duplicate barcode if barcode is changed
    if (data.barcode && data.barcode.trim() !== existing.barcode) {
      const dupBarcode = await prisma.product.findFirst({
        where: {
          barcode: data.barcode.trim(),
          NOT: { id },
        },
      });
      if (dupBarcode) {
        return {
          success: false,
          error: `Barcode "${data.barcode.trim()}" sudah digunakan oleh produk "${dupBarcode.name}".`,
        };
      }
    }

    // Check duplicate SKU if SKU is changed
    if (data.sku && data.sku.trim() !== existing.sku) {
      const dupSku = await prisma.product.findFirst({
        where: {
          sku: data.sku.trim(),
          NOT: { id },
        },
      });
      if (dupSku) {
        return {
          success: false,
          error: `SKU "${data.sku.trim()}" sudah digunakan oleh produk "${dupSku.name}".`,
        };
      }
    }

    const currentPrice = data.price ?? existing.price ?? 0;
    const currentIsPromo = data.isPromo !== undefined ? data.isPromo : existing.isPromo;
    const currentDiscountType = data.discountType ?? (existing.discountType as DiscountType) ?? 'NONE';
    const currentDiscountValue = data.discountValue !== undefined ? data.discountValue : existing.discountValue;

    const computedPromoPrice = calculatePromoPrice(
      currentPrice,
      currentIsPromo,
      currentDiscountType,
      currentDiscountValue,
      data.promoPrice
    );

    const updated = await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku !== undefined ? data.sku.trim() : existing.sku,
        barcode: data.barcode !== undefined ? data.barcode.trim() : existing.barcode,
        name: data.name !== undefined ? data.name.trim() : existing.name,
        category: data.category !== undefined ? data.category : existing.category,
        hpp: data.hpp !== undefined ? data.hpp : existing.hpp,
        price: data.price !== undefined ? data.price : existing.price,
        isPromo: data.isPromo !== undefined ? data.isPromo : existing.isPromo,
        discountType: (data.discountType as DiscountType) || existing.discountType,
        discountValue: data.discountValue !== undefined ? data.discountValue : existing.discountValue,
        promoPrice: computedPromoPrice,
        stock: data.stock !== undefined ? data.stock : existing.stock,
        minStock: data.minStock !== undefined ? data.minStock : existing.minStock,
        unit: data.unit !== undefined ? data.unit : existing.unit,
        image: data.image !== undefined ? data.image : existing.image,
      },
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        id: updated.id,
        sku: updated.sku,
        barcode: updated.barcode,
        name: updated.name,
        category: updated.category,
        hpp: updated.hpp,
        price: updated.price,
        isPromo: updated.isPromo,
        discountType: updated.discountType as DiscountType,
        discountValue: updated.discountValue,
        promoPrice: updated.promoPrice ?? undefined,
        stock: updated.stock,
        minStock: updated.minStock,
        unit: updated.unit,
        image: updated.image ?? undefined,
      } as Product,
    };
  } catch (error: any) {
    console.error('Error in updateProductAction:', error);
    return { success: false, error: error.message || 'Gagal memperbarui data produk.' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat menghapus produk.' };
    }

    // 1. Delete transient held carts that contain this product
    await prisma.heldCartItem.deleteMany({
      where: { productId: id },
    });

    // 2. Try hard delete first (works if product has no historical sales receipts/audits)
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch {
      // 3. If referenced in historical sales transactions / stock opname audit, safely soft-delete
      await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          stock: 0,
        },
      });
    }

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin/inventory');
    safeRevalidatePath('/admin');

    return { success: true, message: 'Produk berhasil dihapus / diarsipkan.' };
  } catch (error: any) {
    console.error('Error in deleteProductAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus produk.' };
  }
}

export interface BarcodeLookupResult {
  success: boolean;
  found: boolean;
  source?: 'database' | 'openfoodfacts';
  data?: {
    name?: string;
    brand?: string;
    category?: string;
    unit?: string;
    image?: string;
    price?: number;
    hpp?: number;
    sku?: string;
  };
  message?: string;
}

export async function lookupBarcodeAction(barcode: string): Promise<BarcodeLookupResult> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode || cleanBarcode.length < 5) {
    return { success: true, found: false };
  }

  try {
    // 1. Check local database first (only active products)
    const existing = await prisma.product.findFirst({
      where: {
        barcode: cleanBarcode,
        isActive: true,
      },
    });

    if (existing) {
      return {
        success: true,
        found: true,
        source: 'database',
        data: {
          name: existing.name,
          category: existing.category,
          unit: existing.unit,
          price: existing.price,
          hpp: existing.hpp,
          sku: existing.sku,
          image: existing.image || undefined,
        },
        message: 'Produk aktif sudah terdaftar di database toko Anda.',
      };
    }

    // 2. Query Open Food Facts API with 3s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(cleanBarcode)}.json`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MiniPOS-Retail/1.0 (pos@tokoku.id)',
          Accept: 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 1 && data.product) {
        const prod = data.product;
        const brand = prod.brands ? prod.brands.split(',')[0].trim() : '';
        let productName = prod.product_name_id || prod.product_name || prod.product_name_en || '';

        if (brand && !productName.toLowerCase().includes(brand.toLowerCase())) {
          productName = `${brand} ${productName}`.trim();
        }

        // Map categories to standard POS categories
        const rawCats = (prod.categories || '').toLowerCase();
        let mappedCategory = 'Makanan';
        if (
          rawCats.includes('beverage') ||
          rawCats.includes('drink') ||
          rawCats.includes('boisson') ||
          rawCats.includes('minuman') ||
          rawCats.includes('water') ||
          rawCats.includes('tea') ||
          rawCats.includes('coffee') ||
          rawCats.includes('juice') ||
          rawCats.includes('soda')
        ) {
          mappedCategory = 'Minuman';
        } else if (
          rawCats.includes('snack') ||
          rawCats.includes('biscuit') ||
          rawCats.includes('chip') ||
          rawCats.includes('chocolate') ||
          rawCats.includes('candy') ||
          rawCats.includes('wafer') ||
          rawCats.includes('kue')
        ) {
          mappedCategory = 'Snack';
        } else if (
          rawCats.includes('oil') ||
          rawCats.includes('rice') ||
          rawCats.includes('sugar') ||
          rawCats.includes('flour') ||
          rawCats.includes('beras') ||
          rawCats.includes('minyak') ||
          rawCats.includes('sembako') ||
          rawCats.includes('telur')
        ) {
          mappedCategory = 'Sembako';
        } else if (
          rawCats.includes('soap') ||
          rawCats.includes('shampoo') ||
          rawCats.includes('care') ||
          rawCats.includes('beauty') ||
          rawCats.includes('sabun') ||
          rawCats.includes('pasta gigi')
        ) {
          mappedCategory = 'Perawatan';
        } else if (
          rawCats.includes('clean') ||
          rawCats.includes('detergent') ||
          rawCats.includes('pembersih') ||
          rawCats.includes('cuci')
        ) {
          mappedCategory = 'Pembersih';
        }

        // Infer unit
        let mappedUnit = 'Pcs';
        const qtyStr = (prod.quantity || '').toLowerCase();
        if (qtyStr.includes('ml') || qtyStr.includes('l') || mappedCategory === 'Minuman') {
          mappedUnit = 'Botol';
        } else if (qtyStr.includes('bungkus') || rawCats.includes('noodles') || rawCats.includes('instant')) {
          mappedUnit = 'Bungkus';
        } else if (qtyStr.includes('box') || qtyStr.includes('kotak')) {
          mappedUnit = 'Kotak';
        } else if (qtyStr.includes('can') || qtyStr.includes('kaleng')) {
          mappedUnit = 'Kaleng';
        }

        if (productName) {
          return {
            success: true,
            found: true,
            source: 'openfoodfacts',
            data: {
              name: productName,
              brand: brand || undefined,
              category: mappedCategory,
              unit: mappedUnit,
              image: prod.image_front_url || prod.image_url || undefined,
            },
            message: `Ditemukan dari katalog publik: ${productName}`,
          };
        }
      }
    }

    return { success: true, found: false };
  } catch {
    // Graceful fallback on network error or timeout
    return { success: true, found: false };
  }
}

export async function syncStarterCatalogAction(): Promise<{
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  message: string;
  error?: string;
}> {
  try {
    const starterProducts = [
      // 1. Minuman Siap Minum (RTD) (26 Produk)
      { sku: 'MNM-001', barcode: '899100110012', name: 'Aqua Air Mineral PET 600ml', category: 'Minuman', hpp: 2600, price: 3500, unit: 'Botol', stock: 120, minStock: 24 },
      { sku: 'MNM-002', barcode: '899100110013', name: 'Aqua Air Mineral PET 330ml', category: 'Minuman', hpp: 2000, price: 2500, unit: 'Botol', stock: 80, minStock: 20 },
      { sku: 'MNM-003', barcode: '899100110014', name: 'Aqua Air Mineral PET 1500ml', category: 'Minuman', hpp: 5200, price: 6500, unit: 'Botol', stock: 48, minStock: 12 },
      { sku: 'MNM-004', barcode: '899600160026', name: 'Le Minerale Air Mineral 600ml', category: 'Minuman', hpp: 2500, price: 3500, unit: 'Botol', stock: 100, minStock: 24 },
      { sku: 'MNM-005', barcode: '899600160027', name: 'Le Minerale Air Mineral 330ml', category: 'Minuman', hpp: 1900, price: 2500, unit: 'Botol', stock: 60, minStock: 15 },
      { sku: 'MNM-006', barcode: '899600160028', name: 'Le Minerale Air Mineral 1500ml', category: 'Minuman', hpp: 5000, price: 6500, unit: 'Botol', stock: 40, minStock: 10 },
      { sku: 'MNM-007', barcode: '899238811001', name: 'Teh Botol Sosro Kotak 250ml', category: 'Minuman', hpp: 2800, price: 3500, unit: 'Kotak', stock: 60, minStock: 12 },
      { sku: 'MNM-008', barcode: '899238811002', name: 'Teh Botol Sosro PET 450ml', category: 'Minuman', hpp: 5500, price: 7000, isPromo: true, discountType: 'NOMINAL', discountValue: 1000, promoPrice: 6000, unit: 'Botol', stock: 45, minStock: 10 },
      { sku: 'MNM-009', barcode: '899238811003', name: 'Teh Botol Sosro Kaleng 318ml', category: 'Minuman', hpp: 5800, price: 7500, unit: 'Kaleng', stock: 30, minStock: 8 },
      { sku: 'MNM-010', barcode: '899275372411', name: 'Teh Pucuk Harum 350ml', category: 'Minuman', hpp: 3000, price: 4000, unit: 'Botol', stock: 90, minStock: 18 },
      { sku: 'MNM-011', barcode: '899275372412', name: 'Teh Pucuk Harum 500ml', category: 'Minuman', hpp: 4800, price: 6000, unit: 'Botol', stock: 50, minStock: 12 },
      { sku: 'MNM-012', barcode: '899275372413', name: 'Teh Pucuk Harum Less Sugar 350ml', category: 'Minuman', hpp: 3000, price: 4000, unit: 'Botol', stock: 40, minStock: 10 },
      { sku: 'MNM-013', barcode: '899276100114', name: 'Pocari Sweat PET 500ml', category: 'Minuman', hpp: 6800, price: 8500, unit: 'Botol', stock: 40, minStock: 10 },
      { sku: 'MNM-014', barcode: '899276100115', name: 'Pocari Sweat Kaleng 330ml', category: 'Minuman', hpp: 5800, price: 7000, unit: 'Kaleng', stock: 35, minStock: 8 },
      { sku: 'MNM-015', barcode: '899276100116', name: 'Pocari Sweat Ion Water 500ml', category: 'Minuman', hpp: 6800, price: 8500, unit: 'Botol', stock: 25, minStock: 6 },
      { sku: 'MNM-016', barcode: '899275321019', name: 'Ultra Milk Cokelat 250ml', category: 'Minuman', hpp: 5200, price: 6500, isPromo: true, discountType: 'PERCENT', discountValue: 10, promoPrice: 5850, unit: 'Kotak', stock: 50, minStock: 12 },
      { sku: 'MNM-017', barcode: '899275321020', name: 'Ultra Milk Full Cream 250ml', category: 'Minuman', hpp: 5200, price: 6500, unit: 'Kotak', stock: 45, minStock: 12 },
      { sku: 'MNM-018', barcode: '899275321021', name: 'Ultra Milk Stroberi 250ml', category: 'Minuman', hpp: 5200, price: 6500, unit: 'Kotak', stock: 35, minStock: 10 },
      { sku: 'MNM-019', barcode: '899277000102', name: 'Bear Brand Susu Steril 189ml', category: 'Minuman', hpp: 9300, price: 11000, unit: 'Kaleng', stock: 40, minStock: 10 },
      { sku: 'MNM-020', barcode: '899800901023', name: 'Milo UHT Activ-Go Kotak 180ml', category: 'Minuman', hpp: 4600, price: 5800, unit: 'Kotak', stock: 45, minStock: 10 },
      { sku: 'MNM-021', barcode: '899800901024', name: 'Nescafe Kaleng Original 240ml', category: 'Minuman', hpp: 8200, price: 10000, unit: 'Kaleng', stock: 30, minStock: 8 },
      { sku: 'MNM-022', barcode: '899277912001', name: 'Hydro Coco Original 250ml', category: 'Minuman', hpp: 6200, price: 7500, unit: 'Kotak', stock: 35, minStock: 8 },
      { sku: 'MNM-023', barcode: '899800110012', name: 'You C1000 Vitamin Lemon 140ml', category: 'Minuman', hpp: 6800, price: 8000, unit: 'Botol', stock: 35, minStock: 8 },
      { sku: 'MNM-024', barcode: '899800110013', name: 'You C1000 Vitamin Orange 140ml', category: 'Minuman', hpp: 6800, price: 8000, unit: 'Botol', stock: 35, minStock: 8 },
      { sku: 'MNM-025', barcode: '899275373001', name: 'Floridina Orange PET 350ml', category: 'Minuman', hpp: 2800, price: 3500, unit: 'Botol', stock: 60, minStock: 12 },
      { sku: 'MNM-026', barcode: '899999902145', name: 'Buavita Guava Juice Kotak 245ml', category: 'Minuman', hpp: 6800, price: 8500, unit: 'Kotak', stock: 30, minStock: 8 },

      // 2. Kopi & Teh Seduh (11 Produk)
      { sku: 'KOP-001', barcode: '899275389012', name: 'Kopi Kapal Api Spesial Mix 10x24g', category: 'Minuman', hpp: 12000, price: 15000, unit: 'Renceng', stock: 30, minStock: 6 },
      { sku: 'KOP-002', barcode: '899275389013', name: 'Kopi Kapal Api Mantap Kopi Susu 10x25g', category: 'Minuman', hpp: 11500, price: 14500, unit: 'Renceng', stock: 25, minStock: 5 },
      { sku: 'KOP-003', barcode: '899275389014', name: 'Kopi Kapal Api Tanpa Gula 65g', category: 'Minuman', hpp: 5500, price: 7000, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'KOP-004', barcode: '899317553744', name: 'Luwak White Koffie Original 10x20g', category: 'Minuman', hpp: 12500, price: 15500, unit: 'Renceng', stock: 25, minStock: 5 },
      { sku: 'KOP-005', barcode: '899275390123', name: 'Good Day Cappuccino 10x25g', category: 'Minuman', hpp: 15000, price: 18500, unit: 'Renceng', stock: 25, minStock: 5 },
      { sku: 'KOP-006', barcode: '899275390124', name: 'Good Day Moccacino 10x20g', category: 'Minuman', hpp: 12000, price: 15000, unit: 'Renceng', stock: 25, minStock: 5 },
      { sku: 'KOP-007', barcode: '899275389101', name: 'Kopi ABC Susu 10x31g', category: 'Minuman', hpp: 12000, price: 15000, unit: 'Renceng', stock: 30, minStock: 6 },
      { sku: 'KOP-008', barcode: '899600140022', name: 'Torabika Cappuccino 10x25g', category: 'Minuman', hpp: 15500, price: 19000, unit: 'Renceng', stock: 20, minStock: 5 },
      { sku: 'TEH-001', barcode: '899999901412', name: 'Teh Celup SariWangi Asli 25 Kantong', category: 'Minuman', hpp: 6200, price: 7500, unit: 'Kotak', stock: 40, minStock: 8 },
      { sku: 'TEH-002', barcode: '899999901413', name: 'Teh Celup SariWangi Asli 50 Kantong', category: 'Minuman', hpp: 11500, price: 14000, unit: 'Kotak', stock: 25, minStock: 5 },
      { sku: 'TEH-003', barcode: '899300110022', name: 'Teh Celup Tong Tji Jasmine 25 Kantong', category: 'Minuman', hpp: 8500, price: 10500, unit: 'Kotak', stock: 25, minStock: 5 },

      // 3. Makanan Instan & Bumbu (22 Produk)
      { sku: 'MKN-001', barcode: '899886620001', name: 'Indomie Goreng Spesial 85g', category: 'Makanan', hpp: 2900, price: 3500, unit: 'Bungkus', stock: 150, minStock: 30 },
      { sku: 'MKN-002', barcode: '899886620002', name: 'Indomie Kuah Ayam Bawang 75g', category: 'Makanan', hpp: 2800, price: 3500, unit: 'Bungkus', stock: 100, minStock: 24 },
      { sku: 'MKN-003', barcode: '899886620003', name: 'Indomie Kuah Soto Mie 70g', category: 'Makanan', hpp: 2800, price: 3500, unit: 'Bungkus', stock: 90, minStock: 20 },
      { sku: 'MKN-004', barcode: '899886620004', name: 'Indomie Kuah Kari Ayam 72g', category: 'Makanan', hpp: 2900, price: 3600, unit: 'Bungkus', stock: 85, minStock: 20 },
      { sku: 'MKN-005', barcode: '899886620005', name: 'Indomie Goreng Rendang 91g', category: 'Makanan', hpp: 2900, price: 3500, unit: 'Bungkus', stock: 70, minStock: 15 },
      { sku: 'MKN-006', barcode: '899886620006', name: 'Indomie Goreng Ayam Geprek 85g', category: 'Makanan', hpp: 2900, price: 3500, unit: 'Bungkus', stock: 60, minStock: 15 },
      { sku: 'MKN-007', barcode: '899886620007', name: 'Indomie Goreng Aceh 90g', category: 'Makanan', hpp: 2900, price: 3500, unit: 'Bungkus', stock: 50, minStock: 12 },
      { sku: 'MKN-008', barcode: '899886620008', name: 'Mie Sedaap Goreng 90g', category: 'Makanan', hpp: 2900, price: 3500, unit: 'Bungkus', stock: 80, minStock: 20 },
      { sku: 'MKN-009', barcode: '899886620009', name: 'Mie Sedaap Korean Spicy Chicken 87g', category: 'Makanan', hpp: 3000, price: 3800, unit: 'Bungkus', stock: 60, minStock: 15 },
      { sku: 'MKN-010', barcode: '899886620010', name: 'Mie Sedaap Kuah Soto Madura 75g', category: 'Makanan', hpp: 2800, price: 3500, unit: 'Bungkus', stock: 70, minStock: 15 },
      { sku: 'MKN-011', barcode: '899886630012', name: 'Pop Mie Rasa Ayam Bawang 75g', category: 'Makanan', hpp: 4500, price: 5500, unit: 'Cup', stock: 50, minStock: 12 },
      { sku: 'MKN-012', barcode: '899886630013', name: 'Pop Mie Goreng Pedes Dower 75g', category: 'Makanan', hpp: 4800, price: 6000, unit: 'Cup', stock: 40, minStock: 10 },
      { sku: 'MKN-013', barcode: '899300520019', name: 'Sari Roti Tawar Spesial', category: 'Makanan', hpp: 12500, price: 15000, unit: 'Bungkus', stock: 15, minStock: 5 },
      { sku: 'MKN-014', barcode: '899300520020', name: 'Sari Roti Sandwich Cokelat', category: 'Makanan', hpp: 4800, price: 6000, unit: 'Bungkus', stock: 20, minStock: 5 },
      { sku: 'MKN-015', barcode: '899100220011', name: 'Sarden ABC Saus Tomat 155g', category: 'Makanan', hpp: 9500, price: 12000, unit: 'Kaleng', stock: 30, minStock: 6 },
      { sku: 'MKN-016', barcode: '899100220012', name: 'Saus Sambal ABC Asli Botol 275ml', category: 'Makanan', hpp: 12500, price: 15500, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'MKN-017', barcode: '899999903112', name: 'Kecap Manis Bango Pouch 520ml', category: 'Makanan', hpp: 22000, price: 26000, unit: 'Pouch', stock: 30, minStock: 6 },
      { sku: 'MKN-018', barcode: '899999903113', name: 'Kecap Manis Bango Botol 135ml', category: 'Makanan', hpp: 8000, price: 10000, unit: 'Botol', stock: 30, minStock: 6 },
      { sku: 'MKN-019', barcode: '899274110012', name: 'Masako Bumbu Kaldu Rasa Sapi 100g', category: 'Makanan', hpp: 4500, price: 5500, unit: 'Bungkus', stock: 40, minStock: 8 },
      { sku: 'MKN-020', barcode: '899999904123', name: 'Royco Bumbu Pelezat Rasa Ayam 100g', category: 'Makanan', hpp: 4500, price: 5500, unit: 'Bungkus', stock: 40, minStock: 8 },
      { sku: 'MKN-021', barcode: '899274211001', name: 'Sasa Tepung Bumbu Serbaguna 200g', category: 'Makanan', hpp: 5500, price: 7000, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'MKN-022', barcode: '899883511002', name: 'Santan Kelapa Siap Pakai Kara 65ml', category: 'Makanan', hpp: 3200, price: 4000, unit: 'Kotak', stock: 50, minStock: 12 },

      // 4. Snack, Biskuit & Coklat (18 Produk)
      { sku: 'SNK-001', barcode: '899100210045', name: 'Chitato Sapi Panggang 68g', category: 'Snack', hpp: 9200, price: 11500, isPromo: true, discountType: 'NOMINAL', discountValue: 1500, promoPrice: 10000, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'SNK-002', barcode: '899100210046', name: 'Chitato Ayam Bumbu 68g', category: 'Snack', hpp: 9200, price: 11500, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'SNK-003', barcode: '899100210050', name: 'Qtela Keripik Singkong Balado 185g', category: 'Snack', hpp: 13500, price: 16500, unit: 'Bungkus', stock: 25, minStock: 5 },
      { sku: 'SNK-004', barcode: '899100234012', name: 'Taro Net Seaweed 65g', category: 'Snack', hpp: 4500, price: 6000, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'SNK-005', barcode: '899100234013', name: 'Chiki Ball Rasa Keju 55g', category: 'Snack', hpp: 4500, price: 5800, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'SNK-006', barcode: '899600130022', name: 'Oreo Vanilla Cream 133g', category: 'Snack', hpp: 8000, price: 10000, unit: 'Bungkus', stock: 40, minStock: 8 },
      { sku: 'SNK-007', barcode: '899600130023', name: 'Oreo Red Velvet 133g', category: 'Snack', hpp: 8500, price: 10500, unit: 'Bungkus', stock: 25, minStock: 5 },
      { sku: 'SNK-008', barcode: '899600140101', name: 'Roma Biskuit Kelapa 300g', category: 'Snack', hpp: 10000, price: 12500, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'SNK-009', barcode: '899600140102', name: 'Roma Malkist Abon 135g', category: 'Snack', hpp: 6500, price: 8000, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'SNK-010', barcode: '899600140103', name: 'Roma Sari Gandum 115g', category: 'Snack', hpp: 6500, price: 8000, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'SNK-011', barcode: '899111822005', name: 'SilverQueen Cashew 62g', category: 'Snack', hpp: 13500, price: 16500, isPromo: true, discountType: 'NOMINAL', discountValue: 2000, promoPrice: 14500, unit: 'Batang', stock: 30, minStock: 6 },
      { sku: 'SNK-012', barcode: '899111822006', name: 'SilverQueen Almond 62g', category: 'Snack', hpp: 13500, price: 16500, unit: 'Batang', stock: 25, minStock: 5 },
      { sku: 'SNK-013', barcode: '899600141011', name: 'Beng Beng Cokelat Wafer 20g', category: 'Snack', hpp: 2000, price: 2500, unit: 'Bungkus', stock: 80, minStock: 15 },
      { sku: 'SNK-014', barcode: '899600141012', name: 'Beng Beng Maxx 32g', category: 'Snack', hpp: 3200, price: 4000, unit: 'Bungkus', stock: 45, minStock: 10 },
      { sku: 'SNK-015', barcode: '899800911022', name: 'KitKat 4 Finger Chocolate 35g', category: 'Snack', hpp: 8000, price: 10000, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'SNK-016', barcode: '899111812001', name: 'Cadbury Dairy Milk Chocolate 62g', category: 'Snack', hpp: 13000, price: 16000, unit: 'Batang', stock: 25, minStock: 5 },
      { sku: 'SNK-017', barcode: '899277211001', name: 'Pocky Chocolate Biscuit Stick 45g', category: 'Snack', hpp: 7200, price: 9000, unit: 'Kotak', stock: 30, minStock: 6 },
      { sku: 'SNK-018', barcode: '899600142001', name: 'Permen Kopiko Coffee Candy 150g', category: 'Snack', hpp: 7500, price: 9500, unit: 'Bungkus', stock: 30, minStock: 6 },

      // 5. Sembako & Dapur Pokok (12 Produk)
      { sku: 'SBK-001', barcode: '899455122001', name: 'Beras Setra Ramos Super 5kg', category: 'Sembako', hpp: 64000, price: 72500, unit: 'Sak', stock: 20, minStock: 5 },
      { sku: 'SBK-002', barcode: '899455122002', name: 'Beras Sania Premium 5kg', category: 'Sembako', hpp: 65000, price: 74000, unit: 'Sak', stock: 15, minStock: 4 },
      { sku: 'SBK-003', barcode: '899277511002', name: 'Minyak Goreng Bimoli Klasik 2L', category: 'Sembako', hpp: 33000, price: 38500, isPromo: true, discountType: 'NOMINAL', discountValue: 2500, promoPrice: 36000, unit: 'Pouch', stock: 30, minStock: 6 },
      { sku: 'SBK-004', barcode: '899277511003', name: 'Minyak Goreng Sania 2L', category: 'Sembako', hpp: 32500, price: 37500, unit: 'Pouch', stock: 25, minStock: 5 },
      { sku: 'SBK-005', barcode: '899277511004', name: 'Minyak Goreng Tropical 2L', category: 'Sembako', hpp: 33500, price: 39000, unit: 'Botol', stock: 20, minStock: 5 },
      { sku: 'SBK-006', barcode: '899332144002', name: 'Gula Pasir Gulaku Tebu 1kg', category: 'Sembako', hpp: 14800, price: 17500, unit: 'Bungkus', stock: 40, minStock: 8 },
      { sku: 'SBK-007', barcode: '899332144003', name: 'Gula Pasir Rose Brand 1kg', category: 'Sembako', hpp: 14500, price: 17000, unit: 'Bungkus', stock: 35, minStock: 8 },
      { sku: 'SBK-008', barcode: '899274511002', name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Sembako', hpp: 11000, price: 13500, unit: 'Bungkus', stock: 30, minStock: 6 },
      { sku: 'SBK-009', barcode: '899274511003', name: 'Tepung Terigu Kunci Biru 1kg', category: 'Sembako', hpp: 11000, price: 13500, unit: 'Bungkus', stock: 25, minStock: 5 },
      { sku: 'SBK-010', barcode: '899333111001', name: 'Garam Dapur Beryodium Cap Kapal 250g', category: 'Sembako', hpp: 2500, price: 3500, unit: 'Bungkus', stock: 50, minStock: 10 },
      { sku: 'SBK-011', barcode: '899999011003', name: 'Telur Ayam Negeri Segar 1kg', category: 'Sembako', hpp: 26500, price: 30000, unit: 'Kg', stock: 25, minStock: 5 },
      { sku: 'SBK-012', barcode: '899999905101', name: 'Margarin Serbaguna Blue Band 200g', category: 'Sembako', hpp: 8500, price: 10500, unit: 'Sachet', stock: 35, minStock: 8 },

      // 6. Kebutuhan Rumah & Pembersih (12 Produk)
      { sku: 'KBR-001', barcode: '899999900121', name: 'Sunlight Jeruk Nipis 700ml', category: 'Kebutuhan Rumah', hpp: 13000, price: 16000, unit: 'Pouch', stock: 35, minStock: 8 },
      { sku: 'KBR-002', barcode: '899999900122', name: 'Mama Lemon Jeruk Nipis 680ml', category: 'Kebutuhan Rumah', hpp: 11500, price: 14000, unit: 'Pouch', stock: 30, minStock: 6 },
      { sku: 'KBR-003', barcode: '899999900234', name: 'Rinso Molto Detergen Bubuk 770g', category: 'Kebutuhan Rumah', hpp: 19500, price: 24000, isPromo: true, discountType: 'NOMINAL', discountValue: 2500, promoPrice: 21500, unit: 'Bungkus', stock: 25, minStock: 6 },
      { sku: 'KBR-004', barcode: '899999900235', name: 'Rinso Cair Micellar Soft 700ml', category: 'Kebutuhan Rumah', hpp: 18000, price: 22500, unit: 'Pouch', stock: 25, minStock: 6 },
      { sku: 'KBR-005', barcode: '899886650011', name: 'So Klin Liquid Perfume Collection 720ml', category: 'Kebutuhan Rumah', hpp: 16500, price: 20500, unit: 'Pouch', stock: 25, minStock: 5 },
      { sku: 'KBR-006', barcode: '899999900240', name: 'Downy Pelembut Pakaian Mystique 650ml', category: 'Kebutuhan Rumah', hpp: 24000, price: 29500, unit: 'Pouch', stock: 20, minStock: 5 },
      { sku: 'KBR-007', barcode: '899999900250', name: 'SuperPell Pembersih Lantai Apple 770ml', category: 'Kebutuhan Rumah', hpp: 12000, price: 15000, unit: 'Pouch', stock: 25, minStock: 5 },
      { sku: 'KBR-008', barcode: '899999900255', name: 'Wipol Karbol Wangi Cemara 750ml', category: 'Kebutuhan Rumah', hpp: 15000, price: 18500, unit: 'Pouch', stock: 20, minStock: 5 },
      { sku: 'KBR-009', barcode: '899999900345', name: 'Baygon Aerosol Lavender 600ml', category: 'Kebutuhan Rumah', hpp: 32000, price: 38000, unit: 'Kaleng', stock: 20, minStock: 5 },
      { sku: 'KBR-010', barcode: '899886650020', name: 'Hit Aerosol Anti Nyamuk Lily 600ml', category: 'Kebutuhan Rumah', hpp: 31000, price: 37000, unit: 'Kaleng', stock: 20, minStock: 5 },
      { sku: 'KBR-011', barcode: '899277011002', name: 'Stella Air Freshener Aerosol Orange 400ml', category: 'Kebutuhan Rumah', hpp: 18000, price: 22000, unit: 'Kaleng', stock: 20, minStock: 5 },
      { sku: 'KBR-012', barcode: '899300511001', name: 'Tisu Wajah Paseo Elegant 250 Sheets', category: 'Kebutuhan Rumah', hpp: 12500, price: 15500, unit: 'Bungkus', stock: 30, minStock: 6 },

      // 7. Perawatan Diri & Higienitas (15 Produk)
      { sku: 'PRW-001', barcode: '899999966523', name: 'Lifebuoy Sabun Cair Total 10 450ml', category: 'Perawatan Diri', hpp: 20000, price: 25000, isPromo: true, discountType: 'NOMINAL', discountValue: 3000, promoPrice: 22000, unit: 'Pouch', stock: 30, minStock: 6 },
      { sku: 'PRW-002', barcode: '899999966524', name: 'Lifebuoy Sabun Batang Total 10 85g', category: 'Perawatan Diri', hpp: 3500, price: 4500, unit: 'Batang', stock: 60, minStock: 12 },
      { sku: 'PRW-003', barcode: '899999966530', name: 'Dettol Body Wash Original 410ml', category: 'Perawatan Diri', hpp: 24000, price: 29500, unit: 'Pouch', stock: 20, minStock: 5 },
      { sku: 'PRW-004', barcode: '899277055001', name: 'Biore Men Cool Oil Clear 100g', category: 'Perawatan Diri', hpp: 24500, price: 29500, unit: 'Tube', stock: 20, minStock: 5 },
      { sku: 'PRW-005', barcode: '899999977634', name: 'Sunsilk Black Shine Shampoo 160ml', category: 'Perawatan Diri', hpp: 18500, price: 22500, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'PRW-006', barcode: '899999977640', name: 'Clear Men Cool Sport Menthol 160ml', category: 'Perawatan Diri', hpp: 21000, price: 26000, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'PRW-007', barcode: '899999977650', name: 'Pantene Anti Dandruff Shampoo 160ml', category: 'Perawatan Diri', hpp: 21500, price: 26500, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'PRW-008', barcode: '899999977660', name: 'Head & Shoulders Cool Menthol 160ml', category: 'Perawatan Diri', hpp: 22000, price: 27000, unit: 'Botol', stock: 20, minStock: 5 },
      { sku: 'PRW-009', barcode: '899999955412', name: 'Pepsodent White 190g', category: 'Perawatan Diri', hpp: 11800, price: 14500, unit: 'Tube', stock: 35, minStock: 8 },
      { sku: 'PRW-010', barcode: '899999955413', name: 'Pepsodent Herbal 190g', category: 'Perawatan Diri', hpp: 15500, price: 19000, unit: 'Tube', stock: 25, minStock: 5 },
      { sku: 'PRW-011', barcode: '899886677001', name: 'Ciptadent Maxi Complete 190g', category: 'Perawatan Diri', hpp: 8500, price: 10500, unit: 'Tube', stock: 35, minStock: 8 },
      { sku: 'PRW-012', barcode: '899886677010', name: 'Sikat Gigi Formula Double Action 3s', category: 'Perawatan Diri', hpp: 11000, price: 14000, unit: 'Pack', stock: 25, minStock: 5 },
      { sku: 'PRW-013', barcode: '899999988001', name: 'Rexona Men Ice Cool Roll On 50ml', category: 'Perawatan Diri', hpp: 16500, price: 20500, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'PRW-014', barcode: '899999988002', name: 'Rexona Women Free Spirit Roll On 50ml', category: 'Perawatan Diri', hpp: 16500, price: 20500, unit: 'Botol', stock: 25, minStock: 5 },
      { sku: 'PRW-015', barcode: '899317611001', name: 'Minyak Kayu Putih Cap Lang 60ml', category: 'Perawatan Diri', hpp: 19000, price: 23500, unit: 'Botol', stock: 30, minStock: 6 },

      // 8. Obat & P3K Toko (10 Produk)
      { sku: 'OBT-001', barcode: '899883811008', name: 'Tolak Angin Cair SidoMuncul 15ml (Dus 5s)', category: 'Obat & Vitamin', hpp: 17500, price: 21000, unit: 'Pack', stock: 40, minStock: 8 },
      { sku: 'OBT-002', barcode: '899883811009', name: 'Antangin JRG Cair 15ml (Dus 5s)', category: 'Obat & Vitamin', hpp: 15000, price: 18500, unit: 'Pack', stock: 35, minStock: 6 },
      { sku: 'OBT-003', barcode: '899883822009', name: 'Panadol Extra Merah 10 Kaplet', category: 'Obat & Vitamin', hpp: 11500, price: 14000, unit: 'Blister', stock: 45, minStock: 10 },
      { sku: 'OBT-004', barcode: '899883822010', name: 'Panadol Regular Biru 10 Kaplet', category: 'Obat & Vitamin', hpp: 10500, price: 13000, unit: 'Blister', stock: 35, minStock: 8 },
      { sku: 'OBT-005', barcode: '899883833001', name: 'Paramex Obat Sakit Kepala 4 Tablet', category: 'Obat & Vitamin', hpp: 2500, price: 3500, unit: 'Strip', stock: 60, minStock: 15 },
      { sku: 'OBT-006', barcode: '899883844001', name: 'Promag Tablet Obat Sakit Maag 10s', category: 'Obat & Vitamin', hpp: 7500, price: 9500, unit: 'Blister', stock: 40, minStock: 10 },
      { sku: 'OBT-007', barcode: '899883855001', name: 'Bodrex Sakit Kepala 20 Tablet', category: 'Obat & Vitamin', hpp: 9500, price: 12000, unit: 'Blister', stock: 40, minStock: 8 },
      { sku: 'OBT-008', barcode: '899883866001', name: 'Mixagrip Flu & Batuk 4 Kaplet', category: 'Obat & Vitamin', hpp: 2800, price: 3500, unit: 'Strip', stock: 50, minStock: 12 },
      { sku: 'OBT-009', barcode: '899277088001', name: 'Hansaplast Plester Luka Kain Elastis 10s', category: 'Obat & Vitamin', hpp: 6000, price: 7500, unit: 'Pack', stock: 40, minStock: 8 },
      { sku: 'OBT-010', barcode: '899883877001', name: 'Betadine Antiseptic Solution 15ml', category: 'Obat & Vitamin', hpp: 15000, price: 18500, unit: 'Botol', stock: 25, minStock: 5 },
    ];

    let inserted = 0;
    let updated = 0;

    for (const item of starterProducts) {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ barcode: item.barcode }, { sku: item.sku }],
        },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            name: item.name,
            category: item.category,
            hpp: item.hpp,
            price: item.price,
            isPromo: item.isPromo || false,
            discountType: (item.discountType as DiscountType) || 'NONE',
            discountValue: item.discountValue || 0,
            promoPrice: item.promoPrice || null,
            unit: item.unit,
            stock: existing.stock > 0 ? existing.stock : item.stock,
            minStock: item.minStock,
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            sku: item.sku,
            barcode: item.barcode,
            name: item.name,
            category: item.category,
            hpp: item.hpp,
            price: item.price,
            isPromo: item.isPromo || false,
            discountType: (item.discountType as DiscountType) || 'NONE',
            discountValue: item.discountValue || 0,
            promoPrice: item.promoPrice || null,
            unit: item.unit,
            stock: item.stock,
            minStock: item.minStock,
            isActive: true,
          },
        });
        inserted++;
      }
    }

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin/inventory');
    safeRevalidatePath('/admin');

    return {
      success: true,
      insertedCount: inserted,
      updatedCount: updated,
      message: `Sync Berhasil: ${inserted} produk baru ditambahkan, ${updated} produk terverifikasi/diaktifkan. Total ${starterProducts.length} produk katalog ritel siap digunakan!`,
    };
  } catch (error: any) {
    console.error('Error in syncStarterCatalogAction:', error);
    return {
      success: false,
      insertedCount: 0,
      updatedCount: 0,
      message: 'Gagal melakukan sinkronisasi katalog produk ritel.',
      error: error.message,
    };
  }
}
