'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function adminLoginAction(formData: { email: string; password: string }) {
  try {
    const { email, password } = formData;
    let cookieStore: any = null;
    try {
      cookieStore = await cookies();
    } catch {}

    // 1. Try Supabase Auth if credentials configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const supabase = await createClient();
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.user) {
          const dbUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' }, isActive: true },
          });

          const adminProfile = {
            id: dbUser?.id || data.user.id,
            name: dbUser?.name || 'Administrator',
            email: email,
            role: 'ADMIN' as const,
          };

          if (cookieStore) {
            cookieStore.set('minipos_admin_session', JSON.stringify(adminProfile), {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          }
          return { success: true, message: 'Login admin berhasil.', user: adminProfile };
        }
      } catch (sbErr) {
        console.warn('Supabase Auth error, falling back to database check:', sbErr);
      }
    }

    // 2. Database User check
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (!user || user.password !== password) {
      return { success: false, error: 'Email atau kata sandi admin tidak cocok.' };
    }

    const adminProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (cookieStore) {
      cookieStore.set(
        'minipos_admin_session',
        JSON.stringify(adminProfile),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        }
      );
    }

    return {
      success: true,
      user: adminProfile,
    };
  } catch (error: any) {
    console.error('Error in adminLoginAction:', error);
    return { success: false, error: error.message || 'Gagal melakukan login admin.' };
  }
}

export async function getCurrentAdminAction(): Promise<{
  success: boolean;
  admin: { id?: string; name: string; email?: string; role?: string } | null;
}> {
  try {
    let cookieStore: any = null;
    try {
      cookieStore = await cookies();
    } catch {}

    if (cookieStore) {
      const sessionCookie = cookieStore.get('minipos_admin_session');
      if (sessionCookie?.value) {
        try {
          const parsed = JSON.parse(sessionCookie.value);
          if (parsed.name && parsed.role === 'ADMIN') {
            return { success: true, admin: parsed };
          }
        } catch {}
      }
    }

    return { success: true, admin: null };
  } catch {
    return { success: false, admin: null };
  }
}

export async function adminLogoutAction() {
  try {
    try {
      const cookieStore = await cookies();
      cookieStore.delete('minipos_admin_session');
    } catch {}

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const supabase = await createClient();
        await supabase.auth.signOut();
      } catch {}
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in adminLogoutAction:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyCashierPinAction(cashierId: string, pin: string) {
  try {
    const cashier = await prisma.user.findUnique({
      where: { id: cashierId },
    });

    if (!cashier) {
      return { success: false, error: 'Data kasir tidak ditemukan di sistem.' };
    }

    if (!cashier.isActive) {
      return { success: false, error: 'Akun kasir ini sedang dinonaktifkan oleh Admin.' };
    }

    if (cashier.pin !== pin) {
      return { success: false, error: 'PIN yang dimasukkan salah.' };
    }

    return {
      success: true,
      cashier: {
        id: cashier.id,
        name: cashier.name,
        role: cashier.role,
        phone: cashier.phone,
        totalShiftsCompleted: cashier.totalShiftsCompleted,
        totalSalesVolume: cashier.totalSalesVolume,
      },
    };
  } catch (error: any) {
    console.error('Error in verifyCashierPinAction:', error);
    return { success: false, error: error.message || 'Gagal memverifikasi PIN kasir.' };
  }
}

export async function changeCashierPinAction(
  cashierId: string,
  oldPin: string,
  newPin: string
) {
  try {
    const cashier = await prisma.user.findUnique({
      where: { id: cashierId },
    });

    if (!cashier) {
      return { success: false, error: 'Data kasir tidak ditemukan.' };
    }

    if (cashier.pin !== oldPin) {
      return { success: false, error: 'PIN lama tidak cocok.' };
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return { success: false, error: 'PIN baru harus berupa 4 digit angka.' };
    }

    await prisma.user.update({
      where: { id: cashierId },
      data: { pin: newPin },
    });

    return { success: true, message: 'PIN kasir berhasil diperbarui!' };
  } catch (error: any) {
    console.error('Error in changeCashierPinAction:', error);
    return { success: false, error: error.message || 'Gagal mengubah PIN kasir.' };
  }
}
