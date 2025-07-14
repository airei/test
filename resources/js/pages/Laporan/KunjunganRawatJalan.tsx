import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, SearchIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';

interface KunjunganRawatJalanProps extends PageProps {
    kunjungan: {
        data: Array<{
            id: number;
            visit_datetime: string;
            patient_name: string;
            nip: string;
            nik: string;
            guarantor: string;
            department: string;
            employee_status: string;
            company: string;
            plant: string;
            status: string;
            status_text: string;
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
        gender?: string;
        shift_id?: string;
        age_start?: string;
        age_end?: string;
        employee_status_id?: string;
        guarantor_id?: string;
        status?: string;
    };
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    departments: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    shifts: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    employeeStatuses: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    guarantors: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    isSuperAdmin: boolean;
    statusOptions: Array<{ value: string; label: string }>;
    errors?: Record<string, string>;
}

export default function KunjunganRawatJalan({
    kunjungan,
    totalRecords,
    hasSearched,
    filters,
    companies = [],
    plants = [],
    departments = [],
    shifts = [],
    employeeStatuses = [],
    guarantors = [],
    isSuperAdmin,
    statusOptions = []
}: KunjunganRawatJalanProps) {
    const { errors } = usePage().props as any;
    const [formData, setFormData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        company_id: filters.company_id || (isSuperAdmin ? '' : (companies[0]?.id || '')),
        plant_id: filters.plant_id || (isSuperAdmin ? '' : (plants[0]?.id || '')),
        department_id: filters.department_id || 'all',
        gender: filters.gender || 'all',
        shift_id: filters.shift_id || 'all',
        age_start: filters.age_start || '',
        age_end: filters.age_end || '',
        employee_status_id: filters.employee_status_id || 'all',
        guarantor_id: filters.guarantor_id || 'all',
        status: filters.status || 'all'
    });

    const [dateRangeOpen, setDateRangeOpen] = useState(false);

    // Filter plants based on selected company
    const filteredPlants = plants.filter(plant => 
        !formData.company_id || plant.company_id === formData.company_id
    );

    // Filter departments based on selected company and plant
    const filteredDepartments = departments.filter(dept => {
        if (!formData.company_id || !formData.plant_id) return false;
        // Assuming department has company_id and plant_id fields
        // If not, you may need to adjust this logic based on your data structure
        return dept.company_id === formData.company_id && dept.plant_id === formData.plant_id;
    });

    // Filter shifts based on selected company and plant
    const filteredShifts = shifts.filter(shift => {
        if (!formData.company_id || !formData.plant_id) return false;
        return shift.company_id === formData.company_id && shift.plant_id === formData.plant_id;
    });

    // Filter employee statuses based on selected company and plant
    const filteredEmployeeStatuses = employeeStatuses.filter(status => {
        if (!formData.company_id || !formData.plant_id) return false;
        return status.company_id === formData.company_id && status.plant_id === formData.plant_id;
    });

    // Filter guarantors based on selected company and plant
    const filteredGuarantors = guarantors.filter(guarantor => {
        if (!formData.company_id || !formData.plant_id) return false;
        return guarantor.company_id === formData.company_id && guarantor.plant_id === formData.plant_id;
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Reset dependent fields if company changes
        if (field === 'company_id') {
            setFormData(prev => ({
                ...prev,
                company_id: value,
                plant_id: '',
                department_id: 'all',
                shift_id: 'all',
                employee_status_id: 'all',
                guarantor_id: 'all',
                gender: 'all',
                status: 'all'
            }));
        }

        // Reset dependent fields if plant changes
        if (field === 'plant_id') {
            setFormData(prev => ({
                ...prev,
                plant_id: value,
                department_id: 'all',
                shift_id: 'all',
                employee_status_id: 'all',
                guarantor_id: 'all',
                gender: 'all',
                status: 'all'
            }));
        }
    };

    const handleSearch = () => {
        router.get(route('laporan.kunjungan-rawat-jalan'), formData, {
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
            department_id: 'all',
            gender: 'all',
            shift_id: 'all',
            age_start: '',
            age_end: '',
            employee_status_id: 'all',
            guarantor_id: 'all',
            status: 'all'
        });
        setDateRangeOpen(false);
        router.get(route('laporan.kunjungan-rawat-jalan'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'waiting':
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

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Kunjungan Rawat Jalan', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kunjungan Rawat Jalan" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Kunjungan Rawat Jalan</h1>
                        <p className="text-muted-foreground">
                            Laporan data kunjungan pasien rawat jalan
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
                        {/* Row 1: Date Range & Company/Plant */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                            {/* Range Tanggal */}
                            <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor="date_range">Rentang Tanggal</Label>
                                <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.start_date && !formData.end_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date && formData.end_date 
                                                ? `${format(new Date(formData.start_date), 'dd/MM/yyyy')} - ${format(new Date(formData.end_date), 'dd/MM/yyyy')}`
                                                : formData.start_date 
                                                    ? `${format(new Date(formData.start_date), 'dd/MM/yyyy')} - Pilih akhir`
                                                    : formData.end_date
                                                        ? `Pilih awal - ${format(new Date(formData.end_date), 'dd/MM/yyyy')}`
                                                        : "Pilih rentang tanggal"
                                            }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={{
                                                from: formData.start_date ? new Date(formData.start_date) : undefined,
                                                to: formData.end_date ? new Date(formData.end_date) : undefined
                                            }}
                                            onSelect={(range) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                                                    end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
                                                }));
                                                if (range?.from && range?.to) {
                                                    setDateRangeOpen(false);
                                                }
                                            }}
                                            numberOfMonths={2}
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
                                            {companies?.map((company) => (
                                                <SelectItem key={company.id} value={company.id}>
                                                    {company.name}
                                                </SelectItem>
                                            )) || []}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors?.company_id} className="mt-2" />
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
                                            {filteredPlants?.map((plant) => (
                                                <SelectItem key={plant.id} value={plant.id}>
                                                    {plant.name}
                                                </SelectItem>
                                            )) || []}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors?.plant_id} className="mt-2" />
                                </div>
                            )}
                        </div>

                        {/* Row 2: Penjamin, Shift, Status Karyawan, Departemen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Penjamin */}
                            <div className="space-y-2">
                                <Label htmlFor="guarantor_id">Penjamin</Label>
                                <Select
                                    value={formData.guarantor_id}
                                    onValueChange={(value) => handleInputChange('guarantor_id', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih penjamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Penjamin</SelectItem>
                                        {filteredGuarantors?.map((guarantor) => (
                                            <SelectItem key={guarantor.id} value={guarantor.id}>
                                                {guarantor.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Shift */}
                            <div className="space-y-2">
                                <Label htmlFor="shift_id">Shift Kerja</Label>
                                <Select
                                    value={formData.shift_id}
                                    onValueChange={(value) => handleInputChange('shift_id', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Shift</SelectItem>
                                        {filteredShifts?.map((shift) => (
                                            <SelectItem key={shift.id} value={shift.id}>
                                                {shift.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Employee Status */}
                            <div className="space-y-2">
                                <Label htmlFor="employee_status_id">Status Karyawan</Label>
                                <Select
                                    value={formData.employee_status_id}
                                    onValueChange={(value) => handleInputChange('employee_status_id', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status Karyawan</SelectItem>
                                        {filteredEmployeeStatuses?.map((status) => (
                                            <SelectItem key={status.id} value={status.id}>
                                                {status.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Departemen</Label>
                                <Select
                                    value={formData.department_id}
                                    onValueChange={(value) => handleInputChange('department_id', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Departemen</SelectItem>
                                        {filteredDepartments?.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: Jenis Kelamin, Rentang Usia, Status Kunjungan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Gender */}
                            <div className="space-y-2">
                                <Label htmlFor="gender">Jenis Kelamin</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange('gender', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis Kelamin</SelectItem>
                                        <SelectItem value="L">Laki-laki</SelectItem>
                                        <SelectItem value="P">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Age Start */}
                            <div className="space-y-2">
                                <Label htmlFor="age_start">Usia Minimal</Label>
                                <Input
                                    id="age_start"
                                    type="number"
                                    placeholder="0"
                                    value={formData.age_start}
                                    onChange={(e) => handleInputChange('age_start', e.target.value)}
                                    min="0"
                                    max="150"
                                    disabled={!formData.company_id || !formData.plant_id}
                                />
                            </div>

                            {/* Age End */}
                            <div className="space-y-2">
                                <Label htmlFor="age_end">Usia Maksimal</Label>
                                <Input
                                    id="age_end"
                                    type="number"
                                    placeholder="100"
                                    value={formData.age_end}
                                    onChange={(e) => handleInputChange('age_end', e.target.value)}
                                    min="0"
                                    max="150"
                                    disabled={!formData.company_id || !formData.plant_id}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status Kunjungan</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions?.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-6">
                            <Button
                                onClick={handleSearch}
                                disabled={!formData.company_id || !formData.plant_id}
                                className="flex items-center gap-2"
                            >
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
                        ) : kunjungan.data?.length === 0 ? (
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
                                                <TableHead>No.</TableHead>
                                                <TableHead>Waktu Kunjungan</TableHead>
                                                <TableHead>Nama Pasien</TableHead>
                                                <TableHead>NIP</TableHead>
                                                <TableHead>Penjamin</TableHead>
                                                <TableHead>Posisi</TableHead>
                                                {isSuperAdmin && <TableHead>Perusahaan</TableHead>}
                                                <TableHead>Status Kunjungan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kunjungan.data?.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {(kunjungan.current_page - 1) * kunjungan.per_page + index + 1}
                                                    </TableCell>
                                                    <TableCell>{item.visit_datetime}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.patient_name}</div>
                                                            <div className="text-sm text-muted-foreground">{item.nik}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.nip}</TableCell>
                                                    <TableCell>{item.guarantor}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.department}</div>
                                                            <div className="text-sm text-muted-foreground">{item.employee_status}</div>
                                                        </div>
                                                    </TableCell>
                                                    {isSuperAdmin && (
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{item.company}</div>
                                                                <div className="text-sm text-muted-foreground">{item.plant}</div>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Badge variant={getStatusBadgeVariant(item.status)}>
                                                            {item.status_text}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {kunjungan.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Menampilkan {kunjungan.from} sampai {kunjungan.to} dari {kunjungan.total} data
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {kunjungan.current_page > 1 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(kunjungan.current_page - 1));
                                                        router.get(route('laporan.kunjungan-rawat-jalan'), Object.fromEntries(params), {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Sebelumnya
                                                </Button>
                                            )}
                                            <span className="text-sm">
                                                Halaman {kunjungan.current_page} dari {kunjungan.last_page}
                                            </span>
                                            {kunjungan.current_page < kunjungan.last_page && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', String(kunjungan.current_page + 1));
                                                        router.get(route('laporan.kunjungan-rawat-jalan'), Object.fromEntries(params), {
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