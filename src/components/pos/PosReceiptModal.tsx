'use client';

import React, { useState } from 'react';
import {
  Receipt,
  MessageCircle,
  Copy,
  Printer,
  Check,
  Download,
  RotateCcw,
  History,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Transaction, StoreSettings } from '@/types/pos';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { PosReceiptPaper } from './PosReceiptPaper';

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  storeSettings: StoreSettings;
  isReprint?: boolean;
  onNewTransaction: () => void;
  onNotify?: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

export function PosReceiptModal({
  isOpen,
  onClose,
  transaction,
  storeSettings,
  isReprint = false,
  onNewTransaction,
  onNotify,
}: PosReceiptModalProps) {
  const [waNumber, setWaNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Handle keyboard shortcuts (Enter to complete & start new transaction if not in reprint mode)
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in WhatsApp phone input, don't hijack Enter
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
        if (!isReprint) {
          onNewTransaction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isReprint, onClose, onNewTransaction]);

  if (!transaction) return null;

  // Build plain text for WhatsApp and Clipboard
  const generateReceiptText = () => {
    const divider = '================================';
    const subDivider = '--------------------------------';
    const lines = [
      storeSettings.storeName,
      storeSettings.address,
      `Telp: ${storeSettings.phone}`,
      divider,
      `No. Struk : ${transaction.receiptNumber}`,
      `Kasir     : ${transaction.cashierName}`,
      `Waktu     : ${formatDateTime(transaction.createdAt)}`,
      divider,
      ...transaction.items.map(
        (it) =>
          `${it.product.name}\n  ${it.quantity} x ${formatRupiah(it.unitPrice)} = ${formatRupiah(
            it.subtotal
          )}${it.discountPerItem > 0 ? ` (Hemat ${formatRupiah(it.discountTotal)})` : ''}`
      ),
      subDivider,
      `Subtotal : ${formatRupiah(transaction.subtotal)}`,
    ];

    if (transaction.discountTotal > 0) {
      lines.push(`Diskon Promo : -${formatRupiah(transaction.discountTotal)}`);
    }
    lines.push(`TOTAL        : ${formatRupiah(transaction.total)}`);
    lines.push(`METODE       : ${transaction.paymentMethod === 'CASH' ? 'TUNAI' : 'QRIS'}`);

    if (transaction.paymentMethod === 'CASH') {
      lines.push(`DITERIMA     : ${formatRupiah(transaction.cashReceived || transaction.total)}`);
      lines.push(`KEMBALI      : ${formatRupiah(transaction.changeGiven || 0)}`);
    }

    lines.push(divider);
    lines.push(storeSettings.footerNote);
    lines.push(divider);

    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReceiptText());
      setCopied(true);
      if (onNotify) {
        onNotify('Teks Struk Tersalin', 'Format teks e-struk berhasil disalin ke clipboard.', 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waNumber.trim()) return;

    let cleanPhone = waNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = encodeURIComponent(
      `*STRUK PEMBELIAN - ${storeSettings.storeName}*\n\n` + generateReceiptText()
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
    if (onNotify) {
      onNotify('WhatsApp Dibuka', `Membuka WhatsApp untuk mengirim struk ke ${waNumber}`, 'info');
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReceiptText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Struk-${transaction.receiptNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloaded(true);
    if (onNotify) {
      onNotify('Struk Diunduh', `File Struk-${transaction.receiptNumber}.txt berhasil disimpan.`, 'success');
    }
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handlePrintThermal = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          {isReprint ? (
            <>
              <History className="w-5 h-5 text-blue-600" />
              <span>Salinan &amp; Cetak Ulang Struk</span>
            </>
          ) : (
            <>
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>E-Struk Digital Pembayaran</span>
            </>
          )}
        </div>
      }
      description={
        isReprint
          ? `Melihat salinan bukti transaksi No. Struk: ${transaction.receiptNumber}. Kirim via WhatsApp atau cetak struk.`
          : 'Transaksi berhasil diproses. Kirim struk via WhatsApp atau unduh struk digital.'
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Thermal Receipt Paper Component */}
        <PosReceiptPaper transaction={transaction} storeSettings={storeSettings} />

        {/* WhatsApp Sender Bar */}
        <form
          onSubmit={handleSendWhatsApp}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold shrink-0">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Kirim WhatsApp:</span>
          </div>
          <Input
            type="tel"
            placeholder="0812xxxxxxxx..."
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            className="h-10 text-xs bg-white"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold shrink-0 text-xs h-10 px-4"
          >
            <span>Kirim Struk WA</span>
          </Button>
        </form>

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 h-10 font-bold"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 h-10 font-bold"
          >
            {downloaded ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloaded ? 'Tersimpan!' : 'Unduh File'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintThermal}
            className="col-span-2 sm:col-span-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 gap-1.5 h-10 font-bold"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Print Thermal</span>
          </Button>
        </div>

        {/* Bottom Context-Aware CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          {isReprint ? (
            <Button variant="secondary" onClick={onClose} size="md" className="font-bold">
              <span>Tutup <span className="hidden sm:inline">(Esc)</span></span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onClose();
                onNewTransaction();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-md shadow-blue-500/25 py-3 cursor-pointer transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>
                SELESAI &amp; TRANSAKSI BARU <span className="hidden sm:inline font-mono font-normal opacity-90">(Enter)</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
