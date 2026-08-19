'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';
import { StoreSettings, ShiftTimingConfig } from '@/types/pos';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { StoreProfileSection } from './StoreProfileSection';
import { StoreShiftConfigSection } from './StoreShiftConfigSection';
import { StoreReceiptSection } from './StoreReceiptSection';
import { StoreQrisSection } from './StoreQrisSection';

import { updateStoreSettingsAction } from '@/actions/settings';

interface StoreSettingsViewProps {
  initialSettings: StoreSettings;
}

const defaultShiftConfig: ShiftTimingConfig = {
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
};

export function StoreSettingsView({ initialSettings }: StoreSettingsViewProps) {
  const [formData, setFormData] = useState<StoreSettings>({
    ...initialSettings,
    shiftConfig: initialSettings.shiftConfig || defaultShiftConfig,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description: string,
    variant: 'success' | 'warning' | 'danger' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        ...initialSettings,
        shiftConfig: initialSettings.shiftConfig || defaultShiftConfig,
      });
    }
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateStoreSettingsAction(formData);
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      addToast('Pengaturan Disimpan', 'Identitas gerai dan master shift telah diperbarui di database.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      addToast('Gagal Menyimpan', res.error || 'Terjadi kesalahan.', 'danger');
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShiftConfigChange = (field: keyof ShiftTimingConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      shiftConfig: {
        ...(prev.shiftConfig || defaultShiftConfig),
        [field]: value,
      },
    }));
  };

  const shiftConfig = formData.shiftConfig || defaultShiftConfig;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <PageHeader
        title="Pengaturan Toko & Jam Shift Kasir"
        description="Atur identitas gerai minimarket, format cetak e-struk pelanggan, jadwal shift kerja, dan QRIS."
      />

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in duration-150">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Pengaturan Berhasil Disimpan ke Database!</h4>
            <p className="text-xs text-emerald-700">
              Header struk, jadwal shift otomatis, dan identitas gerai kasir telah diperbarui.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Gerai */}
        <StoreProfileSection
          storeName={formData.storeName}
          tagline={formData.tagline}
          address={formData.address}
          phone={formData.phone}
          onChange={handleProfileChange}
        />

        {/* Section 2: Master Jam Shift */}
        <StoreShiftConfigSection
          shiftConfig={shiftConfig}
          onChange={handleShiftConfigChange}
        />

        {/* Section 3: E-Struk & Pajak */}
        <StoreReceiptSection
          footerNote={formData.footerNote}
          enableTax={formData.enableTax}
          onFooterNoteChange={(val) => setFormData((prev) => ({ ...prev, footerNote: val }))}
          onEnableTaxChange={(val) => setFormData((prev) => ({ ...prev, enableTax: val }))}
        />

        {/* Section 4: QRIS */}
        <StoreQrisSection
          qrisImageUrl={formData.qrisImageUrl}
          onChange={(val) => setFormData((prev) => ({ ...prev, qrisImageUrl: val }))}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-md shadow-blue-500/20"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Menyimpan ke DB...' : 'Simpan Seluruh Pengaturan'}</span>
          </Button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
