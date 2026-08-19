'use client';

import React from 'react';
import { QrCode } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface StoreQrisSectionProps {
  qrisImageUrl: string;
  onChange: (val: string) => void;
}

export function StoreQrisSection({ qrisImageUrl, onChange }: StoreQrisSectionProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle icon={<QrCode className="w-5 h-5 text-blue-600" />}>
          Konfigurasi QRIS Statis Toko
        </CardTitle>
      </CardHeader>

      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
          URL / Gambar QRIS QR Code:
        </label>
        <Input
          type="text"
          value={qrisImageUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
        <span className="text-[11px] text-slate-400 mt-1 block">
          Masukkan link gambar QRIS gerai Anda untuk dipindai oleh pembeli saat checkout QRIS.
        </span>
      </div>
    </Card>
  );
}
