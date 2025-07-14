import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';

interface AngkaKontakProps extends PageProps {
    angkaKontak: {
        data: Array<{
            id: string;
            patient_name: string;
            total_contacts: number;
            service_types: Array<{
                service_type: string;
                contacts: Array<{
                    id: number;
                    contact_datetime: string;
                    contact_person: string;
                    service_type: string;
                }>;
            }>;
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
        service_type?: string;
        company_id?: string;
        plant_id?: string;
        department_id?: string;
        employee_status_id?: string;
        shift_id?: string;
        gender?: string;
        guarantor_id?: string;
    };
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    departments: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    shifts: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    employeeStatuses: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    guarantors: Array<{ id: string; name: string; company_id: string; plant_id: string }>;
    isSuperAdmin: boolean;
    serviceTypes: Array<{ value: string; label: string }>;
    errors?: Record<string, string>;
}

export default function AngkaKontak({
    angkaKontak,
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
    serviceTypes = []
}: AngkaKontakProps) {
    const { errors } = usePage().props as any;
    type Gender = 'all' | 'L' | 'P';
    const [formData, setFormData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        service_type: filters.service_type || 'all',
        company_id: filters.company_id || (isSuperAdmin ? '' : (companies[0]?.id || '')),
        plant_id: filters.plant_id || (isSuperAdmin ? '' : (plants[0]?.id || '')),
        department_id: filters.department_id || 'all',
        employee_status_id: filters.employee_status_id || 'all',
        shift_id: filters.shift_id || 'all',
        gender: (filters.gender as Gender) || 'all',
        guarantor_id: filters.guarantor_id || 'all',
    });
    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
                gender: 'all'
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
                gender: 'all'
            }));
        }
    };

    const handleSearch = () => {
        router.get(route('laporan.angka-kontak'), formData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFormData({
            start_date: '',
            end_date: '',
            service_type: 'all',
            company_id: '',
            plant_id: '',
            department_id: 'all',
            employee_status_id: 'all',
            shift_id: 'all',
            gender: 'all',
            guarantor_id: 'all',
        });
        setDateRangeOpen(false);
        router.get(route('laporan.angka-kontak'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleExpandedRow = (rowId: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(rowId)) {
            newExpandedRows.delete(rowId);
        } else {
            newExpandedRows.add(rowId);
        }
        setExpandedRows(newExpandedRows);
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Angka Kontak', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Angka Kontak" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Angka Kontak</h1>
                        <p className="text-muted-foreground">
                            Laporan data angka kontak pasien berdasarkan tipe layanan
                        </p>
                    </div>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FilterIcon className="h-5 w-5" />
                            Filter Laporan Angka Kontak
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

                        {/* Row 2: Tipe Layanan, Penjamin, Shift, Status Karyawan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Tipe Layanan */}
                            <div className="space-y-2">
                                <Label htmlFor="service_type">Tipe Layanan</Label>
                                <Select
                                    value={formData.service_type}
                                    onValueChange={(value) => handleInputChange('service_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe layanan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Layanan</SelectItem>
                                        {serviceTypes?.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>

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
                        </div>

                        {/* Row 3: Departemen, Jenis Kelamin */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSearch}
                                disabled={!formData.company_id || !formData.plant_id}
                            >
                                Cari
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                {hasSearched && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hasil Pencarian Angka Kontak</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {totalRecords} data ditemukan
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead>No.</TableHead>
                                            <TableHead>Nama Pasien</TableHead>
                                            <TableHead>Total Angka Kontak</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {angkaKontak.data.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <TableRow>
                                                    <TableCell>
                                                        <button
                                                            onClick={() => toggleExpandedRow(item.id)}
                                                            className="p-1 hover:bg-muted rounded"
                                                        >
                                                            {expandedRows.has(item.id) ? (
                                                                <ChevronDownIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRightIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </TableCell>
                                                    <TableCell>{angkaKontak.from + index}</TableCell>
                                                    <TableCell className="font-medium">{item.patient_name}</TableCell>
                                                    <TableCell>{item.total_contacts}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(item.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="p-0">
                                                            <div className="p-4 bg-muted/50">
                                                                <h4 className="font-medium mb-3">Detail Angka Kontak</h4>
                                                                {item.service_types.map((serviceGroup, serviceIndex) => (
                                                                    <div key={serviceIndex} className="mb-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                                {serviceGroup.service_type} ({serviceGroup.contacts.length} kontak)
                                                                            </span>
                                                                        </div>
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>No.</TableHead>
                                                                                    <TableHead>Waktu Kontak</TableHead>
                                                                                    <TableHead>Jenis Layanan</TableHead>
                                                                                    <TableHead>Petugas Kontak</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {serviceGroup.contacts.map((visit: any, visitIndex: number) => (
                                                                                    <TableRow key={visit.id}>
                                                                                        <TableCell>{visitIndex + 1}</TableCell>
                                                                                        <TableCell>
                                                                                            {format(new Date(visit.contact_datetime), 'dd/MM/yyyy HH:mm')}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {visit.service_type}
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell>{visit.contact_person}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {angkaKontak.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Menampilkan {angkaKontak.from} sampai {angkaKontak.to} dari {angkaKontak.total} data
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={angkaKontak.current_page === 1}
                                            onClick={() => {
                                                const params = { ...formData, page: angkaKontak.current_page - 1 };
                                                router.get(route('laporan.angka-kontak'), params, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={angkaKontak.current_page === angkaKontak.last_page}
                                            onClick={() => {
                                                const params = { ...formData, page: angkaKontak.current_page + 1 };
                                                router.get(route('laporan.angka-kontak'), params, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
} 