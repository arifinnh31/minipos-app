'use client';

import React from 'react';
import { Store } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface StoreProfileSectionProps {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  onChange: (field: string, value: string) => void;
}

export function StoreProfileSection({
  storeName,
  tagline,
  address,
  phone,
  onChange,
}: StoreProfileSectionProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle icon={<Store className="w-5 h-5 text-blue-600" />}>
          Profil Gerai &amp; Minimarket
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Nama Toko / Minimarket:
          </label>
          <Input
            type="text"
            value={storeName}
            onChange={(e) => onChange('storeName', e.target.value)}
            placeholder="Contoh: Toko Sejahtera / Minimarket Utama"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Slogan / Tagline:
          </label>
          <Input
            type="text"
            value={tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
            placeholder="Contoh: Hemat, Cepat & Bersahabat"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Alamat Lengkap Gerai:
          </label>
          <Input
            type="text"
            value={address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Contoh: Jl. Merdeka No. 45, Jakarta Selatan"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Nomor Telepon / CS WhatsApp:
          </label>
          <Input
            type="text"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Contoh: 0812-3456-7890"
            required
          />
        </div>
      </div>
    </Card>
  );
}
