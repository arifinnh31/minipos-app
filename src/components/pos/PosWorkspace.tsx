'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Product,
  CartItem,
  HeldCart,
  Transaction,
  CashierShift,
  StoreSettings,
  CashierUser,
  PaymentMethod,
} from '@/types/pos';
import { soundService } from '@/lib/sound';
import { generateReceiptNumber, formatRupiah } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

// Server Actions
import { createTransactionAction } from '@/actions/transactions';
import { createHeldCartAction, deleteHeldCartAction } from '@/actions/heldCarts';
import { openShiftAction, closeShiftAction } from '@/actions/shifts';
import { adminLogoutAction } from '@/actions/auth';

// UI Components
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';

// POS Subcomponents
import { PosHeader } from './PosHeader';
import { PosSearchBar } from './PosSearchBar';
import { PosCategoryFilter } from './PosCategoryFilter';
import { PosProductGrid } from './PosProductGrid';
import { PosCart } from './PosCart';
import { PosCartSummary } from './PosCartSummary';
import { PosNumpad } from './PosNumpad';
import { PosCameraScannerModal } from './PosCameraScannerModal';
import { PosHoldDrawer } from './PosHoldDrawer';
import { PosHoldPromptModal } from './PosHoldPromptModal';
import { PosItemDetailModal } from './PosItemDetailModal';
import { PosPaymentModal } from './PosPaymentModal';
import { PosReceiptModal } from './PosReceiptModal';
import { PosHistoryModal } from './PosHistoryModal';
import { PosShiftModal } from './PosShiftModal';
import { PosChangePinModal } from './PosChangePinModal';
import { PosShiftSummaryModal } from './PosShiftSummaryModal';
import { PosLockScreen } from './PosLockScreen';

interface PosWorkspaceProps {
  initialProducts: Product[];
  initialActiveShift: CashierShift | null;
  initialHeldCarts: HeldCart[];
  initialStoreSettings: StoreSettings;
  initialCashiers: CashierUser[];
  initialTransactions: Transaction[];
}

export function PosWorkspace({
  initialProducts = [],
  initialActiveShift = null,
  initialHeldCarts = [],
  initialStoreSettings,
  initialCashiers = [],
  initialTransactions = [],
}: PosWorkspaceProps) {
  const router = useRouter();

  // Terminal Lock Barrier State (Default locked for security on cold visitor load)
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean | null>(true);

  // Global State from Database
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [storeSettings] = useState<StoreSettings>(initialStoreSettings);
  const [cashiers] = useState<CashierUser[]>(initialCashiers);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Dynamic Categories from Products
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['Semua', ...unique];
  }, [products]);

  // Cashier & Shift State
  const [activeShift, setActiveShift] = useState<CashierShift | null>(initialActiveShift);
  const [activeCashier, setActiveCashier] = useState<CashierUser | null>(
    initialActiveShift
      ? cashiers.find((c) => c.id === initialActiveShift.cashierId) || null
      : null
  );

  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(initialHeldCarts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Active Cart State & Persistence
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  // Restore active cart from localStorage on mount (survives browser refresh)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('minipos_active_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          setSelectedCartItemId(parsed[0].id);
        }
      }
    } catch {}
    setIsCartHydrated(true);
  }, []);

  // Auto-sync active cart to localStorage whenever items change
  useEffect(() => {
    if (!isCartHydrated) return;
    try {
      if (cartItems.length > 0) {
        localStorage.setItem('minipos_active_cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('minipos_active_cart');
      }
    } catch {}
  }, [cartItems, isCartHydrated]);

  // Modals & Drawers Visibility State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isHoldDrawerOpen, setIsHoldDrawerOpen] = useState(false);
  const [isHoldPromptOpen, setIsHoldPromptOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [selectedCartItemForEdit, setSelectedCartItemForEdit] = useState<CartItem | null>(null);
  const [shiftSummaryModalData, setShiftSummaryModalData] = useState<CashierShift | null>(null);

  // Confirmation Dialog States
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState(false);
  const [cartToResume, setCartToResume] = useState<HeldCart | null>(null);

  // Latest Completed Transaction
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(
    initialTransactions[0] || null
  );
  const [isReceiptReprint, setIsReceiptReprint] = useState(false);

  // Notifications / Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const addToast = React.useCallback((
    title: string,
    description: string,
    variant: 'success' | 'warning' | 'danger' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Synchronize state when props update
  useEffect(() => {
    if (initialProducts.length > 0) setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (initialActiveShift) setActiveShift(initialActiveShift);
  }, [initialActiveShift]);

  // Check Active Cashier Session on initial load (Barrier to Entry)
  useEffect(() => {
    const saved = sessionStorage.getItem('minipos_active_cashier');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matching = cashiers.find((c) => c.id === parsed.id && c.isActive);
        if (matching) {
          setActiveCashier(matching);
          setIsTerminalLocked(false);
          return;
        }
      } catch {}
    }
    setIsTerminalLocked(true);
  }, [cashiers]);

  const handleUnlockSuccess = (cashier: CashierUser) => {
    const isHandover = activeShift && activeShift.cashierId !== cashier.id;
    setActiveCashier(cashier);
    sessionStorage.setItem('minipos_active_cashier', JSON.stringify(cashier));

    // Sinkronisasi Sesi Admin / Kasir Berbasis PIN
    if (cashier.role === 'ADMIN') {
      sessionStorage.setItem('minipos_admin_authenticated', 'true');
      sessionStorage.setItem('minipos_admin_user', JSON.stringify(cashier));
    } else {
      sessionStorage.removeItem('minipos_admin_authenticated');
      sessionStorage.removeItem('minipos_admin_user');
    }

    if (activeShift) {
      setActiveShift({
        ...activeShift,
        cashierId: cashier.id,
        cashierName: cashier.name,
      });
    } else {
      // Auto-prompt shift open modal if no active shift exists
      setIsShiftModalOpen(true);
    }
    setIsTerminalLocked(false);
    addToast(
      'Terminal Kasir Terbuka',
      isHandover
        ? `Shift dilanjutkan & diambil alih oleh ${cashier.name}.`
        : !activeShift
        ? `Selamat bertugas, ${cashier.name}! Harap buka shift kasir.`
        : `Selamat bertugas, ${cashier.name}!`,
      'success'
    );
  };

  const handleLockTerminal = useCallback(() => {
    // Bersihkan sesi kasir dan sesi admin saat meja kasir dikunci
    sessionStorage.removeItem('minipos_active_cashier');
    sessionStorage.removeItem('minipos_admin_authenticated');
    sessionStorage.removeItem('minipos_admin_user');
    adminLogoutAction().catch(() => {});

    setIsTerminalLocked(true);
    soundService.playLockClick();
    addToast('Terminal Dikunci', 'Meja kasir berhasil dikunci.', 'info');
  }, [addToast]);

  // ================= CART CALCULATIONS =================
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
  const cartDiscountSavings = cartItems.reduce(
    (acc, item) => acc + item.discountTotal,
    0
  );
  const rawSubtotalAfterDiscount = cartSubtotal - cartDiscountSavings;
  const taxTotal = storeSettings.enableTax
    ? Math.round((rawSubtotalAfterDiscount * (storeSettings.taxPercent || 0)) / 100)
    : 0;
  const grandTotal = rawSubtotalAfterDiscount + taxTotal;
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const activeSelectedItem = cartItems.find((item) => item.id === selectedCartItemId);

  // ================= CART MANAGEMENT =================
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!activeShift) {
      soundService.playErrorBuzz();
      addToast(
        'Shift Belum Dibuka',
        'Wajib membuka shift dan memasukkan modal awal kas laci sebelum melayani transaksi.',
        'warning'
      );
      setIsShiftModalOpen(true);
      return;
    }

    if (product.stock <= 0) {
      soundService.playErrorBuzz();
      addToast('Stok Habis', `Produk "${product.name}" sedang habis!`, 'danger');
      return;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = existingItem.quantity + quantity;

        if (newQty > product.stock) {
          soundService.playErrorBuzz();
          addToast('Batas Stok', `Maksimal stok untuk ${product.name} adalah ${product.stock}.`, 'warning');
          return prevItems;
        }

        const updatedItems = [...prevItems];
        const discountTotal = (existingItem.discountPerItem || 0) * newQty;
        const subtotal = existingItem.unitPrice * newQty;

        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          discountTotal,
          subtotal,
        };

        setSelectedCartItemId(existingItem.id);
        soundService.playBeepSuccess();
        return updatedItems;
      } else {
        const unitPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
        const discountPerItem = product.isPromo ? product.price - unitPrice : 0;
        const discountTotal = discountPerItem * quantity;
        const subtotal = unitPrice * quantity;
        const newCartItemId = `cart-item-${product.id}-${Date.now()}`;

        const newItem: CartItem = {
          id: newCartItemId,
          product,
          quantity,
          unitPrice,
          originalPrice: product.price,
          discountPerItem,
          discountTotal,
          subtotal,
        };

        setSelectedCartItemId(newCartItemId);
        soundService.playBeepSuccess();
        return [newItem, ...prevItems];
      }
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          if (newQuantity > item.product.stock) {
            soundService.playErrorBuzz();
            addToast('Batas Stok', `Maksimal stok tersedia hanya ${item.product.stock}.`, 'warning');
            return item;
          }
          const discountTotal = (item.discountPerItem || 0) * newQuantity;
          const subtotal = item.unitPrice * newQuantity;
          return {
            ...item,
            quantity: newQuantity,
            discountTotal,
            subtotal,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    const itemToRemove = cartItems.find((it) => it.id === cartItemId);
    setCartItems((prev) => prev.filter((it) => it.id !== cartItemId));
    setSelectedCartItemId((prev) => (prev === cartItemId ? null : prev));
    if (itemToRemove) {
      addToast('Item Dihapus', `${itemToRemove.product.name} dihapus dari keranjang.`, 'info');
    }
  };

  const handleConfirmClearCart = () => {
    setCartItems([]);
    setSelectedCartItemId(null);
    setIsVoidConfirmOpen(false);
    addToast('Keranjang Dikosongkan', 'Seluruh barang dalam transaksi saat ini telah dibatalkan.', 'warning');
  };

  // ================= HOLD & RESUME CARTS =================
  const handleHoldCart = async (label: string, note?: string) => {
    if (!activeShift) {
      soundService.playErrorBuzz();
      addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir terlebih dahulu.', 'warning');
      setIsShiftModalOpen(true);
      return;
    }

    if (cartItems.length === 0) return;

    const res = await createHeldCartAction({
      label: label || `Antrean #${heldCarts.length + 1}`,
      customerName: label || `Pelanggan #${heldCarts.length + 1}`,
      note,
      total: grandTotal,
      items: cartItems,
    });

    if (res.success && res.data) {
      setHeldCarts([res.data, ...heldCarts]);
      setCartItems([]);
      setSelectedCartItemId(null);
      setIsHoldPromptOpen(false);
      addToast('Antrean Disimpan', `Transaksi "${label}" berhasil ditahan.`, 'info');
    } else {
      addToast('Gagal Menahan', res.error || 'Gagal menyimpan antrean belanja.', 'danger');
    }
  };

  const handleResumeHeldCart = (heldCart: HeldCart) => {
    if (!activeShift) {
      soundService.playErrorBuzz();
      addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir sebelum memuat antrean transaksi.', 'warning');
      setIsShiftModalOpen(true);
      return;
    }

    if (cartItems.length > 0) {
      setCartToResume(heldCart);
      setIsResumeConfirmOpen(true);
    } else {
      executeResume(heldCart);
    }
  };

  const executeResume = async (heldCart: HeldCart) => {
    await deleteHeldCartAction(heldCart.id);
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCart.id));
    setCartItems(heldCart.items);
    if (heldCart.items.length > 0) {
      setSelectedCartItemId(heldCart.items[0].id);
    }
    setIsHoldDrawerOpen(false);
    setIsResumeConfirmOpen(false);
    setCartToResume(null);
    soundService.playBeepSuccess();
    addToast('Antrean Dimuat', `Daftar belanjaan ${heldCart.label} berhasil dimuat kembali.`, 'success');
  };

  const handleRemoveHeldCart = async (heldCartId: string) => {
    await deleteHeldCartAction(heldCartId);
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCartId));
    addToast('Antrean Dihapus', 'Daftar antrean belanja berhasil dihapus.', 'info');
  };

  // ================= PAYMENT PROCESSING =================
  const handleConfirmPayment = async (
    method: PaymentMethod,
    cashReceived: number,
    changeGiven: number
  ) => {
    if (!activeShift) {
      soundService.playErrorBuzz();
      addToast('Shift Belum Dibuka', 'Shift kasir wajib dibuka sebelum menyelesaikan transaksi.', 'danger');
      setIsPaymentOpen(false);
      setIsShiftModalOpen(true);
      return;
    }

    const receiptNumber = generateReceiptNumber();
    const cashierName = activeShift?.cashierName || activeCashier?.name || 'Kasir';
    const cashierId = activeShift?.cashierId || activeCashier?.id;

    // Call Server Action to persist in Database & deduct stock
    const res = await createTransactionAction({
      receiptNumber,
      cashierId,
      cashierName,
      shiftId: activeShift?.id,
      items: cartItems,
      subtotal: rawSubtotalAfterDiscount,
      discountTotal: cartDiscountSavings,
      taxTotal,
      total: grandTotal,
      paymentMethod: method,
      cashReceived,
      changeGiven,
    });

    if (!res.success || !res.data) {
      addToast('Transaksi Gagal', res.error || 'Gagal memproses transaksi ke database.', 'danger');
      return;
    }

    const savedTx = res.data;

    // Deduct stock in real-time UI
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cartItems.find((it) => it.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
      })
    );

    // Update active shift stats in UI
    if (activeShift) {
      setActiveShift({
        ...activeShift,
        totalCashSales:
          method === 'CASH'
            ? activeShift.totalCashSales + grandTotal
            : activeShift.totalCashSales,
        totalQrisSales:
          method === 'QRIS'
            ? activeShift.totalQrisSales + grandTotal
            : activeShift.totalQrisSales,
        totalTransactions: activeShift.totalTransactions + 1,
        expectedCashInDrawer:
          method === 'CASH'
            ? activeShift.expectedCashInDrawer + grandTotal
            : activeShift.expectedCashInDrawer,
      });
    }

    setTransactions([savedTx, ...transactions]);
    setLatestTransaction(savedTx);
    setCartItems([]);
    setSelectedCartItemId(null);
    setIsReceiptReprint(false);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  // ================= SHIFT MANAGEMENT =================
  const handleStartShift = async (startingCash: number, shiftSchedule: string) => {
    const cashierId = activeCashier?.id || cashiers[0]?.id || '';
    const cashierName = activeCashier?.name || cashiers[0]?.name || 'Petugas Kasir';

    const res = await openShiftAction({
      cashierId,
      cashierName,
      shiftName: shiftSchedule,
      startingCash,
    });

    if (res.success && res.data) {
      setActiveShift(res.data);
      addToast('Shift Dibuka', `Shift kasir dimulai dengan modal awal ${formatRupiah(startingCash)}.`, 'success');
    } else {
      addToast('Gagal Membuka Shift', res.error || 'Terjadi kesalahan sistem.', 'danger');
    }
  };

  const handleCloseShift = async (actualCashCount: number, notes: string) => {
    if (!activeShift) return;

    const res = await closeShiftAction(activeShift.id, actualCashCount, notes);

    if (res.success && res.data) {
      setActiveShift(null);
      setActiveCashier(null);
      sessionStorage.removeItem('minipos_active_cashier');
      setShiftSummaryModalData(res.data);
      addToast('Shift Ditutup', 'Rekap kasir dan rekonsiliasi kas telah tersimpan.', 'success');
    } else {
      addToast('Gagal Menutup Shift', res.error || 'Terjadi kesalahan sistem.', 'danger');
    }
  };

  // ================= GLOBAL DESELECT ON OUTSIDE CLICK =================
  useEffect(() => {
    if (isTerminalLocked) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.cart-item-row') ||
        target.closest('.numpad-container') ||
        target.closest('.product-grid-card') ||
        target.closest('.search-dropdown-item') ||
        target.closest('[role="dialog"]')
      ) {
        return;
      }
      setSelectedCartItemId(null);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isTerminalLocked]);

  // ================= GLOBAL KEYBOARD SHORTCUTS =================
  useEffect(() => {
    if (isTerminalLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Function keys and Escape should trigger even when an input/search has focus
      const isFunctionKey = /^F[1-9]$|^F1[0-2]$/.test(e.key);

      if (!isFunctionKey) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          if (e.key === 'Escape') {
            (e.target as HTMLElement).blur();
          }
          return;
        }
      }

      // F1: Focus Search Input / Barcode Scanner Input
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F2: Open Camera Scanner Modal
      else if (e.key === 'F2') {
        e.preventDefault();
        setIsCameraOpen(true);
      }
      // F3: Open Transaction History & Reprint
      else if (e.key === 'F3') {
        e.preventDefault();
        setIsHistoryOpen(true);
      }
      // F4: Hold Current Active Cart (Simpan Transaksi)
      else if (e.key === 'F4') {
        e.preventDefault();
        if (!activeShift) {
          soundService.playErrorBuzz();
          addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir terlebih dahulu.', 'warning');
          setIsShiftModalOpen(true);
          return;
        }
        if (cartItems.length > 0) {
          setIsHoldPromptOpen(true);
        }
      }
      // F7: Open Hold Carts Queue Drawer (Lihat Antrean Tertahan)
      else if (e.key === 'F7') {
        e.preventDefault();
        setIsHoldDrawerOpen(true);
      }
      // F8: Checkout / Pay (Buka Modal Pembayaran)
      else if (e.key === 'F8') {
        e.preventDefault();
        if (!activeShift) {
          soundService.playErrorBuzz();
          addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir sebelum memproses pembayaran.', 'warning');
          setIsShiftModalOpen(true);
          return;
        }
        if (cartItems.length > 0 && !isPaymentOpen) {
          setIsPaymentOpen(true);
        }
      }
      // F9: Void / Clear All Cart Items
      else if (e.key === 'F9') {
        e.preventDefault();
        if (cartItems.length > 0) {
          setIsVoidConfirmOpen(true);
        }
      }
      // F10: Lock Terminal POS (Kunci Layar)
      else if (e.key === 'F10') {
        e.preventDefault();
        handleLockTerminal();
      }
      // F12: Open Shift Management Modal (Buka / Tutup Shift)
      else if (e.key === 'F12') {
        e.preventDefault();
        setIsShiftModalOpen(true);
      }
      // Escape: Close any open modal or deselect cart item
      else if (e.key === 'Escape') {
        setIsCameraOpen(false);
        setIsHoldDrawerOpen(false);
        setIsHoldPromptOpen(false);
        setIsPaymentOpen(false);
        setIsReceiptOpen(false);
        setIsHistoryOpen(false);
        setIsShiftModalOpen(false);
        setIsChangePinOpen(false);
        setSelectedCartItemForEdit(null);
        setSelectedCartItemId(null);
      }
      // Delete / Backspace: Remove selected cart item
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCartItemId) {
          e.preventDefault();
          const itemToRemove = cartItems.find((it) => it.id === selectedCartItemId);
          setCartItems((prev) => prev.filter((it) => it.id !== selectedCartItemId));
          setSelectedCartItemId(null);
          if (itemToRemove) {
            addToast('Item Dihapus', `${itemToRemove.product.name} dihapus dari keranjang.`, 'info');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, isPaymentOpen, selectedCartItemId, isTerminalLocked, activeShift, addToast, handleLockTerminal]);

  const catalogProducts =
    selectedCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // If terminal is locked, render the Barrier Lock Screen (Visitors cannot view catalog or transactions)
  if (isTerminalLocked === true || isTerminalLocked === null) {
    return (
      <div className="h-screen bg-slate-100 flex flex-col">
        <PosLockScreen
          storeSettings={storeSettings}
          cashiers={cashiers}
          onUnlockSuccess={handleUnlockSuccess}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden bg-slate-100 flex flex-col select-none">
      {/* Fixed Header */}
      <div className="shrink-0">
        <PosHeader
          storeSettings={storeSettings}
          activeShift={activeShift}
          activeCashier={activeCashier}
          heldCount={heldCarts.length}
          onOpenCamera={() => setIsCameraOpen(true)}
          onOpenHoldDrawer={() => setIsHoldDrawerOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenShiftModal={() => setIsShiftModalOpen(true)}
          onOpenChangePin={() => setIsChangePinOpen(true)}
          onLockTerminal={handleLockTerminal}
          onOpenAdminMode={() => router.push('/admin')}
        />

        {/* Warning Banner when Shift is not yet opened */}
        {!activeShift && (
          <div
            onClick={() => setIsShiftModalOpen(true)}
            className="bg-amber-500/15 border-b border-amber-400/50 px-4 py-2 flex items-center justify-center sm:justify-start gap-2.5 text-amber-950 cursor-pointer hover:bg-amber-500/20 transition-all animate-in fade-in duration-300"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <div className="text-xs font-semibold">
              <span className="text-amber-950 font-bold">Shift Kasir Belum Dibuka: </span>
              <span className="text-amber-900">
                Wajib membuka shift dan memasukkan modal awal kas di laci sebelum melayani transaksi penjualan.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main POS Container */}
      <main className="flex-1 lg:overflow-hidden p-3 sm:p-4 max-w-[1920px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* ================= LEFT COLUMN: Cart & Summary ================= */}
        <section className="lg:col-span-5 flex flex-col lg:h-full lg:overflow-hidden gap-3">
          <div className="min-h-[220px] max-h-[380px] lg:max-h-none lg:flex-1 lg:overflow-hidden lg:min-h-0">
            <PosCart
              items={cartItems}
              selectedItemId={selectedCartItemId}
              onSelectItem={(id) => setSelectedCartItemId(id)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={() => setIsVoidConfirmOpen(true)}
              onOpenItemDetail={(item) => setSelectedCartItemForEdit(item)}
            />
          </div>

          <div className="shrink-0">
            <PosCartSummary
              subtotal={cartSubtotal}
              discount={cartDiscountSavings}
              tax={taxTotal}
              total={grandTotal}
              itemCount={cartItemCount}
              onCheckout={() => {
                if (!activeShift) {
                  soundService.playErrorBuzz();
                  addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir sebelum memproses pembayaran.', 'warning');
                  setIsShiftModalOpen(true);
                  return;
                }
                setIsPaymentOpen(true);
              }}
              onHoldCart={() => {
                if (!activeShift) {
                  soundService.playErrorBuzz();
                  addToast('Shift Belum Dibuka', 'Wajib membuka shift kasir terlebih dahulu.', 'warning');
                  setIsShiftModalOpen(true);
                  return;
                }
                setIsHoldPromptOpen(true);
              }}
              disabled={cartItems.length === 0}
            />
          </div>
        </section>

        {/* ================= RIGHT COLUMN: Catalog & Numpad ================= */}
        <section className="lg:col-span-7 flex flex-col lg:h-full lg:overflow-hidden gap-2.5">
          <div className="shrink-0">
            <PosSearchBar
              products={products}
              onSelectProduct={(p) => handleAddToCart(p, 1)}
              inputRef={searchInputRef}
            />
          </div>

          <div className="shrink-0">
            <PosCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </div>

          <div className="shrink-0 flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Menu Katalog Cepat ({catalogProducts.length} Produk)
            </span>
            <span className="text-xs text-slate-400 font-medium">Klik kartu untuk menambah belanjaan</span>
          </div>

          <div className="min-h-[300px] lg:flex-1 lg:overflow-hidden lg:min-h-0">
            <PosProductGrid
              products={catalogProducts}
              onAddToCart={(p) => handleAddToCart(p, 1)}
            />
          </div>

          <div className="shrink-0 hidden xl:block">
            <PosNumpad
              selectedItem={activeSelectedItem || null}
              onSetQuantity={(qty) => {
                if (activeSelectedItem) {
                  handleUpdateQuantity(activeSelectedItem.id, qty);
                }
              }}
              onQuickAdd={(amount) => {
                if (activeSelectedItem) {
                  const newQty = activeSelectedItem.quantity + amount;
                  if (newQty > 0) {
                    handleUpdateQuantity(activeSelectedItem.id, newQty);
                  }
                }
              }}
              onVoidSelectedItem={() => {
                if (selectedCartItemId) {
                  handleRemoveItem(selectedCartItemId);
                }
              }}
            />
          </div>
        </section>
      </main>

      {/* ================= MODALS & DRAWERS ================= */}
      <PosCameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(code) => {
          const found = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
          if (found) {
            handleAddToCart(found, 1);
            addToast('Barcode Terdeteksi', `${found.name} ditambahkan.`, 'success');
          } else {
            soundService.playErrorBuzz();
            addToast('Tidak Ditemukan', `Barcode "${code}" tidak terdaftar.`, 'danger');
          }
        }}
      />

      <PosHoldDrawer
        isOpen={isHoldDrawerOpen}
        onClose={() => setIsHoldDrawerOpen(false)}
        heldCarts={heldCarts}
        activeCartItems={cartItems}
        onResumeCart={handleResumeHeldCart}
        onDeleteHeldCart={handleRemoveHeldCart}
        onOpenHoldModal={() => {
          setIsHoldDrawerOpen(false);
          setIsHoldPromptOpen(true);
        }}
      />

      <PosHoldPromptModal
        isOpen={isHoldPromptOpen}
        onClose={() => setIsHoldPromptOpen(false)}
        onConfirm={(customerName, note) => handleHoldCart(customerName, note)}
      />

      <PosItemDetailModal
        isOpen={!!selectedCartItemForEdit}
        onClose={() => setSelectedCartItemForEdit(null)}
        item={selectedCartItemForEdit}
        onSaveItem={(updatedItem) => {
          setCartItems((prev) =>
            prev.map((it) => (it.id === updatedItem.id ? updatedItem : it))
          );
          addToast('Item Diperbarui', 'Kuantitas item belanja berhasil disesuaikan.', 'success');
        }}
        onDeleteItem={handleRemoveItem}
      />

      <PosPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={grandTotal}
        storeSettings={storeSettings}
        onConfirmPayment={handleConfirmPayment}
      />

      <PosReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={latestTransaction}
        storeSettings={storeSettings}
        isReprint={isReceiptReprint}
        onNotify={(title, msg, type) => addToast(title, msg, type === 'error' ? 'danger' : type)}
        onNewTransaction={() => {
          setCartItems([]);
          setSelectedCartItemId(null);
          searchInputRef.current?.focus();
        }}
      />

      <PosHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
        onSelectTransactionToReprint={(tx) => {
          setLatestTransaction(tx);
          setIsReceiptReprint(true);
          setIsReceiptOpen(true);
        }}
      />

      <PosShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        activeShift={activeShift}
        shiftConfig={storeSettings.shiftConfig}
        onStartShift={handleStartShift}
        onCloseShift={handleCloseShift}
      />

      <PosChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        cashierId={activeCashier?.id || cashiers[0]?.id || ''}
        cashierName={activeShift?.cashierName || activeCashier?.name || 'Kasir'}
        onSuccess={() => {
          addToast('PIN Berhasil Diperbarui', 'PIN operasional kasir telah berhasil diperbarui di database.', 'success');
        }}
      />

      <ConfirmDialog
        isOpen={isVoidConfirmOpen}
        onClose={() => setIsVoidConfirmOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="Bersihkan Seluruh Keranjang Belanja?"
        description="Semua barang yang telah diinput pada transaksi saat ini akan dibatalkan (void)."
        confirmLabel="Void Semua Item"
        cancelLabel="Kembali"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isResumeConfirmOpen}
        onClose={() => setIsResumeConfirmOpen(false)}
        onConfirm={() => cartToResume && executeResume(cartToResume)}
        title="Timpa Belanjaan Aktif Saat Ini?"
        description="Keranjang aktif memiliki barang. Apakah Anda ingin menimpanya dengan daftar belanjaan yang di-resume?"
        confirmLabel="Ya, Muat Antrean"
        cancelLabel="Batal"
        variant="warning"
      />

      <PosShiftSummaryModal
        shiftData={shiftSummaryModalData}
        onClose={() => {
          setShiftSummaryModalData(null);
          setIsTerminalLocked(true);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
