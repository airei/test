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
  { title: 'Penjamin', href: '' },
];

interface Guarantor {
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
    guarantors: {
        data: Guarantor[];
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

export default function PenjaminIndex({ guarantors, filters, isSuperAdmin }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        guarantor: Guarantor | null;
    }>({
        isOpen: false,
        guarantor: null,
    });

    const handleDelete = (guarantor: Guarantor) => {
        setDeleteDialog({
            isOpen: true,
            guarantor,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.guarantor) {
            router.delete(`/manajemen/penjamin/${deleteDialog.guarantor.id}`);
        }
        setDeleteDialog({ isOpen: false, guarantor: null });
    };

    const cancelDelete = () => {
        setDeleteDialog({ isOpen: false, guarantor: null });
    };

    return (
        <DataPageLayout
            breadcrumbs={breadcrumbs}
            title="Manajemen Penjamin"
            createRoute="/manajemen/penjamin/create"
            createLabel="Tambah Penjamin"
            listRoute="/manajemen/penjamin"
            initialSearch={filters?.search || ''}
            searchPlaceholder="Cari Penjamin..."
        >
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">No.</th>
                                <th className="px-3 py-2 text-left">Penjamin</th>
                                <th className="px-3 py-2 text-left">Deskripsi</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guarantors.data.map((guarantor: Guarantor, idx: number) => (
                                <tr key={guarantor.id} className={`transition-colors duration-200 ${!guarantor.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                                    <td className="px-3 py-2">{(guarantors.current_page - 1) * guarantors.per_page + idx + 1}</td>
                                    <td className="px-3 py-2 font-medium">{guarantor.name}</td>
                                    <td className="px-3 py-2 text-gray-600">{guarantor.description || '-'}</td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {guarantor.company?.name || guarantor.plant?.name ? (
                                            <>
                                                <div>Perusahaan: {guarantor.company?.name || '-'}</div>
                                                <div>Plant: {guarantor.plant?.name || '-'}</div>
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(`/manajemen/penjamin/${guarantor.id}/edit`)}
                                                className="text-blue-600 hover:bg-blue-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.patch(`/manajemen/penjamin/${guarantor.id}/toggle-status`, {}, {
                                                    onSuccess: () => router.reload()
                                                })}
                                                className={guarantor.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                                            >
                                                {guarantor.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(guarantor)}
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
                {guarantors.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                            Menampilkan {((guarantors.current_page - 1) * guarantors.per_page) + 1} - {Math.min(guarantors.current_page * guarantors.per_page, guarantors.total)} dari {guarantors.total} data
                        </p>
                        <div className="flex gap-2">
                            {guarantors.links.map((link: any, index: number) => (
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
                    setDeleteDialog({ isOpen: false, guarantor: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus penjamin <strong>"{deleteDialog.guarantor?.name}"</strong>?
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