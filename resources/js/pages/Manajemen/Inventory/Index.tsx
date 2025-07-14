import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Power, PowerOff, Eye, Package, FolderOpen, Ruler, Download, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';
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
    { title: 'Inventory', href: '' },
];

// Komponen Sidebar untuk Desktop
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const navItems = [
        { value: 'items', label: 'Item Inventory', icon: Package },
        { value: 'categories', label: 'Kategori', icon: FolderOpen },
        { value: 'units', label: 'Unit', icon: Ruler },
    ];

    return (
        // 'flex-shrink-0' ditambahkan agar sidebar tidak menyusut
        <div className="hidden lg:block w-56 flex-shrink-0">
            <Card>
                <CardContent className="p-2">
                    <div className="flex flex-col w-full space-y-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.value}
                                variant={activeTab === item.value ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-2 px-4 py-2 text-sm font-medium"
                                onClick={() => setActiveTab(item.value)}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


export default function InventoryIndex({ inventoryItems, categories, units, filters, activeTab: initialActiveTab }: any) {
    const [activeTab, setActiveTab] = useState(initialActiveTab || 'items');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        id: string | null;
        type: string | null;
        name: string | null;
    }>({
        isOpen: false,
        id: null,
        type: null,
        name: null,
    });

    const { data: search, setData: setSearch } = useForm({
        search: filters?.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName =
            activeTab === 'items'
                ? 'inventory.index'
                : activeTab === 'categories'
                    ? 'inventory.category.index'
                    : 'inventory.unit.index';
        router.get(route(routeName), { search: search.search }, { preserveState: true });
    };

    const handleToggleStatus = (id: string, type: string) => {
        const routeName =
            type === 'item'
                ? 'inventory.toggle-status'
                : type === 'category'
                    ? 'inventory.category.toggle-status'
                    : 'inventory.unit.toggle-status';
        router.patch(route(routeName, id), {}, { onSuccess: () => router.reload() });
    };

    const handleDelete = (id: string, type: string, name: string) => {
        setDeleteDialog({
            isOpen: true,
            id,
            type,
            name,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.id && deleteDialog.type) {
            // Map type to correct route name
            let routeName;
            if (deleteDialog.type === 'item') {
                routeName = 'inventory.destroy';
            } else if (deleteDialog.type === 'category') {
                routeName = 'inventory.category.destroy';
            } else if (deleteDialog.type === 'unit') {
                routeName = 'inventory.unit.destroy';
            } else {
                console.error('Unknown delete type:', deleteDialog.type);
                return;
            }
            
            router.delete(route(routeName, deleteDialog.id));
        }
        setDeleteDialog({ isOpen: false, id: null, type: null, name: null });
    };

    const cancelDelete = () => {
        setDeleteDialog({ isOpen: false, id: null, type: null, name: null });
    };

    const handleEditClick = (id: string, type: string = 'item') => {
        // Simpan URL saat ini ke sessionStorage
        const currentUrl = window.location.href;
        sessionStorage.setItem('inventory_edit_previous_url', currentUrl);
        
        // Navigasi ke halaman edit
        if (type === 'item') {
            router.get(route('inventory.edit', id));
        } else if (type === 'category') {
            router.get(route('inventory.category.edit', id));
        } else if (type === 'unit') {
            router.get(route('inventory.unit.edit', id));
        }
    };

    const getStockStatus = (stock: number, minStock: number) => {
        if (stock <= 0) return { 
            variant: 'destructive' as const, 
            text: 'Habis',
            className: 'bg-red-100 text-red-800 border-red-200'
        };
        if (stock <= minStock) return { 
            variant: 'secondary' as const, 
            text: 'Stok Menipis',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return { 
            variant: 'default' as const, 
            text: 'Tersedia',
            className: 'bg-green-100 text-green-800 border-green-200'
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Inventory" />
            <div className="mt-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Manajemen Inventory</h1>
                        <p className="text-gray-600 mt-1">Kelola item inventory, kategori, dan unit dalam satu halaman.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            onClick={() => window.open(route('inventory.export'), '_blank')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                        <Link href={route('inventory.import')}>
                            <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                                <Upload className="mr-2 h-4 w-4" />
                                Import Excel
                            </Button>
                        </Link>
                        <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                            <Link href={route('inventory.all-history')}>
                                <>
                                    <Package className="w-4 h-4 mr-2" />
                                    Semua History Obat
                                </>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ===== STRUKTUR UTAMA DENGAN FLEXBOX LAYOUT ===== */}
                <div className="lg:flex lg:flex-row lg:gap-8 lg:items-start">

                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="flex-1 min-w-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                            <div className="block lg:hidden mb-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="items" className="gap-2"> <Package className="w-4 h-4" /> <span className="hidden sm:inline">Item</span> </TabsTrigger>
                                    <TabsTrigger value="categories" className="gap-2"> <FolderOpen className="w-4 h-4" /> <span className="hidden sm:inline">Kategori</span> </TabsTrigger>
                                    <TabsTrigger value="units" className="gap-2"> <Ruler className="w-4 h-4" /> <span className="hidden sm:inline">Unit</span> </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* === KONTEN TAB ITEM === */}
                            <TabsContent value="items">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Daftar Item Inventory</h2>
                                        <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                                            <Link href={route('inventory.create')}>
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tambah Item
                                                </>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleSearch} className="flex gap-4">
                                                <div className="flex-1">
                                                    <Input placeholder="Cari nama item atau deskripsi..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
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
                                                            <th className="px-3 py-2 text-left">Nama Item</th>
                                                            <th className="px-3 py-2 text-left">Harga</th>
                                                            <th className="px-3 py-2 text-left">Stok</th>
                                                            <th className="px-3 py-2 text-left">Lokasi</th>
                                                            <th className="px-3 py-2 text-left">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {inventoryItems?.data?.map((item: any, idx: number) => {
                                                            const stockStatus = getStockStatus(item.stock, item.min_stock);
                                                            return (
                                                                <tr key={item.id} className={`transition-colors duration-200 ${item.is_active == 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}>
                                                                    <td className="px-3 py-2">{(inventoryItems.current_page - 1) * inventoryItems.per_page + idx + 1}</td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="font-medium">{item.name}</div>
                                                                        <div className="text-xs text-gray-500 mt-1">Kategori: {item.category?.name || '-'}</div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-gray-600">{formatCurrency(item.price)}</td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="text-gray-600">{item.stock} {item.unit?.name || ''}</div>
                                                                        <div className="mt-1"><Badge variant={stockStatus.variant} className={stockStatus.className}>{stockStatus.text}</Badge></div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-gray-600">
                                                                        <div className="text-xs">
                                                                            <div>Perusahaan: {item.company?.name || '-'}</div>
                                                                            <div>Plant: {item.plant?.name || '-'}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <Button variant="ghost" size="sm" onClick={() => router.get(route('inventory.show', item.id))} className="text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></Button>
                                                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(item.id, 'item')} className="text-blue-600 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                                                                            <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(item.id, 'item')} className={item.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}>{item.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}</Button>
                                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id, 'item', item.name)} className="text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Pagination untuk Items */}
                                            {inventoryItems?.last_page > 1 && (
                                                <div className="flex items-center justify-between mt-6">
                                                    <p className="text-sm text-gray-500">
                                                        Menampilkan {((inventoryItems.current_page - 1) * inventoryItems.per_page) + 1} - {Math.min(inventoryItems.current_page * inventoryItems.per_page, inventoryItems.total)} dari {inventoryItems.total} data
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {inventoryItems.links.map((link: any, index: number) => (
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
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* === KONTEN TAB KATEGORI === */}
                            <TabsContent value="categories">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Daftar Kategori</h2>
                                        <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                                            <Link href={route('inventory.category.create')}>
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tambah Kategori
                                                </>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleSearch} className="flex gap-4">
                                                <div className="flex-1">
                                                    <Input placeholder="Cari nama kategori..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
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
                                                            <th className="px-3 py-2 text-left">Nama Kategori</th>
                                                            <th className="px-3 py-2 text-left">Deskripsi</th>
                                                            <th className="px-3 py-2 text-left">Lokasi</th>
                                                            <th className="px-3 py-2 text-left">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categories?.data?.map((category: any, idx: number) => (
                                                            <tr key={category.id} className={`transition-colors duration-200 ${category.is_active == 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}>
                                                                <td className="px-3 py-2">{(categories.current_page - 1) * categories.per_page + idx + 1}</td>
                                                                <td className="px-3 py-2 font-medium">{category.name}</td>
                                                                <td className="px-3 py-2 text-gray-600">{category.description || '-'}</td>
                                                                <td className="px-3 py-2 text-gray-600">
                                                                    <div className="text-xs">
                                                                        <div>Perusahaan: {category.company?.name || '-'}</div>
                                                                        <div>Plant: {category.plant?.name || '-'}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(category.id, 'category')} className="text-blue-600 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                                                                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(category.id, 'category')} className={category.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}>{category.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}</Button>
                                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id, 'category', category.name)} className="text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Pagination untuk Categories */}
                                            {categories?.last_page > 1 && (
                                                <div className="flex items-center justify-between mt-6">
                                                    <p className="text-sm text-gray-500">
                                                        Menampilkan {((categories.current_page - 1) * categories.per_page) + 1} - {Math.min(categories.current_page * categories.per_page, categories.total)} dari {categories.total} data
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {categories.links.map((link: any, index: number) => (
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
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* === KONTEN TAB UNIT === */}
                            <TabsContent value="units">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Daftar Unit</h2>
                                        <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                                            <Link href={route('inventory.unit.create')}>
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tambah Unit
                                                </>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleSearch} className="flex gap-4">
                                                <div className="flex-1">
                                                    <Input placeholder="Cari nama unit..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
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
                                                            <th className="px-3 py-2 text-left">Nama Unit</th>
                                                            <th className="px-3 py-2 text-left">Deskripsi</th>
                                                            <th className="px-3 py-2 text-left">Lokasi</th>
                                                            <th className="px-3 py-2 text-left">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {units?.data?.map((unit: any, idx: number) => (
                                                            <tr key={unit.id} className={`transition-colors duration-200 ${unit.is_active == 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}>
                                                                <td className="px-3 py-2">{(units.current_page - 1) * units.per_page + idx + 1}</td>
                                                                <td className="px-3 py-2 font-medium">{unit.name}</td>
                                                                <td className="px-3 py-2 text-gray-600">{unit.description || '-'}</td>
                                                                <td className="px-3 py-2 text-gray-600">
                                                                    <div className="text-xs">
                                                                        <div>Perusahaan: {unit.company?.name || '-'}</div>
                                                                        <div>Plant: {unit.plant?.name || '-'}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(unit.id, 'unit')} className="text-blue-600 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                                                                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(unit.id, 'unit')} className={unit.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}>{unit.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}</Button>
                                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id, 'unit', unit.name)} className="text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Pagination untuk Units */}
                                            {units?.last_page > 1 && (
                                                <div className="flex items-center justify-between mt-6">
                                                    <p className="text-sm text-gray-500">
                                                        Menampilkan {((units.current_page - 1) * units.per_page) + 1} - {Math.min(units.current_page * units.per_page, units.total)} dari {units.total} data
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {units.links.map((link: any, index: number) => (
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
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* ===== POSISI BARU KETERANGAN WARNA ===== */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center pt-4 border-t mt-6">
                            <span className="text-gray-600 font-semibold">Ket. warna:</span>
                            <div className="flex items-center gap-2"> <span className="inline-block w-5 h-5 rounded bg-red-50 border border-gray-200"></span> <span>Data Nonaktif</span> </div>
                            <div className="flex items-center gap-2"> <span className="inline-block w-5 h-5 rounded bg-white border border-gray-200"></span> <span>Data Aktif</span> </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
                if (!open) {
                    setDeleteDialog({ isOpen: false, id: null, type: null, name: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus {deleteDialog.type === 'item' ? 'item inventory' : deleteDialog.type === 'category' ? 'kategori' : 'unit'} <strong>"{deleteDialog.name}"</strong>?
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
