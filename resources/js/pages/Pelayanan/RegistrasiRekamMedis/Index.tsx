import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    FileText, 
    Stethoscope, 
    FlaskConical,
    ChevronLeft,
    ChevronRight,
    Filter,
    Users,
    Calendar,
    Phone,
    MapPin,
    User,
    Building,
    Briefcase
} from 'lucide-react';
import DataPageLayout from '@/components/data-page-layout';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pelayanan', href: '#' },
    { title: 'Registrasi & Rekam Medis', href: '' },
];

interface PatientRecord {
    id: string;
    medical_record_number: string;
    name: string;
    nik: string;
    nip: string;
    gender: 'L' | 'P';
    birth_date: string;
    age: number;
    company?: { name: string };
    plant?: { name: string };
    department?: { name: string };
    employee_status?: { name: string };
    total_visits: number;
    total_labs: number;
    last_visit?: string;
    last_lab?: string;
    created_at: string;
}

interface Filters {
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string }>;
    employeeStatuses: Array<{ id: string; name: string }>;
}

interface Props {
    patientRecords: {
        data: PatientRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: Filters;
    search: string;
    company_id: string;
    plant_id: string;
    department_id: string;
    employee_status_id: string;
}

export default function RegistrasiRekamMedisIndex({ 
    patientRecords, 
    filters, 
    search, 
    company_id, 
    plant_id, 
    department_id, 
    employee_status_id 
}: Props) {
    const [selectedCompany, setSelectedCompany] = useState(company_id || 'all');
    const [selectedPlant, setSelectedPlant] = useState(plant_id || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(department_id || 'all');
    const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState(employee_status_id || 'all');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (searchTerm: string) => {
        router.get(route('pelayanan.registrasi-rekam-medis.index'), {
            search: searchTerm,
            company_id: selectedCompany,
            plant_id: selectedPlant,
            department_id: selectedDepartment,
            employee_status_id: selectedEmployeeStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSelectedCompany('all');
        setSelectedPlant('all');
        setSelectedDepartment('all');
        setSelectedEmployeeStatus('all');
        router.get(route('pelayanan.registrasi-rekam-medis.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
            router.delete(route('pelayanan.registrasi-rekam-medis.destroy', id));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getGenderText = (gender: string) => {
        return gender === 'L' ? 'Laki-laki' : 'Perempuan';
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'L' ? '👨' : '👩';
    };

    return (
        <DataPageLayout
            breadcrumbs={breadcrumbs}
            title="Registrasi & Rekam Medis"
            createRoute={route('pelayanan.registrasi-rekam-medis.create')}
            createLabel="Tambah Pasien"
            listRoute={route('pelayanan.registrasi-rekam-medis.index')}
            initialSearch={search || ''}
            searchPlaceholder="Cari nama, NIK, NIP, atau No. RM..."
            hideDefaultSearch={true}
        >
            {/* Custom Search & Filter Bar */}
            <div className="px-6 pt-6">
                <form onSubmit={e => { e.preventDefault(); handleSearch(search); }} className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama, NIK, NIP, atau No. RM..."
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                        <Search className="w-4 h-4 mr-2" />
                        Cari
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                        type="button"
                    >
                        <Filter className="w-4 h-4" />
                        Filter Lanjutan
                    </Button>
                </form>
                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="company" className="text-sm font-medium">Perusahaan</Label>
                                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {filters.companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="plant" className="text-sm font-medium">Plant</Label>
                                <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {filters.plants.map((plant) => (
                                            <SelectItem key={plant.id} value={plant.id}>
                                                {plant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="department" className="text-sm font-medium">Departemen</Label>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {filters.departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="employee_status" className="text-sm font-medium">Status Karyawan</Label>
                                <Select value={selectedEmployeeStatus} onValueChange={setSelectedEmployeeStatus}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {filters.employeeStatuses.map((status) => (
                                            <SelectItem key={status.id} value={status.id}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
                            <Button type="button" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white" onClick={() => handleSearch(search)}>Terapkan Filter</Button>
                        </div>
                    </div>
                )}
            </div>
            <CardContent>
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">No.</th>
                                <th className="px-3 py-2 text-left">NIK/NIP</th>
                                <th className="px-3 py-2 text-left">Nama/No. RM</th>
                                <th className="px-3 py-2 text-left">Tanggal Lahir/Umur</th>
                                <th className="px-3 py-2 text-left">Jenis Kelamin</th>
                                <th className="px-3 py-2 text-left">Perusahaan/Plant</th>
                                <th className="px-3 py-2 text-left">Departemen/Status Karyawan</th>
                                <th className="px-3 py-2 text-left">Aksi Medis</th>
                                <th className="px-3 py-2 text-left">Aksi Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientRecords.data.map((patient, index) => (
                                <tr key={patient.id} className="bg-white hover:bg-[#F5F5F5] transition-colors duration-200">
                                    <td className="px-3 py-2">{(patientRecords.current_page - 1) * patientRecords.per_page + index + 1}</td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">
                                                {patient.nik || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {patient.nip || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-gray-900">
                                                {patient.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.medical_record_number}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                {formatDate(patient.birth_date)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {patient.age} tahun
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={patient.gender === 'L' ? 'default' : 'secondary'}>
                                            {getGenderText(patient.gender)}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                {patient.company?.name || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {patient.plant?.name || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                {patient.department?.name || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {patient.employee_status?.name || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="h-7 text-xs"
                                                title="Riwayat Medis"
                                            >
                                                <Link href={route('pelayanan.riwayat-rekam-medis.show', patient.id)}>
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Riwayat
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="h-7 text-xs"
                                                title="Mulai Berobat"
                                            >
                                                <Link href={route('pelayanan.rawat-jalan.index', { patient_id: patient.id })}>
                                                    <Stethoscope className="w-3 h-3 mr-1" />
                                                    Berobat
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="h-7 text-xs"
                                                title="Mulai Cek Lab"
                                            >
                                                <Link href={route('pelayanan.pemeriksaan-lab.index', { patient_id: patient.id })}>
                                                    <FlaskConical className="w-3 h-3 mr-1" />
                                                    Cek Lab
                                                </Link>
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="h-7 text-xs text-green-600 hover:bg-green-100"
                                            >
                                                <Link href={route('pelayanan.registrasi-rekam-medis.show', patient.id)}>
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Detail
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(route('pelayanan.registrasi-rekam-medis.edit', patient.id))}
                                                className="h-7 text-xs text-blue-600 hover:bg-blue-100"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(patient.id)}
                                                className="h-7 text-xs text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {patientRecords.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                            Menampilkan {((patientRecords.current_page - 1) * patientRecords.per_page) + 1} - {Math.min(patientRecords.current_page * patientRecords.per_page, patientRecords.total)} dari {patientRecords.total} data
                        </p>
                        <div className="flex gap-2">
                            {patientRecords.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
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
        </DataPageLayout>
    );
} 