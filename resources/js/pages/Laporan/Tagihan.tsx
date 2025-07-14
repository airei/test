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

interface TagihanProps extends PageProps {
    tagihan: {
        data: Array<{
            id: number;
            type: string;
            type_text: string;
            medical_record_number: string;
            patient_name: string;
            identity_number: string;
            visit_date: string;
            visit_time: string;
            service_name: string;
            amount: string;
            guarantor: string;
            status: string;
            status_text: string;
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
        department_id?: string;
        search?: string;
        status?: string;
        type?: string;
    };
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    departments: Array<{ id: string; name: string }>;
    isSuperAdmin: boolean;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
}

export default function Tagihan({
    tagihan,
    totalRecords,
    hasSearched,
    filters,
    companies,
    plants,
    departments,
    isSuperAdmin,
    statusOptions,
    typeOptions
}: TagihanProps) {
    const [formData, setFormData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        company_id: filters.company_id || '',
        plant_id: filters.plant_id || '',
        department_id: filters.department_id || '',
        search: filters.search || '',
        status: filters.status || '',
        type: filters.type || 'all'
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
        router.get(route('laporan.tagihan'), formData, {
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
            department_id: '',
            search: '',
            status: '',
            type: 'all'
        });
        router.get(route('laporan.tagihan'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'in_progress':
                return 'default';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'rawat_jalan':
                return 'default';
            case 'lab':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout>
            <Head title="Laporan Tagihan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Tagihan</h1>
                        <p className="text-muted-foreground">
                            Laporan data tagihan rawat jalan dan laboratorium
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

                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Departemen/Layanan</Label>
                                <Select
                                    value={formData.department_id}
                                    onValueChange={(value) => handleInputChange('department_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Layanan</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
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
                                        placeholder="No. RM, nama, atau NIK..."
                                        value={formData.search}
                                        onChange={(e) => handleInputChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
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
                        ) : tagihan.data.length === 0 ? (
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
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>No. RM</TableHead>
                                                <TableHead>Nama Pasien</TableHead>
                                                <TableHead>NIK</TableHead>
                                                <TableHead>Tanggal Kunjungan</TableHead>
                                                <TableHead>Jam</TableHead>
                                                <TableHead>Layanan</TableHead>
                                                <TableHead>Jumlah</TableHead>
                                                <TableHead>Penjamin</TableHead>
                                                <TableHead>Status</TableHead>
                                                {isSuperAdmin && <TableHead>Perusahaan</TableHead>}
                                                {isSuperAdmin && <TableHead>Plant</TableHead>}
                                                <TableHead>Dibuat Oleh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tagihan.data.map((item) => (
                                                <TableRow key={`${item.type}-${item.id}`}>
                                                    <TableCell>
                                                        <Badge variant={getTypeBadgeVariant(item.type)}>
                                                            {item.type_text}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.medical_record_number}
                                                    </TableCell>
                                                    <TableCell>{item.patient_name}</TableCell>
                                                    <TableCell>{item.identity_number}</TableCell>
                                                    <TableCell>{item.visit_date}</TableCell>
                                                    <TableCell>{item.visit_time}</TableCell>
                                                    <TableCell>{item.service_name}</TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.amount}
                                                    </TableCell>
                                                    <TableCell>{item.guarantor}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusBadgeVariant(item.status)}>
                                                            {item.status_text}
                                                        </Badge>
                                                    </TableCell>
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
                                {tagihan.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Menampilkan {tagihan.from} sampai {tagihan.to} dari {tagihan.total} data
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {tagihan.current_page > 1 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(tagihan.current_page - 1));
                                                        router.get(route('laporan.tagihan'), Object.fromEntries(params), {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Sebelumnya
                                                </Button>
                                            )}
                                            <span className="text-sm">
                                                Halaman {tagihan.current_page} dari {tagihan.last_page}
                                            </span>
                                            {tagihan.current_page < tagihan.last_page && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(tagihan.current_page + 1));
                                                        router.get(route('laporan.tagihan'), Object.fromEntries(params), {
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