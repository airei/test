import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save, User, Building, Stethoscope, Phone, AlertCircle, Shield } from 'lucide-react';
import TextLink from '@/components/text-link';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
}

interface GuarantorForm {
    id: string;
    guarantor_id: string;
    guarantor_number: string;
    [key: string]: string;
}

interface PatientRecord {
    id: string;
    medical_record_number: string;
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
    guarantors?: GuarantorForm[];
}

interface Props {
    patientRecord: PatientRecord;
    companies: Company[];
    plants: Plant[];
    departments: Department[];
    employeeStatuses: EmployeeStatus[];
    guarantors: Guarantor[];
    isSuperAdmin: boolean;
    errors?: Record<string, string>;
}

export default function Edit({ patientRecord, companies, plants, departments, employeeStatuses, guarantors, isSuperAdmin, errors }: Props) {
    const initialFormData = React.useMemo(() => ({
        name: patientRecord.name || '',
        nik: patientRecord.nik || '',
        nip: patientRecord.nip || '',
        gender: patientRecord.gender || '',
        birth_date: patientRecord.birth_date ? patientRecord.birth_date.split('T')[0] : '',
        blood_type: patientRecord.blood_type || '',
        blood_rhesus: patientRecord.blood_rhesus === '' ? null : patientRecord.blood_rhesus || null,
        phone_number: patientRecord.phone_number || '',
        address: patientRecord.address || '',
        illness_history: patientRecord.illness_history || '',
        allergy: patientRecord.allergy || '',
        prolanis_status: patientRecord.prolanis_status || false,
        prb_status: patientRecord.prb_status || false,
        emergency_contact_name: patientRecord.emergency_contact_name || '',
        emergency_contact_relations: patientRecord.emergency_contact_relations || '',
        emergency_contact_number: patientRecord.emergency_contact_number || '',
        company_id: patientRecord.company_id ? String(patientRecord.company_id) : '',
        plant_id: patientRecord.plant_id ? String(patientRecord.plant_id) : '',
        employee_status_id: patientRecord.employee_status_id ? String(patientRecord.employee_status_id) : '',
        department_id: patientRecord.department_id ? String(patientRecord.department_id) : '',
        guarantors: patientRecord.guarantors || [],
    }), [patientRecord]);

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    // Dynamic dropdown data untuk super admin
    const [dynamicPlants, setDynamicPlants] = useState<Plant[]>(plants);
    const [dynamicDepartments, setDynamicDepartments] = useState<Department[]>(departments);
    const [dynamicEmployeeStatuses, setDynamicEmployeeStatuses] = useState<EmployeeStatus[]>(employeeStatuses);
    const [dynamicGuarantors, setDynamicGuarantors] = useState<Guarantor[]>(guarantors);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isLoadingPlants, setIsLoadingPlants] = useState(false);
    const [birthDateOpen, setBirthDateOpen] = useState(false);

    // Fungsi untuk menambah penjamin baru
    const addGuarantor = () => {
        const newGuarantor: GuarantorForm = {
            id: Date.now().toString(), // Temporary ID untuk frontend
            guarantor_id: '',
            guarantor_number: '',
        };
        setFormData(prev => ({
            ...prev,
            guarantors: [...prev.guarantors, newGuarantor]
        }));
    };

    // Fungsi untuk menghapus penjamin
    const removeGuarantor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            guarantors: prev.guarantors.filter((_, i) => i !== index)
        }));
    };

    // Fungsi untuk update data penjamin
    const updateGuarantor = (index: number, field: keyof GuarantorForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            guarantors: prev.guarantors.map((guarantor, i) => 
                i === index ? { ...guarantor, [field]: value } : guarantor
            )
        }));
    };

    // Fungsi untuk cek apakah penjamin sudah dipilih
    const isGuarantorSelected = (guarantorId: string, currentIndex: number) => {
        return formData.guarantors.some((guarantor, index) => 
            index !== currentIndex && guarantor.guarantor_id === guarantorId
        );
    };

    useEffect(() => {
        setFormData(initialFormData);
        setIsFormInitialized(true);
    }, [initialFormData]);

    // Fetch plants berdasarkan company selection untuk super admin
    const fetchPlantsByCompany = async (companyId: string) => {
        if (!isSuperAdmin || !companyId) return;

        setIsLoadingPlants(true);
        try {
            const url = route('pelayanan.registrasi-rekam-medis.plants-by-company') + 
                       `?company_id=${companyId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDynamicPlants(data.plants);
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setIsLoadingPlants(false);
        }
    };

    // Fetch dropdown data berdasarkan company dan plant selection untuk super admin
    const fetchDropdownData = async (companyId: string, plantId: string) => {
        if (!isSuperAdmin || !companyId || !plantId) return;

        setIsLoadingDropdowns(true);
        try {
            const url = route('pelayanan.registrasi-rekam-medis.dropdown-data') + 
                       `?company_id=${companyId}&plant_id=${plantId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDynamicDepartments(data.departments);
                setDynamicEmployeeStatuses(data.employeeStatuses);
                setDynamicGuarantors(data.guarantors);
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    // Effect untuk fetch plants ketika company berubah (untuk super admin)
    useEffect(() => {
        if (isSuperAdmin && formData.company_id && isFormInitialized) {
            // Jika company berubah dari nilai awal, reset plant dan dependent fields
            if (formData.company_id !== initialFormData.company_id) {
                setFormData(prev => ({
                    ...prev,
                    plant_id: '',
                    department_id: '',
                    employee_status_id: '',
                    guarantor_id: '',
                    guarantor_number: '',
                }));

                // Reset dynamic data
                setDynamicDepartments([]);
                setDynamicEmployeeStatuses([]);
                setDynamicGuarantors([]);
                
                // Fetch plants untuk company yang dipilih
                fetchPlantsByCompany(formData.company_id);
            }
        }
    }, [formData.company_id, isSuperAdmin, isFormInitialized]);

    // Effect untuk fetch dropdown data ketika plant berubah (untuk super admin)
    useEffect(() => {
        if (isSuperAdmin && formData.company_id && formData.plant_id && isFormInitialized) {
            // Jika plant berubah dari nilai awal, reset dependent fields
            if (formData.plant_id !== initialFormData.plant_id) {
                setFormData(prev => ({
                    ...prev,
                    department_id: '',
                    employee_status_id: '',
                    guarantor_id: '',
                    guarantor_number: '',
                }));
            }
            
            fetchDropdownData(formData.company_id, formData.plant_id);
        }
    }, [formData.plant_id, isSuperAdmin, isFormInitialized]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Convert guarantors array to format yang bisa dikirim ke backend
        const submitData = {
            ...formData,
            guarantors: formData.guarantors.map(guarantor => ({
                guarantor_id: guarantor.guarantor_id,
                guarantor_number: guarantor.guarantor_number
            }))
        };
        
        router.put(route('pelayanan.registrasi-rekam-medis.update', patientRecord.id), submitData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReset = () => {
        setFormData({
            ...initialFormData,
            blood_rhesus: null,
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pelayanan', href: '#' },
        { title: 'Registrasi & Rekam Medis', href: route('pelayanan.registrasi-rekam-medis.index') },
        { title: 'Edit Data Pasien', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Data Pasien" />
            
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                        <TextLink href={route('pelayanan.registrasi-rekam-medis.index')} className="flex items-center space-x-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </TextLink>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Edit Data Pasien</h1>
                            <p className="text-sm text-gray-600">
                                Perbarui data pasien: {patientRecord.medical_record_number} - {patientRecord.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {errors && Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-semibold">Terdapat error dalam form:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {Object.entries(errors).map(([field, message]) => (
                                        <li key={field}>{message}</li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Data Pribadi */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Data Pribadi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                        className="mt-1"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nik" className="text-sm font-medium">NIK</Label>
                                        <Input
                                            id="nik"
                                            value={formData.nik}
                                            onChange={(e) => handleInputChange('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                            maxLength={18}
                                            className="mt-1"
                                            placeholder="16 digit NIK"
                                        />
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-mono px-2 rounded
                                                ${formData.nik.length > 16 ? 'bg-red-100 text-red-600' :
                                                  formData.nik.length === 16 ? 'bg-green-100 text-green-700' :
                                                  formData.nik.length >= 14 ? 'bg-yellow-100 text-yellow-700' :
                                                  'text-gray-500'}`}
                                            >
                                                {formData.nik.length}/16
                                            </span>
                                            {formData.nik.length > 16 && (
                                                <span className="text-xs text-red-600">Maksimal 16 digit!</span>
                                            )}
                                            {formData.nik.length === 16 && (
                                                <span className="text-xs text-green-700">NIK sudah lengkap</span>
                                            )}
                                            {formData.nik.length >= 14 && formData.nik.length < 16 && (
                                                <span className="text-xs text-yellow-700">NIK mendekati 16 digit</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="nip" className="text-sm font-medium">NIP</Label>
                                        <Input
                                            id="nip"
                                            value={formData.nip}
                                            onChange={(e) => handleInputChange('nip', e.target.value)}
                                            maxLength={20}
                                            className="mt-1"
                                            placeholder="Nomor Induk Pegawai"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="gender" className="text-sm font-medium">Jenis Kelamin *</Label>
                                        <Select 
                                            value={formData.gender} 
                                            onValueChange={(value) => handleInputChange('gender', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih jenis kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="birth_date" className="text-sm font-medium">Tanggal Lahir *</Label>
                                        <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal mt-1",
                                                        !formData.birth_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.birth_date ? format(new Date(formData.birth_date), 'dd/MM/yyyy') : "Pilih tanggal lahir"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                                    onSelect={(date) => {
                                                        handleInputChange('birth_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                        setBirthDateOpen(false);
                                                    }}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="blood_type" className="text-sm font-medium">Golongan Darah</Label>
                                        <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value === 'unknown' ? null : value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih golongan darah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem key="blood_type_unknown" value="unknown">Tidak diketahui</SelectItem>
                                                <SelectItem key="blood_type_A" value="A">A</SelectItem>
                                                <SelectItem key="blood_type_B" value="B">B</SelectItem>
                                                <SelectItem key="blood_type_AB" value="AB">AB</SelectItem>
                                                <SelectItem key="blood_type_O" value="O">O</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="blood_rhesus" className="text-sm font-medium">Rhesus</Label>
                                        <Select value={formData.blood_rhesus === null ? 'unknown' : formData.blood_rhesus} onValueChange={(value) => handleInputChange('blood_rhesus', value === 'unknown' ? null : value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih rhesus" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem key="blood_rhesus_unknown" value="unknown">Tidak diketahui</SelectItem>
                                                <SelectItem key="blood_rhesus_positive" value="+">+</SelectItem>
                                                <SelectItem key="blood_rhesus_negative" value="-">-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phone_number" className="text-sm font-medium">Nomor Telepon</Label>
                                    <Input
                                        id="phone_number"
                                        value={formData.phone_number}
                                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                        className="mt-1"
                                        placeholder="Nomor telepon aktif"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address" className="text-sm font-medium">Alamat</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                        placeholder="Alamat lengkap"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Perusahaan */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Building className="w-5 h-5 text-green-600" />
                                    Data Perusahaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="company" className="text-sm font-medium">Perusahaan</Label>
                                    <Select 
                                        value={formData.company_id} 
                                        onValueChange={(value) => handleInputChange('company_id', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih perusahaan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies && companies.length > 0 ? (
                                                companies.map((company) => (
                                                    <SelectItem key={company.id} value={String(company.id)}>
                                                        {company.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="plant" className="text-sm font-medium">Plant</Label>
                                    <Select 
                                        value={formData.plant_id} 
                                        onValueChange={(value) => handleInputChange('plant_id', value)}
                                        disabled={isSuperAdmin && (!formData.company_id || isLoadingPlants)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={
                                                isSuperAdmin 
                                                    ? !formData.company_id 
                                                        ? "Pilih perusahaan terlebih dahulu"
                                                        : isLoadingPlants 
                                                            ? "Loading plants..."
                                                            : "Pilih plant"
                                                    : "Pilih plant"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dynamicPlants && dynamicPlants.length > 0 ? (
                                                dynamicPlants.map((plant) => (
                                                    <SelectItem key={plant.id} value={String(plant.id)}>
                                                        {plant.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="department" className="text-sm font-medium">Departemen</Label>
                                    <Select 
                                        value={formData.department_id} 
                                        onValueChange={(value) => handleInputChange('department_id', value)}
                                        disabled={isSuperAdmin && (!formData.company_id || !formData.plant_id || isLoadingDropdowns)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={
                                                isSuperAdmin 
                                                    ? (!formData.company_id || !formData.plant_id) 
                                                        ? "Pilih perusahaan dan plant terlebih dahulu"
                                                        : isLoadingDropdowns 
                                                            ? "Loading..."
                                                            : "Pilih departemen"
                                                    : "Pilih departemen"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dynamicDepartments && dynamicDepartments.length > 0 ? (
                                                dynamicDepartments.map((dept) => (
                                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="employee_status" className="text-sm font-medium">Status Karyawan</Label>
                                    <Select 
                                        value={formData.employee_status_id} 
                                        onValueChange={(value) => handleInputChange('employee_status_id', value)}
                                        disabled={isSuperAdmin && (!formData.company_id || !formData.plant_id || isLoadingDropdowns)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={
                                                isSuperAdmin 
                                                    ? (!formData.company_id || !formData.plant_id) 
                                                        ? "Pilih perusahaan dan plant terlebih dahulu"
                                                        : isLoadingDropdowns 
                                                            ? "Loading..."
                                                            : "Pilih status karyawan"
                                                    : "Pilih status karyawan"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dynamicEmployeeStatuses && dynamicEmployeeStatuses.length > 0 ? (
                                                dynamicEmployeeStatuses.map((status) => (
                                                    <SelectItem key={status.id} value={String(status.id)}>
                                                        {status.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="prolanis_status"
                                            checked={formData.prolanis_status}
                                            onCheckedChange={(checked) => handleInputChange('prolanis_status', checked)}
                                        />
                                        <Label htmlFor="prolanis_status" className="text-sm">Status Prolanis</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="prb_status"
                                            checked={formData.prb_status}
                                            onCheckedChange={(checked) => handleInputChange('prb_status', checked)}
                                        />
                                        <Label htmlFor="prb_status" className="text-sm">Status PRB</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Medis */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Stethoscope className="w-5 h-5 text-purple-600" />
                                    Data Medis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="illness_history" className="text-sm font-medium">Riwayat Penyakit</Label>
                                    <Textarea
                                        id="illness_history"
                                        value={formData.illness_history}
                                        onChange={(e) => handleInputChange('illness_history', e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                        placeholder="Riwayat penyakit yang pernah diderita..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="allergy" className="text-sm font-medium">Alergi</Label>
                                    <Textarea
                                        id="allergy"
                                        value={formData.allergy}
                                        onChange={(e) => handleInputChange('allergy', e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                        placeholder="Alergi terhadap obat, makanan, atau hal lain..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Kontak Darurat */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Phone className="w-5 h-5 text-orange-600" />
                                    Kontak Darurat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="emergency_contact_name" className="text-sm font-medium">Nama Kontak Darurat</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                                        className="mt-1"
                                        placeholder="Nama kontak darurat"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_relations" className="text-sm font-medium">Hubungan</Label>
                                    <Input
                                        id="emergency_contact_relations"
                                        value={formData.emergency_contact_relations}
                                        onChange={(e) => handleInputChange('emergency_contact_relations', e.target.value)}
                                        className="mt-1"
                                        placeholder="Contoh: Suami, Istri, Anak, dll"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_number" className="text-sm font-medium">Nomor Telepon</Label>
                                    <Input
                                        id="emergency_contact_number"
                                        value={formData.emergency_contact_number}
                                        onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                                        className="mt-1"
                                        placeholder="Nomor telepon kontak darurat"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Penjamin */}
                        <Card className="border-0 shadow-sm lg:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-lg">
                                        <Shield className="w-5 h-5 text-indigo-600" />
                                        Data Penjamin
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addGuarantor}
                                        disabled={isSuperAdmin && (!formData.company_id || !formData.plant_id || isLoadingDropdowns)}
                                    >
                                        + Tambah Penjamin
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {formData.guarantors.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Belum ada data penjamin</p>
                                        <p className="text-sm">Klik "Tambah Penjamin" untuk menambahkan</p>
                                    </div>
                                ) : (
                                    formData.guarantors.map((guarantor, index) => (
                                        <div key={guarantor.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">Penjamin {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeGuarantor(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium">Penjamin</Label>
                                                    <Select 
                                                        value={guarantor.guarantor_id} 
                                                        onValueChange={(value) => updateGuarantor(index, 'guarantor_id', value)}
                                                        disabled={isSuperAdmin && (!formData.company_id || !formData.plant_id || isLoadingDropdowns)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue placeholder={
                                                                isSuperAdmin 
                                                                    ? (!formData.company_id || !formData.plant_id) 
                                                                        ? "Pilih perusahaan dan plant terlebih dahulu"
                                                                        : isLoadingDropdowns 
                                                                            ? "Loading..."
                                                                            : "Pilih penjamin"
                                                                    : "Pilih penjamin"
                                                            } />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dynamicGuarantors && dynamicGuarantors.length > 0 ? (
                                                                dynamicGuarantors.map((g) => (
                                                                    <SelectItem 
                                                                        key={g.id} 
                                                                        value={String(g.id)}
                                                                        disabled={isGuarantorSelected(g.id, index)}
                                                                    >
                                                                        {g.name}
                                                                        {isGuarantorSelected(g.id, index) && " (Sudah dipilih)"}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">Nomor Penjamin</Label>
                                                    <Input
                                                        value={guarantor.guarantor_number}
                                                        onChange={(e) => updateGuarantor(index, 'guarantor_number', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Nomor kartu/ID penjamin"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                        <Button variant="outline" asChild disabled={isSubmitting}>
                            <Link href={route('pelayanan.registrasi-rekam-medis.index')}>
                                Batal
                            </Link>
                        </Button>
                        <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white" disabled={isSubmitting}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Menyimpan...' : 'Update Data'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
} 