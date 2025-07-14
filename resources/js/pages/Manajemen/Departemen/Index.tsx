import { Link, router } from '@inertiajs/react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Power, PowerOff, Download, Upload, AlertTriangle } from 'lucide-react';
import DataPageLayout from '@/components/data-page-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
declare const route: any;

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Departemen', href: '' },
];

interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: { name: string } | null;
  plant?: { name: string } | null;
}

interface Props {
  departments: {
    data: Department[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
  };
  filters: {
    search?: string;
  };
  import_errors?: string[];
  canExport?: boolean;
  canImport?: boolean;
}

export default function Index({ departments, filters, import_errors, canExport, canImport }: Props) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({
    isOpen: false,
    department: null,
  });

  const handleToggleStatus = (department: Department) => {
    const url = route('departemen.toggle-status', department.id);
    router.patch(url, {}, {
      onSuccess: () => {
        router.visit(window.location.href);
      },
      onError: (errors) => {
        // Optional: tampilkan error ke user jika perlu
      },
    });
  };

  const handleDelete = (department: Department) => {
    setDeleteDialog({
      isOpen: true,
      department,
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.department) {
      router.delete(route('departemen.destroy', deleteDialog.department.id));
    }
    setDeleteDialog({ isOpen: false, department: null });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, department: null });
  };

  // Custom header actions untuk tombol export dan import
  const headerActions = (
    <div className="flex items-center gap-2">
      {canExport && (
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          onClick={() => window.open(route('departemen.export'), '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      )}
      {canImport && (
        <Link href={route('departemen.import')}>
          <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <DataPageLayout
      breadcrumbs={breadcrumbs}
      title="Manajemen Departemen"
      createRoute={route('departemen.create') as string}
      createLabel="Tambah Departemen"
      listRoute={route('departemen.index') as string}
      initialSearch={filters.search || ''}
      searchPlaceholder="Cari nama departemen..."
      headerActions={headerActions}
    >
      <CardContent>
        {/* Error Alert */}
        {import_errors && import_errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Terdapat {import_errors.length} error saat import:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {import_errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">No.</th>
                <th className="px-3 py-2 text-left">Nama Departemen</th>
                <th className="px-3 py-2 text-left">Deskripsi</th>
                <th className="px-3 py-2 text-left">Lokasi</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {departments.data.map((department: Department, idx: number) => (
                <tr key={department.id} className={`transition-colors duration-200 ${!department.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                  <td className="px-3 py-2">{(departments.current_page - 1) * departments.per_page + idx + 1}</td>
                  <td className="px-3 py-2 font-medium">{department.name}</td>
                  <td className="px-3 py-2 text-gray-600">{department.description || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {department.company?.name || department.plant?.name ? (
                      <>
                        <div>Perusahaan: {department.company?.name || '-'}</div>
                        <div>Plant: {department.plant?.name || '-'}</div>
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.get(route('departemen.edit', department.id))}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(department)}
                        className={department.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                      >
                        {department.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
        {departments.last_page > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Menampilkan {((departments.current_page - 1) * departments.per_page) + 1} - {Math.min(departments.current_page * departments.per_page, departments.total)} dari {departments.total} data
            </p>
            <div className="flex gap-2">
              {departments.links.map((link: any, index: number) => (
                <Link
                  key={index}
                  href={link.url}
                  className={`px-3 py-2 text-sm rounded ${
                    link.active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, department: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus departemen <strong>"{deleteDialog.department?.name}"</strong>?
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
    </DataPageLayout>
  );
}