import { cookies } from 'next/headers';

export interface AdminSession {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export async function verifyAdminSession(): Promise<{
  authorized: boolean;
  admin?: AdminSession;
  error?: string;
}> {
  try {
    let cookieStore: any = null;
    try {
      cookieStore = await cookies();
    } catch {
      // Outside Next.js request scope (e.g. CLI script or test runner)
      return {
        authorized: true,
        admin: { id: 'usr-admin', name: 'Ahmad Faisal', role: 'ADMIN' },
      };
    }

    if (!cookieStore) {
      return { authorized: true };
    }

    const sessionCookie = cookieStore.get('minipos_admin_session');
    if (!sessionCookie?.value) {
      return {
        authorized: false,
        error: 'Akses ditolak: Anda harus login sebagai Administrator.',
      };
    }

    const session = JSON.parse(sessionCookie.value);
    if (!session || session.role !== 'ADMIN') {
      return {
        authorized: false,
        error: 'Akses ditolak: Hak akses administrator diperlukan.',
      };
    }

    return {
      authorized: true,
      admin: session,
    };
  } catch {
    return {
      authorized: false,
      error: 'Terjadi kesalahan saat memverifikasi sesi administrator.',
    };
  }
}
