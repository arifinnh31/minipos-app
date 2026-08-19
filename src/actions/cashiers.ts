'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/authGuard';
import { CashierUser, CashierRole } from '@/types/pos';

export async function getCashiersAction(): Promise<{
  success: boolean;
  data: CashierUser[];
  error?: string;
}> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Dynamically aggregate sales volume and shifts for each user from real records
    const [txSumsById, txSumsByName, shiftCounts] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['cashierId'],
        _sum: { total: true },
        where: { cashierId: { not: null } },
      }),
      prisma.transaction.groupBy({
        by: ['cashierName'],
        _sum: { total: true },
      }),
      prisma.cashierShift.groupBy({
        by: ['cashierId'],
        _count: { id: true },
        where: { status: 'CLOSED' },
      }),
    ]);

    const txSumByIdMap = new Map(txSumsById.map((t) => [t.cashierId, t._sum.total || 0]));
    const txSumByNameMap = new Map(txSumsByName.map((t) => [t.cashierName, t._sum.total || 0]));
    const shiftCountMap = new Map(shiftCounts.map((s) => [s.cashierId, s._count.id || 0]));

    const formatted: CashierUser[] = users.map((u) => {
      const dynamicVolume = txSumByIdMap.get(u.id) || txSumByNameMap.get(u.name) || 0;
      const dynamicShifts = shiftCountMap.get(u.id) || 0;

      // Use max of historical baseline seed or live aggregated transactions
      const effectiveSalesVolume = Math.max(u.totalSalesVolume || 0, dynamicVolume);
      const effectiveShiftsCompleted = Math.max(u.totalShiftsCompleted || 0, dynamicShifts);

      return {
        id: u.id,
        name: u.name,
        role: u.role as CashierRole,
        pin: u.pin,
        email: u.email ?? undefined,
        phone: u.phone ?? undefined,
        isActive: u.isActive,
        totalShiftsCompleted: effectiveShiftsCompleted,
        totalSalesVolume: effectiveSalesVolume,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getCashiersAction:', error);
    return { success: false, data: [], error: error.message || 'Gagal memuat data staf kasir.' };
  }
}

export async function createCashierAction(data: {
  name: string;
  role: CashierRole;
  pin: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat menambah kasir.' };
    }

    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return { success: false, error: 'Email sudah terdaftar untuk pengguna lain.' };
      }
    }

    const created = await prisma.user.create({
      data: {
        name: data.name,
        role: data.role === 'ADMIN' ? 'ADMIN' : 'CASHIER',
        pin: data.pin,
        email: data.email || null,
        phone: data.phone || null,
        password: data.password || null,
        isActive: true,
        totalShiftsCompleted: 0,
        totalSalesVolume: 0,
      },
    });

    safeRevalidatePath('/admin/cashiers');
    safeRevalidatePath('/');

    const formatted: CashierUser = {
      id: created.id,
      name: created.name,
      role: created.role as CashierRole,
      pin: created.pin,
      email: created.email ?? undefined,
      phone: created.phone ?? undefined,
      isActive: created.isActive,
      totalShiftsCompleted: created.totalShiftsCompleted,
      totalSalesVolume: created.totalSalesVolume,
      createdAt: created.createdAt.toISOString(),
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in createCashierAction:', error);
    return { success: false, error: error.message || 'Gagal menambahkan staf kasir baru.' };
  }
}

export async function updateCashierAction(
  id: string,
  data: Partial<Omit<CashierUser, 'id' | 'createdAt'>>
) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat mengubah data kasir.' };
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role ? (data.role === 'ADMIN' ? 'ADMIN' : 'CASHIER') : undefined,
        pin: data.pin && data.pin.trim().length === 4 ? data.pin.trim() : undefined,
        email: data.email !== undefined ? data.email : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    safeRevalidatePath('/admin/cashiers');
    safeRevalidatePath('/');

    const formatted: CashierUser = {
      id: updated.id,
      name: updated.name,
      role: updated.role as CashierRole,
      pin: updated.pin,
      email: updated.email ?? undefined,
      phone: updated.phone ?? undefined,
      isActive: updated.isActive,
      totalShiftsCompleted: updated.totalShiftsCompleted,
      totalSalesVolume: updated.totalSalesVolume,
      createdAt: updated.createdAt.toISOString(),
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in updateCashierAction:', error);
    return { success: false, error: error.message || 'Gagal memperbarui data kasir.' };
  }
}

export async function deleteCashierAction(id: string) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat menghapus kasir.' };
    }

    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch {
      // If cashier has historical shifts/transactions, soft-delete by deactivating
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    }

    safeRevalidatePath('/admin/cashiers');
    safeRevalidatePath('/');

    return { success: true, message: 'Kasir berhasil dihapus/dinonaktifkan.' };
  } catch (error: any) {
    console.error('Error in deleteCashierAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus kasir.' };
  }
}
