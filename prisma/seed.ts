import 'dotenv/config';
import { PrismaClient, Role, DiscountType, PaymentMethod, ShiftStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { initialProducts, initialStoreSettings } from '../src/lib/mockData';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Memulai proses Seeding Lengkap Database PostgreSQL Supabase...');

  // 1. Bersihkan seluruh database lama
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.heldCartItem.deleteMany();
  await prisma.heldCart.deleteMany();
  await prisma.stockOpnameItem.deleteMany();
  await prisma.stockOpnameAudit.deleteMany();
  await prisma.cashierShift.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  console.log('🧹 1. Database lama berhasil dibersihkan total.');

  // 2. Seed Store Settings
  const shiftCfg = initialStoreSettings.shiftConfig;
  await prisma.storeSettings.create({
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
  });
  console.log('✅ 2. Master Pengaturan Toko & 4 Shift Operasional berhasil dibuat.');

  // 3. Seed Users (1 Admin & 4 Kasir Realistis)
  const cashiersData = [
    {
      id: 'usr-admin',
      name: 'Ahmad Faisal',
      email: 'admin@tokoku.com',
      password: 'admin123',
      role: Role.ADMIN,
      pin: '9999',
      phone: '0812-9999-8888',
      isActive: true,
      totalShiftsCompleted: 180,
      totalSalesVolume: 62400000,
    },
    {
      id: 'c-1',
      name: 'Budi Santoso',
      email: 'budi@tokoku.com',
      password: null,
      role: Role.CASHIER,
      pin: '1234',
      phone: '0812-1111-2222',
      isActive: true,
      totalShiftsCompleted: 142,
      totalSalesVolume: 45200000,
    },
    {
      id: 'c-2',
      name: 'Siti Rahmawati',
      email: 'siti@tokoku.com',
      password: null,
      role: Role.CASHIER,
      pin: '2345',
      phone: '0813-2222-3333',
      isActive: true,
      totalShiftsCompleted: 98,
      totalSalesVolume: 31500000,
    },
    {
      id: 'c-3',
      name: 'Dedi Pratama',
      email: 'dedi@tokoku.com',
      password: null,
      role: Role.CASHIER,
      pin: '3456',
      phone: '0814-3333-4444',
      isActive: true,
      totalShiftsCompleted: 75,
      totalSalesVolume: 24800000,
    },
    {
      id: 'c-4',
      name: 'Anita Kusuma',
      email: 'anita@tokoku.com',
      password: null,
      role: Role.CASHIER,
      pin: '4567',
      phone: '0815-4444-5555',
      isActive: true,
      totalShiftsCompleted: 52,
      totalSalesVolume: 18200000,
    },
  ];

  for (const u of cashiersData) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        pin: u.pin,
        phone: u.phone,
        isActive: u.isActive,
        totalShiftsCompleted: u.totalShiftsCompleted,
        totalSalesVolume: u.totalSalesVolume,
        createdAt: new Date('2026-01-15T08:00:00Z'),
      },
    });
  }
  console.log(`✅ 3. ${cashiersData.length} Data Pengguna (1 Admin & 4 Staf Kasir) berhasil dibuat.`);

  // 4. Seed Products (126 Produk FMCG Lengkap)
  for (const p of initialProducts) {
    let dt: DiscountType = DiscountType.NONE;
    if (p.discountType === 'PERCENT') dt = DiscountType.PERCENT;
    if (p.discountType === 'NOMINAL') dt = DiscountType.NOMINAL;

    await prisma.product.create({
      data: {
        id: p.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        category: p.category,
        hpp: p.hpp,
        price: p.price,
        isPromo: p.isPromo || false,
        discountType: dt,
        discountValue: p.discountValue || 0,
        promoPrice: p.promoPrice || null,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        isActive: true,
        image: p.image || null,
      },
    });
  }
  console.log(`✅ 4. ${initialProducts.length} Data Master Produk Ritel Indonesia Lengkap berhasil dibuat.`);

  // 5. Seed Riwayat Shift Kasir (6 Shift Closed Sebelumnya)
  const shiftHistoryData = [
    {
      id: 'shift-hist-1',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftName: 'Shift 1 (Pagi)',
      startTime: new Date('2026-08-14T07:00:00Z'),
      endTime: new Date('2026-08-14T15:00:00Z'),
      startingCash: 200000,
      totalCashSales: 1450000,
      totalQrisSales: 850000,
      totalTransactions: 42,
      expectedCashInDrawer: 1650000,
      actualCashCount: 1650000,
      difference: 0,
      notes: 'Shift pagi lancar, stok aman.',
      status: ShiftStatus.CLOSED,
    },
    {
      id: 'shift-hist-2',
      cashierId: 'c-2',
      cashierName: 'Siti Rahmawati',
      shiftName: 'Shift 2 (Siang)',
      startTime: new Date('2026-08-14T15:00:00Z'),
      endTime: new Date('2026-08-14T23:00:00Z'),
      startingCash: 250000,
      totalCashSales: 1820000,
      totalQrisSales: 1100000,
      totalTransactions: 56,
      expectedCashInDrawer: 2070000,
      actualCashCount: 2070000,
      difference: 0,
      notes: 'Shift malam ramai pembeli.',
      status: ShiftStatus.CLOSED,
    },
    {
      id: 'shift-hist-3',
      cashierId: 'c-3',
      cashierName: 'Dedi Pratama',
      shiftName: 'Shift 1 (Pagi)',
      startTime: new Date('2026-08-15T07:00:00Z'),
      endTime: new Date('2026-08-15T15:00:00Z'),
      startingCash: 200000,
      totalCashSales: 1300000,
      totalQrisSales: 920000,
      totalTransactions: 38,
      expectedCashInDrawer: 1500000,
      actualCashCount: 1500000,
      difference: 0,
      notes: 'Rekonsiliasi kas klop.',
      status: ShiftStatus.CLOSED,
    },
    {
      id: 'shift-hist-4',
      cashierId: 'c-4',
      cashierName: 'Anita Kusuma',
      shiftName: 'Shift 2 (Siang)',
      startTime: new Date('2026-08-15T15:00:00Z'),
      endTime: new Date('2026-08-15T23:00:00Z'),
      startingCash: 200000,
      totalCashSales: 1650000,
      totalQrisSales: 1250000,
      totalTransactions: 49,
      expectedCashInDrawer: 1850000,
      actualCashCount: 1850000,
      difference: 0,
      notes: 'Shift malam tertib.',
      status: ShiftStatus.CLOSED,
    },
    {
      id: 'shift-hist-5',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftName: 'Shift 1 (Pagi)',
      startTime: new Date('2026-08-16T07:00:00Z'),
      endTime: new Date('2026-08-16T15:00:00Z'),
      startingCash: 250000,
      totalCashSales: 1550000,
      totalQrisSales: 980000,
      totalTransactions: 44,
      expectedCashInDrawer: 1800000,
      actualCashCount: 1800000,
      difference: 0,
      notes: 'Laporan kas cocok 100%.',
      status: ShiftStatus.CLOSED,
    },
    {
      id: 'shift-hist-6',
      cashierId: 'c-2',
      cashierName: 'Siti Rahmawati',
      shiftName: 'Shift 2 (Siang)',
      startTime: new Date('2026-08-16T15:00:00Z'),
      endTime: new Date('2026-08-16T23:00:00Z'),
      startingCash: 250000,
      totalCashSales: 1950000,
      totalQrisSales: 1350000,
      totalTransactions: 58,
      expectedCashInDrawer: 2200000,
      actualCashCount: 2200000,
      difference: 0,
      notes: 'Penutupan kasir selesai tanpa selisih.',
      status: ShiftStatus.CLOSED,
    },
  ];

  for (const s of shiftHistoryData) {
    await prisma.cashierShift.create({
      data: s,
    });
  }
  console.log(`✅ 5. ${shiftHistoryData.length} Riwayat Shift Kasir Lengkap berhasil dibuat.`);

  // 6. Seed Riwayat Transaksi Penjualan Lengkap (10 Transaksi Multi-Item)
  const transactionsData = [
    {
      id: 'tx-1',
      receiptNumber: 'BM-20260814-0001',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: 'shift-hist-1',
      subtotal: 28500,
      discountTotal: 1000,
      taxTotal: 0,
      total: 27500,
      paymentMethod: PaymentMethod.CASH,
      cashReceived: 50000,
      changeGiven: 22500,
      createdAt: new Date('2026-08-14T08:15:00Z'),
      items: [
        { productId: 'prod-8', productName: 'Teh Botol Sosro PET 450ml', quantity: 2, unitPrice: 6000, originalPrice: 7000, discountPerItem: 1000, discountTotal: 2000, subtotal: 12000 },
        { productId: 'prod-38', productName: 'Indomie Goreng Spesial 85g', quantity: 3, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 10500 },
        { productId: 'prod-1', productName: 'Aqua Air Mineral PET 600ml', quantity: 1, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 3500 },
        { productId: 'prod-72', productName: 'Beng Beng Cokelat Wafer 20g', quantity: 1, unitPrice: 2500, originalPrice: 2500, discountPerItem: 0, discountTotal: 0, subtotal: 2500 },
      ],
    },
    {
      id: 'tx-2',
      receiptNumber: 'BM-20260814-0002',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: 'shift-hist-1',
      subtotal: 111000,
      discountTotal: 2500,
      taxTotal: 0,
      total: 108500,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-14T09:30:00Z'),
      items: [
        { productId: 'prod-78', productName: 'Beras Setra Ramos Super 5kg', quantity: 1, unitPrice: 72500, originalPrice: 72500, discountPerItem: 0, discountTotal: 0, subtotal: 72500 },
        { productId: 'prod-80', productName: 'Minyak Goreng Bimoli Klasik 2L', quantity: 1, unitPrice: 36000, originalPrice: 38500, discountPerItem: 2500, discountTotal: 2500, subtotal: 36000 },
      ],
    },
    {
      id: 'tx-3',
      receiptNumber: 'BM-20260814-0003',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: 'shift-hist-1',
      subtotal: 44000,
      discountTotal: 3000,
      taxTotal: 0,
      total: 41000,
      paymentMethod: PaymentMethod.CASH,
      cashReceived: 50000,
      changeGiven: 9000,
      createdAt: new Date('2026-08-14T11:45:00Z'),
      items: [
        { productId: 'prod-102', productName: 'Lifebuoy Sabun Cair Total 10 450ml', quantity: 1, unitPrice: 22000, originalPrice: 25000, discountPerItem: 3000, discountTotal: 3000, subtotal: 22000 },
        { productId: 'prod-90', productName: 'Sunlight Jeruk Nipis 700ml', quantity: 1, unitPrice: 16000, originalPrice: 16000, discountPerItem: 0, discountTotal: 0, subtotal: 16000 },
        { productId: 'prod-87', productName: 'Garam Dapur Beryodium Cap Kapal 250g', quantity: 1, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 3500 },
      ],
    },
    {
      id: 'tx-4',
      receiptNumber: 'BM-20260815-0004',
      cashierId: 'c-3',
      cashierName: 'Dedi Pratama',
      shiftId: 'shift-hist-3',
      subtotal: 51000,
      discountTotal: 2000,
      taxTotal: 0,
      total: 49000,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-15T10:10:00Z'),
      items: [
        { productId: 'prod-70', productName: 'SilverQueen Cashew 62g', quantity: 2, unitPrice: 14500, originalPrice: 16500, discountPerItem: 2000, discountTotal: 4000, subtotal: 29000 },
        { productId: 'prod-65', productName: 'Oreo Vanilla Cream 133g', quantity: 2, unitPrice: 10000, originalPrice: 10000, discountPerItem: 0, discountTotal: 0, subtotal: 20000 },
      ],
    },
    {
      id: 'tx-5',
      receiptNumber: 'BM-20260815-0005',
      cashierId: 'c-3',
      cashierName: 'Dedi Pratama',
      shiftId: 'shift-hist-3',
      subtotal: 75500,
      discountTotal: 0,
      taxTotal: 0,
      total: 75500,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-15T13:25:00Z'),
      items: [
        { productId: 'prod-117', productName: 'Tolak Angin Cair SidoMuncul 15ml (Dus 5s)', quantity: 2, unitPrice: 21000, originalPrice: 21000, discountPerItem: 0, discountTotal: 0, subtotal: 42000 },
        { productId: 'prod-119', productName: 'Panadol Extra Merah 10 Kaplet', quantity: 1, unitPrice: 14000, originalPrice: 14000, discountPerItem: 0, discountTotal: 0, subtotal: 14000 },
        { productId: 'prod-116', productName: 'Minyak Kayu Putih Cap Lang 60ml', quantity: 1, unitPrice: 23500, originalPrice: 23500, discountPerItem: 0, discountTotal: 0, subtotal: 23500 },
      ],
    },
    {
      id: 'tx-6',
      receiptNumber: 'BM-20260816-0006',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: 'shift-hist-5',
      subtotal: 61500,
      discountTotal: 2500,
      taxTotal: 0,
      total: 59000,
      paymentMethod: PaymentMethod.CASH,
      cashReceived: 100000,
      changeGiven: 41000,
      createdAt: new Date('2026-08-16T09:05:00Z'),
      items: [
        { productId: 'prod-92', productName: 'Rinso Molto Detergen Bubuk 770g', quantity: 1, unitPrice: 21500, originalPrice: 24000, discountPerItem: 2500, discountTotal: 2500, subtotal: 21500 },
        { productId: 'prod-95', productName: 'Downy Pelembut Pakaian Mystique 650ml', quantity: 1, unitPrice: 29500, originalPrice: 29500, discountPerItem: 0, discountTotal: 0, subtotal: 29500 },
        { productId: 'prod-90', productName: 'Sunlight Jeruk Nipis 700ml', quantity: 1, unitPrice: 16000, originalPrice: 16000, discountPerItem: 0, discountTotal: 0, subtotal: 16000 },
      ],
    },
    {
      id: 'tx-7',
      receiptNumber: 'BM-20260816-0007',
      cashierId: 'c-2',
      cashierName: 'Siti Rahmawati',
      shiftId: 'shift-hist-6',
      subtotal: 38500,
      discountTotal: 1500,
      taxTotal: 0,
      total: 37000,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-16T17:40:00Z'),
      items: [
        { productId: 'prod-60', productName: 'Chitato Sapi Panggang 68g', quantity: 2, unitPrice: 10000, originalPrice: 11500, discountPerItem: 1500, discountTotal: 3000, subtotal: 20000 },
        { productId: 'prod-13', productName: 'Pocari Sweat PET 500ml', quantity: 2, unitPrice: 8500, originalPrice: 8500, discountPerItem: 0, discountTotal: 0, subtotal: 17000 },
      ],
    },
    {
      id: 'tx-8',
      receiptNumber: 'BM-20260817-0008',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: null,
      subtotal: 124500,
      discountTotal: 2500,
      taxTotal: 0,
      total: 122000,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-17T14:15:00Z'),
      items: [
        { productId: 'prod-78', productName: 'Beras Setra Ramos Super 5kg', quantity: 1, unitPrice: 72500, originalPrice: 72500, discountPerItem: 0, discountTotal: 0, subtotal: 72500 },
        { productId: 'prod-80', productName: 'Minyak Goreng Bimoli Klasik 2L', quantity: 1, unitPrice: 36000, originalPrice: 38500, discountPerItem: 2500, discountTotal: 2500, subtotal: 36000 },
        { productId: 'prod-83', productName: 'Gula Pasir Gulaku Tebu 1kg', quantity: 1, unitPrice: 17500, originalPrice: 17500, discountPerItem: 0, discountTotal: 0, subtotal: 17500 },
      ],
    },
    {
      id: 'tx-9',
      receiptNumber: 'BM-20260818-0009',
      cashierId: 'c-2',
      cashierName: 'Siti Rahmawati',
      shiftId: null,
      subtotal: 35000,
      discountTotal: 0,
      taxTotal: 0,
      total: 35000,
      paymentMethod: PaymentMethod.CASH,
      cashReceived: 50000,
      changeGiven: 15000,
      createdAt: new Date('2026-08-18T11:20:00Z'),
      items: [
        { productId: 'prod-27', productName: 'Kopi Kapal Api Spesial Mix 10x24g', quantity: 1, unitPrice: 15000, originalPrice: 15000, discountPerItem: 0, discountTotal: 0, subtotal: 15000 },
        { productId: 'prod-31', productName: 'Good Day Cappuccino 10x25g', quantity: 1, unitPrice: 18500, originalPrice: 18500, discountPerItem: 0, discountTotal: 0, subtotal: 18500 },
        { productId: 'prod-72', productName: 'Beng Beng Cokelat Wafer 20g', quantity: 1, unitPrice: 2500, originalPrice: 2500, discountPerItem: 0, discountTotal: 0, subtotal: 2500 },
      ],
    },
    {
      id: 'tx-10',
      receiptNumber: 'BM-20260819-0010',
      cashierId: 'c-1',
      cashierName: 'Budi Santoso',
      shiftId: null,
      subtotal: 48500,
      discountTotal: 2500,
      taxTotal: 0,
      total: 46000,
      paymentMethod: PaymentMethod.QRIS,
      cashReceived: null,
      changeGiven: null,
      createdAt: new Date('2026-08-19T09:15:00Z'),
      items: [
        { productId: 'prod-10', productName: 'Teh Pucuk Harum 350ml', quantity: 3, unitPrice: 4000, originalPrice: 4000, discountPerItem: 0, discountTotal: 0, subtotal: 12000 },
        { productId: 'prod-38', productName: 'Indomie Goreng Spesial 85g', quantity: 4, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 14000 },
        { productId: 'prod-60', productName: 'Chitato Sapi Panggang 68g', quantity: 2, unitPrice: 10000, originalPrice: 11500, discountPerItem: 1500, discountTotal: 3000, subtotal: 20000 },
      ],
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: {
        id: tx.id,
        receiptNumber: tx.receiptNumber,
        cashierId: tx.cashierId,
        cashierName: tx.cashierName,
        shiftId: tx.shiftId,
        subtotal: tx.subtotal,
        discountTotal: tx.discountTotal,
        taxTotal: tx.taxTotal,
        total: tx.total,
        paymentMethod: tx.paymentMethod,
        cashReceived: tx.cashReceived,
        changeGiven: tx.changeGiven,
        createdAt: tx.createdAt,
        items: {
          create: tx.items.map((it, idx) => ({
            id: `ti-${tx.id}-${idx + 1}`,
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            originalPrice: it.originalPrice,
            discountPerItem: it.discountPerItem,
            discountTotal: it.discountTotal,
            subtotal: it.subtotal,
          })),
        },
      },
    });
  }
  console.log(`✅ 6. ${transactionsData.length} Riwayat Transaksi Lengkap (Multi-Item & Multi-Payment) berhasil dibuat.`);

  // 7. Seed Held Carts (2 Antrean Aktif di Kasir)
  const heldCartsData = [
    {
      id: 'hc-1',
      label: 'Antrean Meja 1 (Pelanggan Ambil Dompet)',
      customerName: 'Bpk. Hendra',
      note: 'Izin ke motor ambil uang tunai tambahan',
      total: 38500,
      heldAt: new Date(),
      items: [
        { productId: 'prod-8', productName: 'Teh Botol Sosro PET 450ml', quantity: 2, unitPrice: 6000, originalPrice: 7000, discountPerItem: 1000, discountTotal: 2000, subtotal: 12000 },
        { productId: 'prod-38', productName: 'Indomie Goreng Spesial 85g', quantity: 3, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 10500 },
        { productId: 'prod-60', productName: 'Chitato Sapi Panggang 68g', quantity: 1, unitPrice: 10000, originalPrice: 11500, discountPerItem: 1500, discountTotal: 1500, subtotal: 10000 },
        { productId: 'prod-1', productName: 'Aqua Air Mineral PET 600ml', quantity: 2, unitPrice: 3500, originalPrice: 3500, discountPerItem: 0, discountTotal: 0, subtotal: 7000 },
      ],
    },
    {
      id: 'hc-2',
      label: 'Antrean Meja 2 (Tambah Sembako)',
      customerName: 'Ibu Ratna',
      note: 'Sedang memilih beras tambahan di rak sembako',
      total: 87500,
      heldAt: new Date(),
      items: [
        { productId: 'prod-80', productName: 'Minyak Goreng Bimoli Klasik 2L', quantity: 1, unitPrice: 36000, originalPrice: 38500, discountPerItem: 2500, discountTotal: 2500, subtotal: 36000 },
        { productId: 'prod-83', productName: 'Gula Pasir Gulaku Tebu 1kg', quantity: 2, unitPrice: 17500, originalPrice: 17500, discountPerItem: 0, discountTotal: 0, subtotal: 35000 },
        { productId: 'prod-88', productName: 'Telur Ayam Negeri Segar 1kg', quantity: 1, unitPrice: 30000, originalPrice: 30000, discountPerItem: 0, discountTotal: 0, subtotal: 30000 },
      ],
    },
  ];

  for (const hc of heldCartsData) {
    await prisma.heldCart.create({
      data: {
        id: hc.id,
        label: hc.label,
        customerName: hc.customerName,
        note: hc.note,
        total: hc.total,
        heldAt: hc.heldAt,
        items: {
          create: hc.items.map((it, idx) => ({
            id: `hci-${hc.id}-${idx + 1}`,
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            originalPrice: it.originalPrice,
            discountPerItem: it.discountPerItem,
            discountTotal: it.discountTotal,
            subtotal: it.subtotal,
          })),
        },
      },
    });
  }
  console.log(`✅ 7. ${heldCartsData.length} Antrean Transaksi Tertunda (Held Carts) berhasil dibuat.`);

  // 8. Seed Stock Opname Audits (2 Riwayat Audit Fisik Selesai)
  const stockOpnameData = [
    {
      id: 'so-audit-1',
      auditDate: new Date('2026-08-15T16:00:00Z'),
      auditorName: 'Ahmad Faisal',
      notes: 'Audit bulanan fisik kategori minuman RTD dan sembako. Penyesuaian stok berhasil disinkronkan.',
      totalDiscrepancyValue: -38200,
      items: [
        { productId: 'prod-1', productName: 'Aqua Air Mineral PET 600ml', category: 'Minuman', systemStock: 122, physicalStock: 120, difference: -2, hpp: 2600, lossValue: 5200, reason: 'RUSAK' as const, notes: '2 botol bocor/penyok' },
        { productId: 'prod-7', productName: 'Teh Botol Sosro Kotak 250ml', category: 'Minuman', systemStock: 60, physicalStock: 60, difference: 0, hpp: 2800, lossValue: 0, reason: 'SESUAI' as const, notes: 'Sesuai' },
        { productId: 'prod-80', productName: 'Minyak Goreng Bimoli Klasik 2L', category: 'Sembako', systemStock: 31, physicalStock: 30, difference: -1, hpp: 33000, lossValue: 33000, reason: 'RUSAK' as const, notes: 'Kemasan sobek saat kirim' },
        { productId: 'prod-38', productName: 'Indomie Goreng Spesial 85g', category: 'Makanan', systemStock: 150, physicalStock: 150, difference: 0, hpp: 2900, lossValue: 0, reason: 'SESUAI' as const, notes: 'Sesuai fisik' },
      ],
    },
    {
      id: 'so-audit-2',
      auditDate: new Date('2026-08-18T18:30:00Z'),
      auditorName: 'Ahmad Faisal',
      notes: 'Audit mingguan etalase snack dan cokelat.',
      totalDiscrepancyValue: -9200,
      items: [
        { productId: 'prod-60', productName: 'Chitato Sapi Panggang 68g', category: 'Snack', systemStock: 36, physicalStock: 35, difference: -1, hpp: 9200, lossValue: 9200, reason: 'RUSAK' as const, notes: '1 pcs kemasan kempes' },
        { productId: 'prod-65', productName: 'Oreo Vanilla Cream 133g', category: 'Snack', systemStock: 40, physicalStock: 40, difference: 0, hpp: 8000, lossValue: 0, reason: 'SESUAI' as const, notes: 'Sesuai fisik' },
        { productId: 'prod-70', productName: 'SilverQueen Cashew 62g', category: 'Snack', systemStock: 30, physicalStock: 30, difference: 0, hpp: 13500, lossValue: 0, reason: 'SESUAI' as const, notes: 'Sesuai fisik' },
      ],
    },
  ];

  for (const so of stockOpnameData) {
    await prisma.stockOpnameAudit.create({
      data: {
        id: so.id,
        auditDate: so.auditDate,
        auditorName: so.auditorName,
        notes: so.notes,
        totalDiscrepancyValue: so.totalDiscrepancyValue,
        items: {
          create: so.items.map((it, idx) => ({
            id: `soi-${so.id}-${idx + 1}`,
            productId: it.productId,
            productName: it.productName,
            category: it.category,
            systemStock: it.systemStock,
            physicalStock: it.physicalStock,
            difference: it.difference,
            hpp: it.hpp,
            lossValue: it.lossValue,
            reason: it.reason,
            notes: it.notes,
          })),
        },
      },
    });
  }
  console.log(`✅ 8. ${stockOpnameData.length} Riwayat Sesi Audit Stok Opname berhasil dibuat.`);

  console.log('\n🎉 ======================================================');
  console.log('🚀 SEEDING DATABASE TOKOKU SELESAI 100% SUKSES!');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
