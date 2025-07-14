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
declare const route: any;

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Shift', href: '' },
];

interface Shift {
    id: string;
    company_id?: string;
    plant_id?: string;
    name: string;
    start_time: string;
    end_time: string;
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
    shifts: {
        data: Shift[];
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

export default function ShiftIndex({ shifts, filters, isSuperAdmin }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        shift: Shift | null;
    }>({
        isOpen: false,
        shift: null,
    });

    const handleDelete = (shift: Shift) => {
        setDeleteDialog({
            isOpen: true,
            shift,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.shift) {
            router.delete(`/manajemen/shift/${deleteDialog.shift.id}`);
        }
        setDeleteDialog({ isOpen: false, shift: null });
    };

    const cancelDelete = () => {
        setDeleteDialog({ isOpen: false, shift: null });
    };

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <DataPageLayout
            breadcrumbs={breadcrumbs}
            title="Manajemen Shift"
            createRoute="/manajemen/shift/create"
            createLabel="Tambah Shift"
            listRoute="/manajemen/shift"
            initialSearch={filters?.search || ''}
            searchPlaceholder="Cari Shift..."
        >
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">No.</th>
                                <th className="px-3 py-2 text-left">Nama Shift</th>
                                <th className="px-3 py-2 text-left">Waktu</th>
                                <th className="px-3 py-2 text-left">Deskripsi</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.data.map((shift: Shift, idx: number) => (
                                <tr key={shift.id} className={`transition-colors duration-200 ${!shift.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                                    <td className="px-3 py-2">{(shifts.current_page - 1) * shifts.per_page + idx + 1}</td>
                                    <td className="px-3 py-2 font-medium">{shift.name}</td>
                                    <td className="px-3 py-2 text-gray-600">{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</td>
                                    <td className="px-3 py-2 text-gray-600">{shift.description || '-'}</td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {shift.company?.name || shift.plant?.name ? (
                                            <>
                                                <div>Perusahaan: {shift.company?.name || '-'}</div>
                                                <div>Plant: {shift.plant?.name || '-'}</div>
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(`/manajemen/shift/${shift.id}/edit`)}
                                                className="text-blue-600 hover:bg-blue-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.patch(route('shift.toggle-status', shift.id))}
                                                className={shift.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                                            >
                                                {shift.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(shift)}
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
                {shifts.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                            Menampilkan {((shifts.current_page - 1) * shifts.per_page) + 1} - {Math.min(shifts.current_page * shifts.per_page, shifts.total)} dari {shifts.total} data
                        </p>
                        <div className="flex gap-2">
                            {shifts.links.map((link: any, index: number) => (
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
                    setDeleteDialog({ isOpen: false, shift: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus shift <strong>"{deleteDialog.shift?.name}"</strong>?
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