import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Power, PowerOff, Download, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Laboratorium', href: '' },
];

export default function LaboratoriumIndex({ labMasters, filters, canExport, canImport }: any) {
  const { data: search, setData: setSearch } = useForm({
    search: filters?.search || '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string | null;
  }>({
    isOpen: false,
    id: null,
    name: null,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('laboratorium.index'), { search: search.search }, { preserveState: true });
  };

  const handleToggleStatus = (id: string) => {
    router.patch(route('laboratorium.toggle-status', id));
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      id,
      name,
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.id) {
      router.delete(route('laboratorium.destroy', deleteDialog.id));
    }
    setDeleteDialog({ isOpen: false, id: null, name: null });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, id: null, name: null });
  };

  const getReferenceDisplay = (references: any[]) => {
    if (!references || references.length === 0) {
      return { types: '-', values: '-' };
    }

    // Urutkan referensi: male, female, universal
    const sortedReferences = references.sort((a, b) => {
      const order = { male: 1, female: 2, universal: 3 };
      return (order[a.reference_type as keyof typeof order] || 4) - (order[b.reference_type as keyof typeof order] || 4);
    });

    const types = sortedReferences.map(ref => {
      switch (ref.reference_type) {
        case 'universal': return 'Universal';
        case 'male': return 'Laki-laki';
        case 'female': return 'Perempuan';
        default: return ref.reference_type;
      }
    }).join(', ');

    const values = sortedReferences.map(ref => ref.reference).join(', ');

    return { types, values };
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Laboratorium" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Laboratorium</h1>
          </div>
          <div className="flex items-center gap-2">
            {canExport && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                onClick={() => window.open(route('laboratorium.export'), '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            )}
            {canImport && (
              <Link href={route('laboratorium.import')}>
                <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>
              </Link>
            )}
          <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
            <Link href={route('laboratorium.create')}><Plus className="w-4 h-4 mr-2" />Tambah Laboratorium</Link>
          </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Cari nama pemeriksaan atau unit..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
              </div>
              <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white"><Search className="w-4 h-4 mr-2" />Cari</Button>
            </form>
          </CardContent>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">No.</th>
                    <th className="px-3 py-2 text-left">Nama Pemeriksaan Lab</th>
                    <th className="px-3 py-2 text-left">Jenis Referensi</th>
                    <th className="px-3 py-2 text-left">Value Referensi</th>
                    <th className="px-3 py-2 text-left">Harga</th>
                    <th className="px-3 py-2 text-left">Lokasi</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {labMasters.data.map((labMaster: any, idx: number) => {
                    const referenceDisplay = getReferenceDisplay(labMaster.references);
                    
                    return (
                      <tr key={labMaster.id} className={`transition-colors duration-200 ${!labMaster.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                        <td className="px-3 py-2">{(labMasters.current_page - 1) * labMasters.per_page + idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{labMaster.name}</td>
                        <td className="px-3 py-2 text-gray-600">
                          <span className="text-xs">{referenceDisplay.types}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          <span className="text-xs">{referenceDisplay.values}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {formatCurrency(labMaster.price)}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          <div className="text-xs">
                            <div>Perusahaan: {labMaster.company?.name || '-'}</div>
                            <div>Plant: {labMaster.plant?.name || '-'}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.get(route('laboratorium.edit', labMaster.id))}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(labMaster.id)}
                              className={labMaster.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                            >
                              {labMaster.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(labMaster.id, labMaster.name)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Keterangan warna */}
            <div className="mt-4 flex gap-6 text-sm items-center">
              <span className="text-gray-500 font-bold">Keterangan Warna :</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-[#F0D9D9] hover:bg-[#FBDBDD] border border-gray-300"></span>
                <span>Tidak Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-white hover:bg-[#F5F5F5] border border-gray-300"></span>
                <span>Aktif</span>
              </div>
            </div>
            {/* Pagination */}
            {labMasters.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((labMasters.current_page - 1) * labMasters.per_page) + 1} - {Math.min(labMasters.current_page * labMasters.per_page, labMasters.total)} dari {labMasters.total} data
                </p>
                <div className="flex gap-2">
                  {labMasters.links.map((link: any, index: number) => (
                    <Link
                      key={index}
                      href={link.url}
                      className={`px-3 py-2 text-sm rounded ${
                        link.active
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, id: null, name: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pemeriksaan laboratorium <strong>"{deleteDialog.name}"</strong>?
              <br />
              <span className="text-red-600 text-sm">Tindakan ini tidak dapat dibatalkan.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
} 