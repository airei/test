import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
import InputError from '@/components/input-error';

interface KunjunganPemeriksaanLabProps extends PageProps {
    kunjungan: {
        data: Array<{
            id: number;
            medical_record_number: string;
            patient_name: string;
            identity_number: string;
            visit_date: string;
            visit_time: string;
            lab_examination: string;
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
        gender?: string;
        shift_id?: string;
        age_start?: string;
        age_end?: string;
        employee_status_id?: string;
        guarantor_id?: string;
        status?: string;
        lab_master_id?: string;
    };
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    labMasters: Array<{ id: string; name: string }>;
    isSuperAdmin: boolean;
    statusOptions: Array<{ value: string; label: string }>;
    departments: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    shifts: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    employeeStatuses: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    guarantors: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    errors?: Record<string, string>;
}

export default function KunjunganPemeriksaanLab({
    kunjungan,
    totalRecords,
    hasSearched,
    filters,
    companies,
    plants,
    labMasters,
    isSuperAdmin,
    statusOptions,
    departments,
    shifts,
    employeeStatuses,
    guarantors
}: KunjunganPemeriksaanLabProps) {
    const { errors } = usePage().props as any;
    // Tambahkan state dan filter identik dengan laporan kunjungan rawat jalan
    type Gender = 'all' | 'L' | 'P';
    const [formData, setFormData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        company_id: filters.company_id || (isSuperAdmin ? '' : (companies[0]?.id || '')),
        plant_id: filters.plant_id || (isSuperAdmin ? '' : (plants[0]?.id || '')),
        department_id: filters.department_id || 'all',
        gender: (filters.gender as Gender) || 'all',
        shift_id: filters.shift_id || 'all',
        age_start: filters.age_start || '',
        age_end: filters.age_end || '',
        employee_status_id: filters.employee_status_id || 'all',
        guarantor_id: filters.guarantor_id || 'all',
        status: filters.status || 'all',
        lab_master_id: filters.lab_master_id || '',
    });
    const [dateRangeOpen, setDateRangeOpen] = useState(false);

    // Filter plants, departments, shifts, employeeStatuses, guarantors berdasarkan company/plant
    type Plant = { id: string; name: string; company_id: string };
    type Department = { id: string; name: string; company_id: string; plant_id: string };
    type Shift = { id: string; name: string; company_id: string; plant_id: string };
    type EmployeeStatus = { id: string; name: string; company_id: string; plant_id: string };
    type Guarantor = { id: string; name: string; company_id: string; plant_id: string };
    const filteredPlants = plants.filter((plant: Plant) => !formData.company_id || plant.company_id === formData.company_id);
    const filteredDepartments = (departments || []).filter((dept: Department) => formData.company_id && formData.plant_id && dept.company_id === formData.company_id && dept.plant_id === formData.plant_id);
    const filteredShifts = (shifts || []).filter((shift: Shift) => formData.company_id && formData.plant_id && shift.company_id === formData.company_id && shift.plant_id === formData.plant_id);
    const filteredEmployeeStatuses = (employeeStatuses || []).filter((status: EmployeeStatus) => formData.company_id && formData.plant_id && status.company_id === formData.company_id && status.plant_id === formData.plant_id);
    const filteredGuarantors = (guarantors || []).filter((guarantor: Guarantor) => formData.company_id && formData.plant_id && guarantor.company_id === formData.company_id && guarantor.plant_id === formData.plant_id);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
        router.get(route('laporan.kunjungan-pemeriksaan-lab'), formData, {
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
            status: 'all',
            lab_master_id: '',
        });
        setDateRangeOpen(false);
        router.get(route('laporan.kunjungan-pemeriksaan-lab'), {}, {
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

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Kunjungan Pemeriksaan Lab', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kunjungan Pemeriksaan Lab" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Kunjungan Pemeriksaan Lab</h1>
                        <p className="text-muted-foreground">
                            Laporan data kunjungan pemeriksaan laboratorium
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
                            {/* Status Karyawan */}
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
                            {/* Departemen */}
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
                                        {filteredDepartments?.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Row 3: Jenis Kelamin, Usia, Status Kunjungan, Lab Master */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Jenis Kelamin */}
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
                            {/* Usia Minimal */}
                            <div className="space-y-2">
                                <Label htmlFor="age_start">Usia Minimal</Label>
                                <Input
                                    id="age_start"
                                    type="number"
                                    min={0}
                                    value={formData.age_start}
                                    onChange={(e) => handleInputChange('age_start', e.target.value)}
                                    placeholder="0"
                                    disabled={!formData.company_id || !formData.plant_id}
                                />
                            </div>
                            {/* Usia Maksimal */}
                            <div className="space-y-2">
                                <Label htmlFor="age_end">Usia Maksimal</Label>
                                <Input
                                    id="age_end"
                                    type="number"
                                    min={0}
                                    value={formData.age_end}
                                    onChange={(e) => handleInputChange('age_end', e.target.value)}
                                    placeholder="100"
                                    disabled={!formData.company_id || !formData.plant_id}
                                />
                            </div>
                            {/* Status Kunjungan */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status Kunjungan</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                    disabled={!formData.company_id || !formData.plant_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status kunjungan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
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
                        ) : kunjungan.data.length === 0 ? (
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
                                                <TableHead>No. RM</TableHead>
                                                <TableHead>Nama Pasien</TableHead>
                                                <TableHead>NIK</TableHead>
                                                <TableHead>Tanggal Kunjungan</TableHead>
                                                <TableHead>Jam</TableHead>
                                                <TableHead>Pemeriksaan Lab</TableHead>
                                                <TableHead>Penjamin</TableHead>
                                                <TableHead>Status</TableHead>
                                                {isSuperAdmin && <TableHead>Perusahaan</TableHead>}
                                                {isSuperAdmin && <TableHead>Plant</TableHead>}
                                                <TableHead>Dibuat Oleh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kunjungan.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.medical_record_number}
                                                    </TableCell>
                                                    <TableCell>{item.patient_name}</TableCell>
                                                    <TableCell>{item.identity_number}</TableCell>
                                                    <TableCell>{item.visit_date}</TableCell>
                                                    <TableCell>{item.visit_time}</TableCell>
                                                    <TableCell>{item.lab_examination}</TableCell>
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
                                                        router.get(route('laporan.kunjungan-pemeriksaan-lab'), Object.fromEntries(params), {
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
                                                        router.get(route('laporan.kunjungan-pemeriksaan-lab'), Object.fromEntries(params), {
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