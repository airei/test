import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ObatKeluarProps extends PageProps {
    obatKeluar: {
        data: Array<{
            id: number;
            item_name: string;
            category: string;
            unit: string;
            movement_date: string;
            quantity: number;
            movement_type: string;
            movement_type_text: string;
            reason: string;
            reference_number: string;
            company: string;
            plant: string;
            created_by: string;
            created_at: string;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    totalRecords: number;
    hasSearched: boolean;
    filters: {
        start_date?: string;
        end_date?: string;
        company_id?: string;
        plant_id?: string;
        inventory_item_id?: string;
        search?: string;
        movement_type?: string;
    };
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    inventoryItems: Array<{ id: string; name: string }>;
    isSuperAdmin: boolean;
    movementTypeOptions: Array<{ value: string; label: string }>;
}

export default function ObatKeluar({
    obatKeluar,
    totalRecords,
    hasSearched,
    filters,
    companies,
    plants,
    inventoryItems,
    isSuperAdmin,
    movementTypeOptions
}: ObatKeluarProps) {
    const [formData, setFormData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        company_id: filters.company_id || '',
        plant_id: filters.plant_id || '',
        inventory_item_id: filters.inventory_item_id || '',
        search: filters.search || '',
        movement_type: filters.movement_type || ''
    });

    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    // Filter plants based on selected company
    const filteredPlants = plants.filter(plant => 
        !formData.company_id || plant.company_id === formData.company_id
    );

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Reset plant_id if company changes
        if (field === 'company_id') {
            setFormData(prev => ({
                ...prev,
                company_id: value,
                plant_id: ''
            }));
        }
    };

    const handleSearch = () => {
        router.get(route('laporan.obat-keluar'), formData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFormData({
            start_date: '',
            end_date: '',
            company_id: '',
            plant_id: '',
            inventory_item_id: '',
            search: '',
            movement_type: ''
        });
        router.get(route('laporan.obat-keluar'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getMovementTypeBadgeVariant = (movementType: string) => {
        switch (movementType) {
            case 'in':
                return 'default';
            case 'out':
                return 'destructive';
            case 'adjustment':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout>
            <Head title="Laporan Obat Keluar" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Obat Keluar</h1>
                        <p className="text-muted-foreground">
                            Laporan data pengeluaran obat dan inventory
                        </p>
                    </div>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FilterIcon className="h-5 w-5" />
                            Filter Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Tanggal Mulai */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date ? format(new Date(formData.start_date), 'dd/MM/yyyy') : "Pilih tanggal"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.start_date ? new Date(formData.start_date) : undefined}
                                            onSelect={(date) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    start_date: date ? format(date, 'yyyy-MM-dd') : ''
                                                }));
                                                setStartDateOpen(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Tanggal Akhir */}
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.end_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.end_date ? format(new Date(formData.end_date), 'dd/MM/yyyy') : "Pilih tanggal"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.end_date ? new Date(formData.end_date) : undefined}
                                            onSelect={(date) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    end_date: date ? format(date, 'yyyy-MM-dd') : ''
                                                }));
                                                setEndDateOpen(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Company (Super Admin only) */}
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="company_id">Perusahaan</Label>
                                    <Select
                                        value={formData.company_id}
                                        onValueChange={(value) => handleInputChange('company_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih perusahaan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={company.id}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Plant (Super Admin only) */}
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="plant_id">Plant</Label>
                                    <Select
                                        value={formData.plant_id}
                                        onValueChange={(value) => handleInputChange('plant_id', value)}
                                        disabled={!formData.company_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih plant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPlants.map((plant) => (
                                                <SelectItem key={plant.id} value={plant.id}>
                                                    {plant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Inventory Item */}
                            <div className="space-y-2">
                                <Label htmlFor="inventory_item_id">Item Inventory</Label>
                                <Select
                                    value={formData.inventory_item_id}
                                    onValueChange={(value) => handleInputChange('inventory_item_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Cari</Label>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Nama item atau deskripsi..."
                                        value={formData.search}
                                        onChange={(e) => handleInputChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Movement Type */}
                            <div className="space-y-2">
                                <Label htmlFor="movement_type">Tipe Pergerakan</Label>
                                <Select
                                    value={formData.movement_type}
                                    onValueChange={(value) => handleInputChange('movement_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {movementTypeOptions.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-6">
                            <Button onClick={handleSearch} className="flex items-center gap-2">
                                <SearchIcon className="h-4 w-4" />
                                Cari Data
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Hasil Pencarian</span>
                            {hasSearched && (
                                <div className="text-sm text-muted-foreground">
                                    Total: {totalRecords} data
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!hasSearched ? (
                            <div className="text-center py-12">
                                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Belum ada pencarian</h3>
                                <p className="text-muted-foreground">
                                    Silakan pilih filter dan klik "Cari Data" untuk menampilkan laporan
                                </p>
                            </div>
                        ) : obatKeluar.data.length === 0 ? (
                            <div className="text-center py-12">
                                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Tidak ada data</h3>
                                <p className="text-muted-foreground">
                                    Tidak ada data yang sesuai dengan filter yang dipilih
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama Item</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Jumlah</TableHead>
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>Alasan</TableHead>
                                                <TableHead>No. Referensi</TableHead>
                                                {isSuperAdmin && <TableHead>Perusahaan</TableHead>}
                                                {isSuperAdmin && <TableHead>Plant</TableHead>}
                                                <TableHead>Dibuat Oleh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {obatKeluar.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.item_name}
                                                    </TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                    <TableCell>{item.movement_date}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getMovementTypeBadgeVariant(item.movement_type)}>
                                                            {item.movement_type_text}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{item.reason}</TableCell>
                                                    <TableCell>{item.reference_number}</TableCell>
                                                    {isSuperAdmin && (
                                                        <TableCell>{item.company}</TableCell>
                                                    )}
                                                    {isSuperAdmin && (
                                                        <TableCell>{item.plant}</TableCell>
                                                    )}
                                                    <TableCell>{item.created_by}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {obatKeluar.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Menampilkan {obatKeluar.from} sampai {obatKeluar.to} dari {obatKeluar.total} data
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {obatKeluar.current_page > 1 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(obatKeluar.current_page - 1));
                                                        router.get(route('laporan.obat-keluar'), Object.fromEntries(params), {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Sebelumnya
                                                </Button>
                                            )}
                                            <span className="text-sm">
                                                Halaman {obatKeluar.current_page} dari {obatKeluar.last_page}
                                            </span>
                                            {obatKeluar.current_page < obatKeluar.last_page && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(obatKeluar.current_page + 1));
                                                        router.get(route('laporan.obat-keluar'), Object.fromEntries(params), {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Selanjutnya
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 