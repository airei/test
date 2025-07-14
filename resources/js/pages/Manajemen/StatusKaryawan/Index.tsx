import { Link, router } from '@inertiajs/react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import DataPageLayout from '@/components/data-page-layout';
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
  { title: 'Status Karyawan', href: '' },
];

interface EmployeeStatus {
    id: string;
    company_id?: string;
    plant_id?: string;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    company?: {
        id: string;
        name: string;
    };
    plant?: {
        id: string;
        name: string;
    };
}

interface Props {
    employeeStatuses: {
        data: EmployeeStatus[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters?: {
        search?: string;
    };
    isSuperAdmin?: boolean;
}

export default function StatusKaryawanIndex({ employeeStatuses, filters, isSuperAdmin }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        status: EmployeeStatus | null;
    }>({
        isOpen: false,
        status: null,
    });

    const handleDelete = (status: EmployeeStatus) => {
        setDeleteDialog({
            isOpen: true,
            status,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.status) {
            router.delete(`/manajemen/status-karyawan/${deleteDialog.status.id}`);
        }
        setDeleteDialog({ isOpen: false, status: null });
    };

    const cancelDelete = () => {
        setDeleteDialog({ isOpen: false, status: null });
    };

    return (
        <DataPageLayout
            breadcrumbs={breadcrumbs}
            title="Manajemen Status Karyawan"
            createRoute="/manajemen/status-karyawan/create"
            createLabel="Tambah Status"
            listRoute="/manajemen/status-karyawan"
            initialSearch={filters?.search || ''}
            searchPlaceholder="Cari Status Karyawan..."
        >
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">No.</th>
                                <th className="px-3 py-2 text-left">Nama Status</th>
                                <th className="px-3 py-2 text-left">Deskripsi</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeStatuses.data.map((status: EmployeeStatus, idx: number) => (
                                <tr key={status.id} className={`transition-colors duration-200 ${!status.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                                    <td className="px-3 py-2">{(employeeStatuses.current_page - 1) * employeeStatuses.per_page + idx + 1}</td>
                                    <td className="px-3 py-2 font-medium">{status.name}</td>
                                    <td className="px-3 py-2 text-gray-600">{status.description || '-'}</td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {status.company?.name || status.plant?.name ? (
                                            <>
                                                <div>Perusahaan: {status.company?.name || '-'}</div>
                                                <div>Plant: {status.plant?.name || '-'}</div>
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(`/manajemen/status-karyawan/${status.id}/edit`)}
                                                className="text-blue-600 hover:bg-blue-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.patch(`/manajemen/status-karyawan/${status.id}/toggle-status`, {}, {
                                                    onSuccess: () => router.reload()
                                                })}
                                                className={status.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                                            >
                                                {status.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(status)}
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
                {employeeStatuses.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                            Menampilkan {((employeeStatuses.current_page - 1) * employeeStatuses.per_page) + 1} - {Math.min(employeeStatuses.current_page * employeeStatuses.per_page, employeeStatuses.total)} dari {employeeStatuses.total} data
                        </p>
                        <div className="flex gap-2">
                            {employeeStatuses.links.map((link: any, index: number) => (
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
                if (!open) {
                    setDeleteDialog({ isOpen: false, status: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus status karyawan <strong>"{deleteDialog.status?.name}"</strong>?
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