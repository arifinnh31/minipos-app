'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/authGuard';
import { StoreSettings } from '@/types/pos';

export async function getStoreSettingsAction(): Promise<{
  success: boolean;
  data: StoreSettings;
  error?: string;
}> {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default-store' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default-store',
          storeName: 'TOKOKU',
          tagline: 'Minimarket Ritel & Grosir Modern Indonesia',
          address: 'Jl. Jenderal Sudirman No. 128, Jakarta Pusat',
          phone: '0812-3456-7890',
          footerNote: 'Terima kasih telah berbelanja di TOKOKU! Senang melayani Anda, semoga hari Anda menyenangkan.',
          enableTax: false,
          taxPercent: 11,
          qrisImageUrl: '/qris-demo.png',
          shift1Name: 'Shift 1 (Pagi)',
          shift1Start: '07:00',
          shift1End: '15:00',
          shift2Name: 'Shift 2 (Siang)',
          shift2Start: '15:00',
          shift2End: '23:00',
          shift3Name: 'Shift 3 (Malam)',
          shift3Start: '23:00',
          shift3End: '07:00',
          enableShift3: true,
          shift4Name: 'Shift 4 (Gerai 24 Jam)',
          shift4Start: '00:00',
          shift4End: '24:00',
          enableShift4: true,
        },
      });
    }

    const formatted: StoreSettings = {
      storeName: settings.storeName,
      tagline: settings.tagline,
      address: settings.address,
      phone: settings.phone,
      footerNote: settings.footerNote,
      enableTax: settings.enableTax,
      taxPercent: settings.taxPercent,
      qrisImageUrl: settings.qrisImageUrl,
      shiftConfig: {
        shift1Name: settings.shift1Name,
        shift1Start: settings.shift1Start,
        shift1End: settings.shift1End,
        shift2Name: settings.shift2Name,
        shift2Start: settings.shift2Start,
        shift2End: settings.shift2End,
        shift3Name: settings.shift3Name,
        shift3Start: settings.shift3Start,
        shift3End: settings.shift3End,
        enableShift3: settings.enableShift3,
        shift4Name: settings.shift4Name,
        shift4Start: settings.shift4Start,
        shift4End: settings.shift4End,
        enableShift4: settings.enableShift4,
      },
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getStoreSettingsAction:', error);
    return {
      success: false,
      data: {
        storeName: 'MINIPOS STORE',
        tagline: 'Minimarket Hemat, Cepat & Bersahabat',
        address: 'Jl. Merdeka Raya No. 45, Jakarta Selatan',
        phone: '0812-3456-7890',
        footerNote: 'Terima kasih atas kunjungan Anda!',
        enableTax: true,
        taxPercent: 11,
        qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MINIPOS',
      },
      error: error.message || 'Gagal memuat pengaturan toko.',
    };
  }
}

export async function updateStoreSettingsAction(data: StoreSettings) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Akses ditolak: Hanya admin yang dapat mengubah pengaturan toko.' };
    }

    const shiftCfg = data.shiftConfig;

    await prisma.storeSettings.upsert({
      where: { id: 'default-store' },
      create: {
        id: 'default-store',
        storeName: data.storeName,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        footerNote: data.footerNote,
        enableTax: data.enableTax,
        taxPercent: data.taxPercent,
        qrisImageUrl: data.qrisImageUrl,
        shift1Name: shiftCfg?.shift1Name || 'Shift 1 (Pagi)',
        shift1Start: shiftCfg?.shift1Start || '07:00',
        shift1End: shiftCfg?.shift1End || '15:00',
        shift2Name: shiftCfg?.shift2Name || 'Shift 2 (Siang)',
        shift2Start: shiftCfg?.shift2Start || '15:00',
        shift2End: shiftCfg?.shift2End || '23:00',
        shift3Name: shiftCfg?.shift3Name || 'Shift 3 (Malam)',
        shift3Start: shiftCfg?.shift3Start || '23:00',
        shift3End: shiftCfg?.shift3End || '07:00',
        enableShift3: shiftCfg?.enableShift3 ?? true,
        shift4Name: shiftCfg?.shift4Name || 'Shift 4 (Gerai 24 Jam)',
        shift4Start: shiftCfg?.shift4Start || '00:00',
        shift4End: shiftCfg?.shift4End || '24:00',
        enableShift4: shiftCfg?.enableShift4 ?? true,
      },
      update: {
        storeName: data.storeName,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        footerNote: data.footerNote,
        enableTax: data.enableTax,
        taxPercent: data.taxPercent,
        qrisImageUrl: data.qrisImageUrl,
        shift1Name: shiftCfg?.shift1Name,
        shift1Start: shiftCfg?.shift1Start,
        shift1End: shiftCfg?.shift1End,
        shift2Name: shiftCfg?.shift2Name,
        shift2Start: shiftCfg?.shift2Start,
        shift2End: shiftCfg?.shift2End,
        shift3Name: shiftCfg?.shift3Name,
        shift3Start: shiftCfg?.shift3Start,
        shift3End: shiftCfg?.shift3End,
        enableShift3: shiftCfg?.enableShift3,
        shift4Name: shiftCfg?.shift4Name,
        shift4Start: shiftCfg?.shift4Start,
        shift4End: shiftCfg?.shift4End,
        enableShift4: shiftCfg?.enableShift4,
      },
    });

    safeRevalidatePath('/');
    safeRevalidatePath('/admin/settings');

    return { success: true, message: 'Pengaturan toko & 4 shift berhasil disimpan!' };
  } catch (error: any) {
    console.error('Error in updateStoreSettingsAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan pengaturan toko.' };
  }
}
