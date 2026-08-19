'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@/types/pos';

export async function getActiveShiftAction(
  cashierId?: string
): Promise<{ success: boolean; data: CashierShift | null; error?: string }> {
  try {
    const shift = await prisma.cashierShift.findFirst({
      where: {
        status: 'OPEN',
        ...(cashierId ? { cashierId } : {}),
      },
      orderBy: { startTime: 'desc' },
    });

    if (!shift) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: shift.id,
        cashierId: shift.cashierId,
        cashierName: shift.cashierName,
        shiftName: shift.shiftName,
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime?.toISOString(),
        startingCash: shift.startingCash,
        totalCashSales: shift.totalCashSales,
        totalQrisSales: shift.totalQrisSales,
        totalTransactions: shift.totalTransactions,
        expectedCashInDrawer: shift.expectedCashInDrawer,
        actualCashCount: shift.actualCashCount ?? undefined,
        difference: shift.difference ?? undefined,
        notes: shift.notes ?? undefined,
        status: shift.status as 'OPEN' | 'CLOSED',
      },
    };
  } catch (error: any) {
    console.error('Error in getActiveShiftAction:', error);
    return { success: false, data: null, error: error.message || 'Gagal memuat status shift.' };
  }
}

export async function getShiftHistoryAction(
  cashierId?: string
): Promise<{ success: boolean; data: CashierShift[]; error?: string }> {
  try {
    const shifts = await prisma.cashierShift.findMany({
      where: cashierId ? { cashierId } : {},
      orderBy: { startTime: 'desc' },
    });

    const formatted: CashierShift[] = shifts.map((s) => ({
      id: s.id,
      cashierId: s.cashierId,
      cashierName: s.cashierName,
      shiftName: s.shiftName,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime?.toISOString(),
      startingCash: s.startingCash,
      totalCashSales: s.totalCashSales,
      totalQrisSales: s.totalQrisSales,
      totalTransactions: s.totalTransactions,
      expectedCashInDrawer: s.expectedCashInDrawer,
      actualCashCount: s.actualCashCount ?? undefined,
      difference: s.difference ?? undefined,
      notes: s.notes ?? undefined,
      status: s.status as 'OPEN' | 'CLOSED',
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getShiftHistoryAction:', error);
    return { success: false, data: [], error: error.message || 'Gagal memuat histori shift.' };
  }
}

export async function openShiftAction(data: {
  cashierId: string;
  cashierName?: string;
  shiftName: string;
  startingCash: number;
  notes?: string;
}) {
  try {
    let cashierName = data.cashierName;
    if (!cashierName) {
      const cashier = await prisma.user.findUnique({ where: { id: data.cashierId } });
      cashierName = cashier?.name || 'Petugas Kasir';
    }

    // Check if there is already an open shift for this cashier
    const existingOpenShift = await prisma.cashierShift.findFirst({
      where: {
        cashierId: data.cashierId,
        status: 'OPEN',
      },
    });

    if (existingOpenShift) {
      return {
        success: true,
        data: {
          id: existingOpenShift.id,
          cashierId: existingOpenShift.cashierId,
          cashierName: existingOpenShift.cashierName,
          shiftName: existingOpenShift.shiftName,
          startTime: existingOpenShift.startTime.toISOString(),
          startingCash: existingOpenShift.startingCash,
          totalCashSales: existingOpenShift.totalCashSales,
          totalQrisSales: existingOpenShift.totalQrisSales,
          totalTransactions: existingOpenShift.totalTransactions,
          expectedCashInDrawer: existingOpenShift.expectedCashInDrawer,
          status: 'OPEN' as const,
        },
      };
    }

    const newShift = await prisma.cashierShift.create({
      data: {
        cashierId: data.cashierId,
        cashierName: cashierName,
        shiftName: data.shiftName,
        startTime: new Date(),
        startingCash: data.startingCash,
        totalCashSales: 0,
        totalQrisSales: 0,
        totalTransactions: 0,
        expectedCashInDrawer: data.startingCash,
        notes: data.notes || null,
        status: 'OPEN',
      },
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/cashiers');

    return {
      success: true,
      data: {
        id: newShift.id,
        cashierId: newShift.cashierId,
        cashierName: newShift.cashierName,
        shiftName: newShift.shiftName,
        startTime: newShift.startTime.toISOString(),
        startingCash: newShift.startingCash,
        totalCashSales: newShift.totalCashSales,
        totalQrisSales: newShift.totalQrisSales,
        totalTransactions: newShift.totalTransactions,
        expectedCashInDrawer: newShift.expectedCashInDrawer,
        status: 'OPEN' as const,
      },
    };
  } catch (error: any) {
    console.error('Error in openShiftAction:', error);
    return { success: false, error: error.message || 'Gagal membuka shift baru.' };
  }
}

export async function closeShiftAction(
  arg1: string | { shiftId: string; actualCashCount: number; notes?: string },
  arg2?: number,
  arg3?: string
) {
  try {
    let shiftId: string;
    let actualCashCount: number;
    let notes: string | undefined;

    if (typeof arg1 === 'object') {
      shiftId = arg1.shiftId;
      actualCashCount = arg1.actualCashCount;
      notes = arg1.notes;
    } else {
      shiftId = arg1;
      actualCashCount = arg2 ?? 0;
      notes = arg3;
    }

    const shift = await prisma.cashierShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return { success: false, error: 'Data shift tidak ditemukan.' };
    }

    const difference = actualCashCount - shift.expectedCashInDrawer;

    const closed = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: {
        endTime: new Date(),
        actualCashCount,
        difference,
        notes: notes || shift.notes,
        status: 'CLOSED',
      },
    });

    // Update cashier total completed shifts
    await prisma.user.update({
      where: { id: shift.cashierId },
      data: {
        totalShiftsCompleted: { increment: 1 },
      },
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/cashiers');
    safeRevalidatePath('/admin/reports');

    return {
      success: true,
      data: {
        id: closed.id,
        cashierId: closed.cashierId,
        cashierName: closed.cashierName,
        shiftName: closed.shiftName,
        startTime: closed.startTime.toISOString(),
        endTime: closed.endTime?.toISOString(),
        startingCash: closed.startingCash,
        totalCashSales: closed.totalCashSales,
        totalQrisSales: closed.totalQrisSales,
        totalTransactions: closed.totalTransactions,
        expectedCashInDrawer: closed.expectedCashInDrawer,
        actualCashCount: closed.actualCashCount ?? 0,
        difference: closed.difference ?? 0,
        notes: closed.notes ?? undefined,
        status: 'CLOSED' as const,
      },
    };
  } catch (error: any) {
    console.error('Error in closeShiftAction:', error);
    return { success: false, error: error.message || 'Gagal menutup shift.' };
  }
}
