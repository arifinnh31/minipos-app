export type DiscountType = 'NONE' | 'PERCENT' | 'NOMINAL';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  hpp: number; // Harga Pokok Penjualan (Modal)
  price: number; // Harga Jual Normal
  isPromo?: boolean;
  discountType?: DiscountType;
  discountValue?: number;
  promoPrice?: number; // Harga Jual setelah diskon promo admin
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  isActive?: boolean;
}

export interface CartItem {
  id: string; // unique item id in cart
  product: Product;
  quantity: number;
  unitPrice: number; // Final selling unit price (normal or promo)
  originalPrice: number; // Normal price before discount
  discountPerItem: number; // Discount amount per piece from admin promo
  discountTotal: number; // Total discount for this line item
  subtotal: number;
  notes?: string;
}

export interface HeldCart {
  id: string;
  label: string; // e.g. "Antrean #1 - Ibu Sarah"
  customerName: string;
  note?: string;
  items: CartItem[];
  total: number;
  heldAt: string;
}

export type PaymentMethod = 'CASH' | 'QRIS';

export interface Transaction {
  id: string;
  receiptNumber: string;
  cashierName: string;
  shiftId?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  createdAt: string;
}

export type CashierRole = 'CASHIER' | 'ADMIN';

export interface CashierUser {
  id: string;
  name: string;
  role: CashierRole;
  pin: string; // 4-digit PIN operasional
  email?: string;
  phone?: string;
  isActive: boolean;
  totalShiftsCompleted: number;
  totalSalesVolume: number;
  createdAt: string;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  shiftName: string; // 'Shift 1 (Pagi)' | 'Shift 2 (Siang)' | 'Shift 3 (Malam)'
  startTime: string;
  endTime?: string;
  startingCash: number; // Modal Awal
  totalCashSales: number;
  totalQrisSales: number;
  totalTransactions: number;
  expectedCashInDrawer: number; // startingCash + totalCashSales
  actualCashCount?: number; // Blind count by cashier
  difference?: number; // actual - expected
  notes?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface ShiftTimingConfig {
  shift1Name: string;
  shift1Start: string; // '07:00'
  shift1End: string;   // '15:00'
  shift2Name: string;
  shift2Start: string; // '15:00'
  shift2End: string;   // '23:00'
  shift3Name: string;
  shift3Start: string; // '23:00'
  shift3End: string;   // '07:00'
  enableShift3: boolean; // Shift Malam
  shift4Name: string;
  shift4Start: string; // '00:00'
  shift4End: string;   // '24:00'
  enableShift4: boolean; // Shift Gerai 24 Jam
}

export type StockOpnameReason = 'SESUAI' | 'RUSAK' | 'KADALUARSA' | 'SELISIH_HITUNG' | 'RETUR' | 'LAINNYA';

export interface StockOpnameItem {
  productId: string;
  sku: string;
  barcode: string;
  productName: string;
  category: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  hpp: number;
  lossValue: number;
  reason: StockOpnameReason;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  footerNote: string;
  enableTax: boolean;
  taxPercent: number;
  qrisImageUrl: string;
  shiftConfig?: ShiftTimingConfig;
}
