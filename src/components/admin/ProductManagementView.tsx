'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Layers, Camera } from 'lucide-react';
import { Product } from '@/types/pos';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  TableCard,
  TableCardHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableEmptyState,
  TablePagination,
} from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { ProductFormModal } from './ProductFormModal';
import { ProductTableRow } from './ProductTableRow';
import { PosCameraScannerModal } from '@/components/pos/PosCameraScannerModal';

import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/actions/products';

interface ProductManagementViewProps {
  initialProducts: Product[];
  categories: string[];
}

export function ProductManagementView({
  initialProducts = [],
  categories = [],
}: ProductManagementViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isScanAddOpen, setIsScanAddOpen] = useState(false);
  const [initialScannedBarcode, setInitialScannedBarcode] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    if (initialProducts) setProducts(initialProducts);
  }, [initialProducts]);

  // Reset to page 1 on search or category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Filter products
  const filtered = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery.trim()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setInitialScannedBarcode(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setInitialScannedBarcode(null);
    setIsModalOpen(true);
  };

  const handleScanSuccess = (scannedBarcode: string) => {
    setIsScanAddOpen(false);
    setInitialScannedBarcode(scannedBarcode);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = async (prod: Product): Promise<boolean> => {
    if (editingProduct) {
      const res = await updateProductAction(prod.id, prod);
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? res.data! : p))
        );
        addToast('Produk Diperbarui', `Data produk "${prod.name}" berhasil diupdate.`, 'success');
        return true;
      } else {
        addToast('Gagal Memperbarui', res.error || 'Terjadi kesalahan.', 'danger');
        return false;
      }
    } else {
      const res = await createProductAction(prod);
      if (res.success && res.data) {
        setProducts((prev) => [res.data!, ...prev]);
        addToast('Produk Ditambahkan', `Produk baru "${prod.name}" telah terdaftar.`, 'success');
        return true;
      } else {
        addToast('Gagal Menambah', res.error || 'Terjadi kesalahan.', 'danger');
        return false;
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const res = await deleteProductAction(productToDelete.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        addToast('Produk Dihapus', `Produk "${productToDelete.name}" telah dihapus.`, 'warning');
      } else {
        addToast('Gagal Menghapus', res.error || 'Terjadi kesalahan.', 'danger');
      }
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Action Buttons */}
      <PageHeader
        title="Master Data Produk & Program Promo"
        description="Kelola katalog SKU, nomor barcode fisik, harga modal, harga promo terpusat, dan stok barang."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsScanAddOpen(true)}
              className="border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 font-bold gap-2 shrink-0 shadow-xs cursor-pointer"
              title="Scan Barcode Kemasan untuk Menambah Produk Baru"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Scan Barcode</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shrink-0 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </Button>
          </div>
        }
      />

      {/* Products Table */}
      <TableCard>
        <TableCardHeader>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Katalog Produk &amp; Stok
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filtered.length !== products.length
                ? `Ditemukan ${filtered.length} produk dari filter / pencarian`
                : `Total ${products.length} produk terdaftar dalam katalog`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Cari nama, barcode, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="w-full sm:w-auto">
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                labelPrefix="Kategori:"
                icon={<Layers className="w-4 h-4 text-blue-600" />}
                variant="filter"
                align="right"
                menuClassName="w-56"
              />
            </div>
          </div>
        </TableCardHeader>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>No. / Barcode / SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead align="right">Harga Modal (HPP)</TableHead>
              <TableHead align="right">Harga Jual Kasir</TableHead>
              <TableHead align="center">Status Promo</TableHead>
              <TableHead align="center">Stok</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyState
                colSpan={8}
                icon={<Package className="w-10 h-10 mx-auto mb-2 opacity-50 stroke-[1.5]" />}
                title="Tidak ada produk yang sesuai dengan filter"
                description="Coba ubah kata kunci pencarian atau pilih kategori lain."
              />
            ) : (
              paginatedProducts.map((prod) => (
                <ProductTableRow
                  key={prod.id}
                  product={prod}
                  onEdit={handleOpenEdit}
                  onDelete={(target) => setProductToDelete(target)}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="produk"
        />
      </TableCard>

      {/* CRUD Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialScannedBarcode(null);
        }}
        productToEdit={editingProduct}
        initialBarcode={initialScannedBarcode}
        categories={categories}
        onSave={handleSave}
      />

      {/* Header Camera Barcode Scanner for Add Product */}
      <PosCameraScannerModal
        isOpen={isScanAddOpen}
        onClose={() => setIsScanAddOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Professional Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk dari Katalog?"
        description={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Produk"
        cancelLabel="Batal"
        variant="danger"
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
