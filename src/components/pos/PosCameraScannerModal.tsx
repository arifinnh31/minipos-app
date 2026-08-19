'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flashlight, RefreshCw, Barcode, Volume2, VolumeX, AlertCircle, Scan } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { soundService } from '@/lib/sound';

interface PosCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function PosCameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: PosCameraScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraError, setHasCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef<unknown>(null);
  const scannerContainerId = 'html5qr-code-full-region';

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      if (!isOpen) return;

      try {
        setHasCameraError(false);
        setErrorMessage('');

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
        if (!isMounted) return;

        // Support both 1D retail barcodes (EAN-13, EAN-8, Code-128, Code-39, UPC) and 2D QR Codes
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const scanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: facingMode },
          {
            fps: 20,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.333334,
          },
          (decodedText) => {
            if (soundEnabled) {
              soundService.playScanBeep();
            }
            onScanSuccess(decodedText);
          },
          () => {
            // silent scan frame callback
          }
        );
      } catch (err: unknown) {
        if (!isMounted) return;
        setHasCameraError(true);
        const error = err as Error;
        setErrorMessage(
          error?.message || 'Izin kamera ditolak atau kamera tidak ditemukan pada perangkat ini.'
        );
      }
    }

    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner();
      }, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (scannerRef.current) {
          const s = scannerRef.current as { isScanning?: boolean; stop: () => Promise<void>; clear: () => void };
          if (s.isScanning) {
            s.stop().catch(() => {}).finally(() => s.clear());
          }
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen, facingMode, soundEnabled, onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;

    if (soundEnabled) {
      soundService.playScanBeep();
    }
    onScanSuccess(manualBarcode.trim());
    setManualBarcode('');
  };

  const toggleTorch = async () => {
    try {
      if (scannerRef.current) {
        const s = scannerRef.current as { applyVideoConstraints: (constraints: MediaTrackConstraints) => Promise<void> };
        await s.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      // Torch not supported on this camera
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Scan className="w-5 h-5 text-blue-600" />
          <span>Scanner Barcode Kamera</span>
        </div>
      }
      description="Arahkan kamera ke barcode produk fisik (EAN-13, Code-128, QR) untuk memindai otomatis."
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Scanner Viewport Container */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[300px] flex items-center justify-center border-2 border-slate-800 shadow-inner">
          {/* Native HTML5-QRCode Viewport without any conflicting second border */}
          <div
            id={scannerContainerId}
            className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
          />

          {/* Camera Error Fallback */}
          {hasCameraError && (
            <div className="p-6 text-center text-white flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm font-semibold text-amber-200">Akses Kamera Terkendala</p>
              <p className="text-xs text-slate-400 max-w-sm">{errorMessage}</p>
              <p className="text-xs text-slate-300 mt-2">
                Gunakan kotak input barcode manual di bawah ini untuk memproses barang.
              </p>
            </div>
          )}
        </div>

        {/* Camera Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={toggleTorch}
              className={torchOn ? 'bg-amber-100 text-amber-900 border-amber-300' : ''}
              title="Nyalakan Lampu Senter"
            >
              <Flashlight className="w-4 h-4" />
              <span className="text-xs">{torchOn ? 'Senter Nyala' : 'Senter'}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={toggleFacingMode}
              title="Balik Kamera"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs">{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Audio Beep: Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio Beep: Mute</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Barcode Input Fallback */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Ketik nomor barcode manual jika kamera sulit fokus..."
            leftIcon={<Barcode className="w-4 h-4" />}
            autoFocus
          />
          <Button type="submit" variant="primary" size="md" className="shrink-0 bg-blue-600 hover:bg-blue-700">
            Tambah
          </Button>
        </form>

        <div className="flex justify-end pt-1 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} size="sm">
            <span>Tutup Scanner <span className="hidden sm:inline">(Esc)</span></span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
