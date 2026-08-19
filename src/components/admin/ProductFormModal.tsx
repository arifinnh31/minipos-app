'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Package, Barcode, Save, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Product } from '@/types/pos';
import { formatRupiah } from '@/lib/utils';
import { ProductMarginCard } from './ProductMarginCard';
import { lookupBarcodeAction } from '@/actions/products';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  initialBarcode?: string | null;
  categories: string[];
  onSave: (productData: Product) => Promise<boolean> | void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  initialBarcode,
  categories,
  onSave,
}: ProductFormModalProps) {
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Minuman');
  const [unit, setUnit] = useState('Pcs');
  const [hpp, setHpp] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  // Promo Discount State (Admin Controlled)
  const [isPromo, setIsPromo] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<'NOMINAL' | 'PERCENT'>('NOMINAL');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupSuccessMsg, setLookupSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAutoLookup = useCallback(async (targetBarcode: string) => {
    const clean = targetBarcode.trim();
    if (!clean || clean.length < 5) return;

    setLookupSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await lookupBarcodeAction(clean);
      if (res.success && res.found && res.data) {
        if (res.data.name) setName(res.data.name);
        if (res.data.category) setCategory(res.data.category);
        if (res.data.unit) setUnit(res.data.unit);
        if (res.data.price && !productToEdit) setPrice(res.data.price);
        if (res.data.hpp && !productToEdit) setHpp(res.data.hpp);
        if (res.data.sku && !productToEdit) setSku(res.data.sku);

        setLookupSuccessMsg(
          res.source === 'database'
            ? `Data dimuat dari database lokal (${res.data.name})`
            : `Produk Terdeteksi Otomatis: ${res.data.name}`
        );
      }
    } catch {
      // ignore
    }
  }, [productToEdit]);

  useEffect(() => {
    setErrorMsg('');
    setLookupSuccessMsg('');
    setIsSubmitting(false);

    if (productToEdit) {
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setHpp(productToEdit.hpp);
      setPrice(productToEdit.price);
      setIsPromo(!!productToEdit.isPromo);
      setDiscountType((productToEdit.discountType as 'NOMINAL' | 'PERCENT') || 'NOMINAL');
      setDiscountValue(productToEdit.discountValue || 0);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
    } else {
      const barcodeToUse = initialBarcode ? initialBarcode.trim() : `899${Math.floor(100000000 + Math.random() * 900000000)}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setSku(`SKU-${randomNum}`);
      setBarcode(barcodeToUse);
      setName('');
      setCategory(categories[1] || 'Minuman');
      setUnit('Pcs');
      setHpp(0);
      setPrice(0);
      setIsPromo(false);
      setDiscountType('NOMINAL');
      setDiscountValue(0);
      setStock(20);
      setMinStock(5);

      if (initialBarcode && initialBarcode.trim().length >= 5) {
        handleAutoLookup(initialBarcode.trim());
      }
    }
  }, [productToEdit, initialBarcode, categories, isOpen, handleAutoLookup]);

  // Calculate effective promo price
  let calculatedPromoPrice = price;
  if (isPromo && discountValue > 0) {
    if (discountType === 'PERCENT') {
      calculatedPromoPrice = Math.max(0, price * (1 - discountValue / 100));
    } else {
      calculatedPromoPrice = Math.max(0, price - discountValue);
    }
  }

  // Margin calculation based on effective selling price
  const effectivePrice = isPromo && discountValue > 0 ? calculatedPromoPrice : price;
  const marginNominal = Math.max(0, effectivePrice - hpp);
  const marginPercent = effectivePrice > 0 ? (marginNominal / effectivePrice) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setErrorMsg('Nomor barcode fisik produk wajib diisi.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('Kode SKU toko wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama lengkap produk wajib diisi.');
      return;
    }
    if (price <= 0) {
      setErrorMsg('Harga jual kasir harus lebih besar dari Rp 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newProduct: Product = {
        id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
        sku: sku.trim(),
        barcode: barcode.trim(),
        name: name.trim(),
        category,
        unit,
        hpp,
        price,
        isPromo: isPromo && discountValue > 0,
        discountType: isPromo ? discountType : 'NONE',
        discountValue: isPromo ? discountValue : 0,
        promoPrice: isPromo && discountValue > 0 ? Math.round(calculatedPromoPrice) : price,
        stock,
        minStock,
      };

      const result = await onSave(newProduct);
      if (result !== false) {
        onClose();
      }
    } catch {
      setErrorMsg('Terjadi kendala saat menyimpan data produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Package className="w-5 h-5 text-blue-600" />
          <span>{productToEdit ? 'Edit Data Produk & Promo' : 'Tambah Produk Baru'}</span>
        </div>
      }
      description="Kelola informasi SKU, barcode fisik, harga modal, harga normal, serta program promo terpusat."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lookupSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lookupSuccessMsg}</span>
          </div>
        )}

        {/* Identitas Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nomor Barcode Fisik:
            </label>
            <Input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onBlur={() => handleAutoLookup(barcode)}
              placeholder="Contoh: 899238811001"
              leftIcon={<Barcode className="w-4 h-4" />}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Kode SKU Toko:
            </label>
            <Input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Contoh: MNM-001"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Nama Lengkap Produk:
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Teh Botol Sosro PET 450ml"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Kategori Produk:
            </label>
            <Select
              value={category}
              onChange={setCategory}
              options={categories.filter((c) => c !== 'Semua').map((cat) => ({ value: cat, label: cat }))}
              placeholder="Pilih kategori..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Satuan Barang:
            </label>
            <Select
              value={unit}
              onChange={setUnit}
              options={['Pcs', 'Botol', 'Bungkus', 'Kotak', 'Kaleng', 'Pack', 'Pouch', 'Sak', 'Kg', 'Renceng', 'Tube', 'Blister', 'Batang']}
              placeholder="Pilih satuan..."
            />
          </div>
        </div>

        {/* Struktur Harga Standar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Harga Pokok & Harga Jual Normal
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Harga Modal Beli (HPP):
              </label>
              <Input
                type="number"
                min="0"
                value={hpp || ''}
                onChange={(e) => setHpp(parseFloat(e.target.value) || 0)}
                placeholder="Rp 0"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Harga Jual Normal Kasir:
              </label>
              <Input
                type="number"
                min="0"
                value={price || ''}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="Rp 0"
                required
              />
            </div>
          </div>
        </div>

        {/* Program Diskon & Promo Toko Terpusat (Admin Controlled) */}
        <div className="p-4 bg-rose-50/60 border-2 border-rose-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                Program Diskon & Promo Toko
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-900">
              <input
                type="checkbox"
                checked={isPromo}
                onChange={(e) => setIsPromo(e.target.checked)}
                className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
              />
              <span>Aktifkan Diskon Promo</span>
            </label>
          </div>

          {isPromo && (
            <div className="space-y-3 pt-2 border-t border-rose-200/80 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('NOMINAL')}
                  className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                    discountType === 'NOMINAL'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Potongan Nominal (Rp)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENT')}
                  className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                    discountType === 'PERCENT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Potongan Persen (%)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'NOMINAL' ? 'Contoh: 1000 (Potongan Rp 1.000)' : 'Contoh: 15 (Diskon 15%)'}
                  className="bg-white"
                />
                <span className="text-xs font-mono text-slate-600 font-bold shrink-0">
                  {discountType === 'NOMINAL' ? 'Rp' : '%'}
                </span>
              </div>

              {/* Promo Price Result Display */}
              <div className="p-2.5 bg-white border border-rose-300 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-900">
                  Harga Promo yang Muncul di Kasir:
                </span>
                <span className="font-mono font-black text-sm text-rose-600">
                  {formatRupiah(Math.round(calculatedPromoPrice))}
                </span>
              </div>
            </div>
          )}

          {/* Margin Calculation Box */}
          <ProductMarginCard
            isPromo={isPromo}
            marginNominal={marginNominal}
            marginPercent={marginPercent}
          />
        </div>

        {/* Manajemen Stok */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Jumlah Stok Saat Ini:
            </label>
            <Input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Batas Alert Minimum Stok:
            </label>
            <Input
              type="number"
              min="1"
              value={minStock}
              onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} size="sm" disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Produk & Promo</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
