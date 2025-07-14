import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, User, Building, Stethoscope, Phone, Calendar, MapPin, Phone as PhoneIcon, ChevronDown, ChevronRight } from 'lucide-react';
import TextLink from '@/components/text-link';
import AppLayout from '@/layouts/app-layout';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Company {
    id: string;
    name: string;
}

interface Plant {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

interface EmployeeStatus {
    id: string;
    name: string;
}

interface Guarantor {
    id: string;
    name: string;
    description?: string;
}

interface PatientToGuarantor {
    id: string;
    guarantor_number: string;
    guarantor: Guarantor;
}

interface PatientRecord {
    id: string;
    name: string;
    nik: string;
    nip: string;
    gender: string;
    birth_date: string;
    blood_type: string;
    blood_rhesus: string;
    phone_number: string;
    address: string;
    illness_history: string;
    allergy: string;
    prolanis_status: boolean;
    prb_status: boolean;
    emergency_contact_name: string;
    emergency_contact_relations: string;
    emergency_contact_number: string;
    company_id: string;
    plant_id: string;
    employee_status_id: string;
    department_id: string;
    company?: Company;
    plant?: Plant;
    department?: Department;
    employee_status?: EmployeeStatus;
    guarantors?: PatientToGuarantor[];
    created_at: string;
    updated_at: string;
}

interface Props {
    patientRecord: PatientRecord;
}

export default function Show({ patientRecord }: Props) {
    const [activeTab, setActiveTab] = useState('personal');
    const [openSections, setOpenSections] = useState({
        personal: true,
        company: true,
        medical: true,
        guarantor: true
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGenderText = (gender: string) => {
        return gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : '-';
    };

    const getBloodTypeText = (type: string, rhesus: string) => {
        if (!type && !rhesus) return '-';
        return `${type || '-'}${rhesus || ''}`;
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pelayanan', href: '#' },
        { title: 'Registrasi & Rekam Medis', href: route('pelayanan.registrasi-rekam-medis.index') },
        { title: 'Detail Pasien', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pasien - ${patientRecord.name}`} />
            
            <div className="flex items-center justify-between mb-6 mt-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route('pelayanan.registrasi-rekam-medis.index'))}
                        className="h-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{patientRecord.name}</h1>
                        <p className="text-muted-foreground">Detail Informasi Pasien</p>
                    </div>
                </div>
                <Button asChild size="default">
                    <Link href={route('pelayanan.registrasi-rekam-medis.edit', patientRecord.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Data
                    </Link>
                </Button>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Data Pribadi
                    </TabsTrigger>
                    <TabsTrigger value="company" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Perusahaan
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Medis
                    </TabsTrigger>
                </TabsList>

                {/* Data Pribadi Tab - Info Cepat + Data Pribadi */}
                <TabsContent value="personal" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-blue-600">
                                <User className="w-5 h-5" />
                                Data Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">NIK</Label>
                                    <p className="text-base text-gray-900">{patientRecord.nik || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">NIP</Label>
                                    <p className="text-base text-gray-900">{patientRecord.nip || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Jenis Kelamin</Label>
                                    <p className="text-base text-gray-900">{getGenderText(patientRecord.gender)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Usia</Label>
                                    <p className="text-base text-gray-900">{patientRecord.birth_date ? `${new Date().getFullYear() - new Date(patientRecord.birth_date).getFullYear()} tahun` : '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tanggal Lahir</Label>
                                    <p className="text-base text-gray-900">{formatDate(patientRecord.birth_date)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Alamat</Label>
                                    <p className="text-base text-gray-900">{patientRecord.address || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Telepon</Label>
                                    <p className="text-base text-gray-900">{patientRecord.phone_number || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Company Data Tab - Grid Layout */}
                <TabsContent value="company" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-green-600">
                                <Building className="w-5 h-5" />
                                Data Perusahaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Perusahaan</Label>
                                    <p className="text-base text-gray-900">{patientRecord.company?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Plant</Label>
                                    <p className="text-base text-gray-900">{patientRecord.plant?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Departemen</Label>
                                    <p className="text-base text-gray-900">{patientRecord.department?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status Karyawan</Label>
                                    <p className="text-base text-gray-900">{patientRecord.employee_status?.name || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medical Data Tab - Grid Layout */}
                <TabsContent value="medical" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-purple-600">
                                <Stethoscope className="w-5 h-5" />
                                Data Medis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Golongan Darah</Label>
                                    <p className="text-base text-gray-900">{getBloodTypeText(patientRecord.blood_type, patientRecord.blood_rhesus)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Riwayat Penyakit</Label>
                                    <p className="text-base text-gray-900 whitespace-pre-wrap">{patientRecord.illness_history || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Alergi</Label>
                                    <p className="text-base text-gray-900 whitespace-pre-wrap">{patientRecord.allergy || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status Khusus</Label>
                                    <div className="flex gap-2">
                                        {patientRecord.prolanis_status && (
                                            <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-800 px-3 py-1">
                                                Prolanis
                                            </Badge>
                                        )}
                                        {patientRecord.prb_status && (
                                            <Badge variant="secondary" className="text-sm bg-orange-100 text-orange-800 px-3 py-1">
                                                PRB
                                            </Badge>
                                        )}
                                        {!patientRecord.prolanis_status && !patientRecord.prb_status && (
                                            <span className="text-sm text-gray-500">Tidak ada status khusus</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Guarantor Data Tab - Table Layout */}
                <TabsContent value="guarantor" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-indigo-600">
                                <User className="w-5 h-5" />
                                Data Penjamin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!patientRecord.guarantors || patientRecord.guarantors.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">Tidak ada data penjamin</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">No</th>
                                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Nama Penjamin</th>
                                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Nomor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientRecord.guarantors.map((guarantor, index) => (
                                                <tr key={guarantor.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-3 text-sm text-gray-600">{index + 1}</td>
                                                    <td className="py-3 px-3 text-base font-medium text-gray-900">{guarantor.guarantor?.name || '-'}</td>
                                                    <td className="py-3 px-3 text-base font-mono text-gray-900">{guarantor.guarantor_number || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Informasi Sistem - Footer */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-6">
                        <span>Dibuat: {formatDate(patientRecord.created_at)}</span>
                        <span>•</span>
                        <span>Diperbarui: {formatDate(patientRecord.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Informasi Sistem</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 