# 🛒 TOKOKU MINIPOS - Sistem Kasir & Manajemen Ritel Cepat & Andal

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

**TOKOKU MINIPOS** adalah sistem kasir (*Point of Sale*) dan manajemen gerai minimarket modern berbasis web yang dirancang khusus untuk memenuhi kebutuhan operasional ritel di Indonesia. Aplikasi ini menggabungkan kecepatan transaksi meja kasir dengan kelengkapan analisis data back-office administrator secara *real-time*.

Dibangun dengan arsitektur **Component-First**, **Next.js 16 App Router**, **Server Actions**, serta didukung oleh **PostgreSQL (via Supabase)** dan **Prisma ORM**.

---

## 🌟 Fitur Utama

### 1. Terminal POS Kasir (`/`)
* **🔒 Layar Kunci Terminal (*POS Lock Screen Barrier*)**:
  * Proteksi meja kasir penuh (*full-screen barrier*) agar katalog, keranjang, dan harga tidak dapat diakses tanpa autentikasi.
  * Autentikasi instan 4-digit PIN dengan kartu pemilih akun (Petugas Kasir & Administrator).
  * **🛡️ Rate Limiting & Cooldown Lockout Persisten**: Jika salah memasukkan PIN sebanyak 3x, terminal otomatis terkunci selama 30 detik. Hitungan mundur tersimpan secara *wall-clock* di browser sehingga tidak dapat di-reset dengan me-refresh tab (F5).
  * Tombol 1-klik **"Kunci POS (F10)"** pada header kasir untuk mengamankan meja kasir saat operator meninggalkan laci uang.
* **⚡ Input Cepat & Barcode Scanning**:
  * Mendukung *physical barcode scanner hardware* (keyboard wedge mode) dengan debounce otomatis.
  * Dilengkapi pemindai kamera bawaan (*In-App Camera Scanner*) via HTML5-QRCode (`F2`).
  * Web Audio API Pure Sound Synthesis (*scanner beep*, *success cash chime*, *error buzzer*).
* **🛒 Keranjang Belanja Persisten (*Auto-Restore Active Cart*)**:
  * Transaksi yang sedang di-*scan* otomatis tersimpan secara real-time. Jika browser tidak sengaja di-refresh atau tertutup, seluruh item belanjaan tetap utuh di keranjang kasir.
* **🔢 Touch Numpad & Quick Multipliers**:
  * Pengaturan kuantitas cepat (+1, -1, +5, +10, dan +20 Dus/Karton).
  * Dukungan numpad keyboard fisik langsung (*numeric keypad listener*).
  * **Pintasan Tombol Keyboard Operasional**:
    * `F2`: Buka Kamera Barcode Scanner
    * `F3`: Riwayat Transaksi & Cetak Ulang Struk
    * `F4`: Fokus Input Scan Barcode / Cari Produk
    * `F7`: Tahan Antrean Transaksi (*Hold Cart*)
    * `F10`: Kunci Layar Terminal Kasir
    * `F12`: Buka / Tutup Shift Kasir
    * `Space` / `F9`: Buka Modal Pembayaran & Kembalian
    * `Esc`: Tutup Modal / Batalkan Dialog
* **🎁 Mesin Promo & Diskon Terpusat**:
  * Potongan harga otomatis (*percentage discount* & *nominal discount*) yang diatur terpusat oleh Admin.
  * Tampilan hemat promo langsung tercetak pada struk belanja.
* **⏸️ Antrean Tertahan (Hold & Resume Cart)**:
  * Fitur menahan belanjaan pelanggan yang tertunda tanpa mengganggu antrean pelanggan lain (`F7`).
  * Penamaan antrean otomatis beserta catatan khusus.
* **💳 Multi-Metode Pembayaran**:
  * **Tunai (Cash)**: Kalkulator nominal cepat (Uang Pas, Pecahan 10k, 20k, 50k, 100k) dan hitung kembalian otomatis tebal berwarna hijau.
  * **QRIS Statis & Dinamis**: Tampilan QR Code standar Indonesia dengan aset lokal `/qris-demo.png` berkecepatan tinggi dan tombol simulasi webhook lunas.
* **🧾 E-Struk Digital & Cetak Thermal**:
  * Format struk minimarket Indonesia lengkap dengan nomor faktur anti-tabrakan `BM-YYYYMMDD-XXXX`.
  * Kirim struk belanja langsung ke **WhatsApp** pelanggan dengan 1-klik.
  * Salin teks struk ke *clipboard* atau unduh file `.txt`.
  * Format cetak kertas thermal printer standar (58mm / 80mm).
* **⏰ Manajemen Shift & Rekonsiliasi Kas (*Blind Count*)**:
  * Pembukaan shift dengan input modal awal uang kembalian.
  * Penutupan shift dengan sistem *blind count* (kasir menghitung kas fisik tanpa melihat ekspektasi sistem terlebih dahulu untuk mencegah *fraud*).
  * Pencatatan selisih kas (*difference*) otomatis ke database.

---

### 2. Panel Administrasi & Back-Office (`/admin`)
* **📊 Dashboard Analitik Real-Time (`/admin`)**:
  * Total omset penjualan harian/bulanan, laba kotor (*gross profit*), dan jumlah transaksi.
  * Indikator peringatan stok menipis (*low-stock threshold*).
  * Grafik performa penjualan interaktif (*Sales Chart*) dan sebaran metode pembayaran (Cash vs QRIS).
  * Tabel Top 5 Produk paling laris berdasarkan volume terjual.
* **📦 Master Katalog Produk (`/admin/products`)**:
  * Manajemen 126 produk ritel FMCG populer Indonesia lengkap dengan barcode resmi GS1 `899...`.
  * Penentuan Harga Pokok Penjualan (HPP Modal), Harga Jual Kasir, dan program diskon promo.
  * Auto-lookup informasi produk via Open Food Facts API saat scan barcode baru.
  * **Paginasi Tabel Reusable**: Pilihan baris `10`, `25`, `50`, `100`, atau `Semua`.
* **📋 Audit Stok Opname Fisik (`/admin/inventory`)**:
  * Pencocokan stok sistem vs hitungan fisik rak gudang.
  * Perhitungan otomatis potensi nilai kerugian finansial (*loss value*) akibat selisih barang.
  * Klasifikasi alasan selisih: `SESUAI`, `RUSAK`, `KADALUARSA`, `SELISIH_HITUNG`, `RETUR`, atau `LAINNYA`.
  * Penyesuaian stok master instan secara atomik.
* **📑 Laporan Penjualan & Transaksi (`/admin/reports`)**:
  * Jurnal riwayat struk penjualan lengkap dengan filter rentang tanggal (*Hari Ini, Kemarin, 7 Hari, 30 Hari, Bulan Ini, Kustom*).
  * Detail rincian struk dan cetak ulang faktur.
* **👥 Manajemen Staf Kasir & Hak Akses (`/admin/cashiers`)**:
  * Pendaftaran akun kasir baru dan pengaturan PIN operasional.
  * Privasi PIN terproteksi dan peran Administrator terkunci permanen.
  * Pelacakan akumulasi volume penjualan dan total shift yang diselesaikan tiap staf.
  * Modal riwayat rekap shift mendalam (*detailed shift log audit*).
* **⚙️ Pengaturan Toko & Master 4-Shift (`/admin/settings`)**:
  * Konfigurasi identitas gerai: Nama Toko (**`TOKOKU`**), Tagline, Alamat, No. Telp, dan Footer Struk Ramah.
  * Pengaturan upload QRIS toko dan Pajak PPN.
  * Kustomisasi jadwal master 4 Shift operasional:
    * **Shift 1 (Pagi)**: 07:00 - 15:00
    * **Shift 2 (Siang)**: 15:00 - 23:00
    * **Shift 3 (Malam)**: 23:00 - 07:00
    * **Shift 4 (Gerai 24 Jam)**: 00:00 - 24:00

---

## 🔑 Kredensial Akun Bawaan (Default Seed)

| Nama Akun | Peran / Role | Email / ID | Password | PIN Kasir | Keterangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Ahmad Faisal** | `Super Admin` | `admin@tokoku.com` | `admin123` | **`9999`** | Akses penuh Back-Office & POS |
| **Budi Santoso** | `Kasir` | `budi@tokoku.com` | - | **`1234`** | Kasir Shift Pagi |
| **Siti Rahmawati** | `Kasir` | `siti@tokoku.com` | - | **`2345`** | Kasir Shift Siang |
| **Dedi Pratama** | `Kasir` | `dedi@tokoku.com` | - | **`3456`** | Kasir Shift Malam |
| **Anita Kusuma** | `Kasir` | `anita@tokoku.com` | - | **`4567`** | Kasir Shift 24 Jam |

---

## 🏗️ Struktur Direktori Proyek (Component-First)

```
minipos-app/
├── prisma/
│   ├── schema.prisma       # Skema database PostgreSQL (Prisma Client v7)
│   └── seed.ts             # Database seeder lengkap (126 produk, 5 user, 6 shift, 10 struk)
├── public/
│   ├── qris-demo.png       # Aset QRIS lokal toko TOKOKU
│   └── manifest.json       # Manifest Progressive Web App (PWA)
├── scripts/
│   ├── test-e2e.ts         # Automated E2E test suite (17/17 tests pass)
│   └── cleanup-test-data.ts# Pembersih data sampah testing
├── src/
│   ├── actions/            # Server Actions (Autentikasi, Produk, Transaksi, Kasir, Shift)
│   ├── app/                # Next.js 16 App Router (Rute `/` POS Kasir & `/admin/*`)
│   ├── components/
│   │   ├── admin/          # Komponen Back-Office Admin (Dashboard, Produk, Opname, Laporan)
│   │   ├── pos/            # Komponen Terminal Kasir (LockScreen, Keranjang, Numpad, Modal Bayar)
│   │   └── ui/             # Komponen Dasar Reusable (Button, Modal, Table, TablePagination, Toast)
│   ├── lib/                # Utility (AuthGuard, Prisma Client, Sound Synthesis, MockData)
│   └── types/              # Deklarasi tipe TypeScript POS & Ritel
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat Sistem
* **Node.js**: versi 20.x atau 22.x LTS
* **Database**: PostgreSQL (direkomendasikan via [Supabase](https://supabase.com))

### 2. Instalasi Dependensi
```bash
git clone https://github.com/arifinnh31/minipos-app.git
cd minipos-app
npm install
```

### 3. Konfigurasi Environment Variable (`.env`)
Buat file `.env` di root direktori proyek:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
```

### 4. Sinkronisasi Skema & Seeding Database
```bash
npx prisma db push
npx prisma db seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000` untuk Terminal POS Kasir dan `http://localhost:3000/admin` untuk Portal Administrator.

### 6. Pengujian & Kompilasi Produksi
```bash
# Menjalankan simulasi pengujian E2E otomatis
npx tsx scripts/test-e2e.ts

# Linter ESLint
npm run lint

# Kompilasi Next.js Turbopack Production Build
npm run build
```

---

## 📄 Lisensi
Hak Cipta (c) 2026 **TOKOKU MINIPOS**. Dilisensikan di bawah [MIT License](LICENSE). Dikembangkan untuk operasional kasir minimarket modern Indonesia. 🇮🇩🛒✨
