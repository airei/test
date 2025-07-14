import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowLeft, Package, TrendingUp, TrendingDown, RotateCcw, Plus, Minus, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen', href: '#' },
    { title: 'Inventory', href: route('inventory.index') },
    { title: 'History Obat', href: '' },
];

export default function AllHistory({ stockMovements, filters, user, companies, plants }: any) {
    const { data: search, setData: setSearch } = useForm({
        search: filters?.search || '',
        type: filters?.type || 'all',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        company_id: filters?.company_id || 'all',
        plant_id: filters?.plant_id || 'all',
    });

    const [availablePlants, setAvailablePlants] = useState(plants || []);
    const isSuperAdmin = user?.role?.name === 'super_admin';

    useEffect(() => {
        if (search.company_id && search.company_id !== 'all' && companies) {
            const selectedCompany = companies.find((c: any) => c.id.toString() === search.company_id);
            if (selectedCompany) {
                setAvailablePlants(selectedCompany.plants || []);
                // Reset plant selection if current plant doesn't belong to selected company
                if (search.plant_id && search.plant_id !== 'all' && !selectedCompany.plants?.find((p: any) => p.id.toString() === search.plant_id)) {
                    setSearch('plant_id', 'all');
                }
            }
        } else {
            setAvailablePlants(plants || []);
        }
    }, [search.company_id, companies, plants]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('inventory.all-history'), search, { preserveState: true });
    };

    const getMovementTypeIcon = (type: string) => {
        switch (type) {
            case 'in':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'out':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'adj':
                return <RotateCcw className="w-4 h-4 text-blue-600" />;
            case 'waste':
                return <AlertCircle className="w-4 h-4 text-orange-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    const getMovementTypeBadge = (type: string) => {
        switch (type) {
            case 'in':
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Plus className="w-3 h-3 mr-1" />
                        Masuk
                    </Badge>
                );
            case 'out':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                        <Minus className="w-3 h-3 mr-1" />
                        Keluar
                    </Badge>
                );
            case 'adj':
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Penyesuaian
                    </Badge>
                );
            case 'waste':
                return (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pembuangan
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <Package className="w-3 h-3 mr-1" />
                        Lainnya
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua History Obat" />
            <div className="mt-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('inventory.index')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Semua History Obat</h1>
                                <p className="text-gray-600 mt-1">Riwayat pergerakan stok semua item inventory</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-7' : 'lg:grid-cols-5'} gap-4`}>
                                <div>
                                    <Input
                                        placeholder="Cari nama item..."
                                        value={search.search}
                                        onChange={e => setSearch('search', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Select value={search.type} onValueChange={value => setSearch('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Jenis Pergerakan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Jenis</SelectItem>
                                            <SelectItem value="stock_in">Stok Masuk</SelectItem>
                                            <SelectItem value="stock_out">Stok Keluar</SelectItem>
                                            <SelectItem value="adjustment">Penyesuaian</SelectItem>
                                            <SelectItem value="waste">Pembuangan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {isSuperAdmin && (
                                    <>
                                        <div>
                                            <Select value={search.company_id} onValueChange={value => setSearch('company_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Company</SelectItem>
                                                    {companies?.map((company: any) => (
                                                        <SelectItem key={company.id} value={company.id.toString()}>
                                                            {company.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Select value={search.plant_id} onValueChange={value => setSearch('plant_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Plant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Plant</SelectItem>
                                                    {availablePlants?.map((plant: any) => (
                                                        <SelectItem key={plant.id} value={plant.id.toString()}>
                                                            {plant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="Tanggal Mulai"
                                        value={search.start_date}
                                        onChange={e => setSearch('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="Tanggal Akhir"
                                        value={search.end_date}
                                        onChange={e => setSearch('end_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Button type="submit" className="w-full bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                                        <Search className="w-4 h-4 mr-2" />
                                        Cari
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left">No.</th>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Item</th>
                                        {isSuperAdmin && (
                                            <>
                                                <th className="px-4 py-3 text-left">Company</th>
                                                <th className="px-4 py-3 text-left">Plant</th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-left">Jenis</th>
                                        <th className="px-4 py-3 text-left">Jumlah</th>
                                        <th className="px-4 py-3 text-left">Stok Sebelum</th>
                                        <th className="px-4 py-3 text-left">Stok Sesudah</th>
                                        <th className="px-4 py-3 text-left">Referensi</th>
                                        <th className="px-4 py-3 text-left">Keterangan</th>
                                        <th className="px-4 py-3 text-left">Dibuat Oleh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockMovements?.data?.length > 0 ? (
                                        stockMovements.data.map((movement: any, idx: number) => (
                                            <tr key={movement.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    {(stockMovements.current_page - 1) * stockMovements.per_page + idx + 1}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {formatDateTime(movement.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{movement.item?.name || '-'}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {movement.item?.category?.name || '-'}
                                                    </div>
                                                </td>
                                                {isSuperAdmin && (
                                                    <>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            <div className="font-medium">{movement.item?.company?.name || '-'}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {movement.item?.company?.code || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            <div className="font-medium">{movement.item?.plant?.name || '-'}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {movement.item?.plant?.code || '-'}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {getMovementTypeIcon(movement.type)}
                                                        {getMovementTypeBadge(movement.type)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">
                                                        {movement.quantity} {movement.item?.unit?.name || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {movement.stock_before} {movement.item?.unit?.name || ''}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {movement.stock_after} {movement.item?.unit?.name || ''}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {movement.reference || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {movement.notes || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {movement.created_by?.name || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 12 : 10} className="px-4 py-8 text-center text-gray-500">
                                                Tidak ada data history ditemukan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {stockMovements?.links && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex space-x-1">
                                    {stockMovements.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={link.active ? "bg-[#1b7fc4] hover:bg-[#1972af] text-white" : ""}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 