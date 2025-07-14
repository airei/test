import AppShell from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { OutpatientQueue as OutpatientQueueType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AsyncSelect, { SelectOption } from '@/components/ui/async-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormEventHandler, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pelayanan', href: '#' },
    { title: 'Rawat Jalan', href: '/pelayanan/rawat-jalan' },
    { title: 'Konsultasi', href: '' },
];

interface OutpatientQueueData {
    data: OutpatientQueueType & {
        patient_record: {
            id: string;
            name: string;
            medical_record_number: string;
            birth_date: string;
            age: number;
            gender: string;
            illness_history: string;
            company_id: string;
            plant_id: string;
            company: { name: string };
            plant: { name: string };
            department: { name: string };
        };
    };
}

interface Props {
    outpatientQueue: OutpatientQueueData;
    defaultGuarantor?: {
        id: string;
        guarantor_number?: string;
        guarantor: {
            id: string;
            name: string;
        };
    } | null;
    existingMedicalRecord?: {
        id: string;
        chief_complaint?: string;
        systolic_bp?: number;
        diastolic_bp?: number;
        pulse_rate?: number;
        temperature?: number;
        resp_rate?: number;
        oxygen_saturation?: number;
        weight?: number;
        height?: number;
        phys_exam?: string;
        status: string;
        examiner?: {
            id: string;
            name: string;
        };
        shift?: {
            id: string;
            name: string;
        };
        guarantor?: {
            id: string;
            guarantor_number?: string;
            guarantor: {
                id: string;
                name: string;
            };
        };
        diagnosis_details?: {
            diagnosa_text?: string;
            diagnosa?: {
                id: string;
                name: string;
                code: string;
                description: string;
            };
        }[];
        prescriptions?: {
            prescription_details?: {
                inventory_id: string;
                quantity: number;
                instruction?: string;
                inventory_item?: {
                    id: string;
                    name: string;
                    code: string;
                    unit: string;
                };
                inventoryItem?: {
                    id: string;
                    name: string;
                    code: string;
                    unit: string;
                };
            }[];
        }[];
    } | null;
}

export default function Konsultasi({
    outpatientQueue,
    defaultGuarantor,
    existingMedicalRecord,
    labRequests,
}: Props & { labRequests?: any[] }) {
    const queue = outpatientQueue.data;
    const [showLabTable, setShowLabTable] = useState(false);
    
    // State untuk form input obat temporary
    const [tempPrescriptionForm, setTempPrescriptionForm] = useState({
        inventory_id: null as string | null,
        inventory_name: '',
        inventory_code: '',
        inventory_unit: '',
        quantity: '' as string | number,
        instruction: ''
    });

    // State untuk form input diagnosis temporary
    const [tempDiagnosisForm, setTempDiagnosisForm] = useState({
        diagnosas_id: null as string | null,
        diagnosa_name: '',
        diagnosa_code: '',
        diagnosa_description: '',
        diagnosa_text: ''
    });

    if (!queue || !queue.patient_record) {
        return (
            <AppShell>
                <Head title='Memuat Konsultasi...' />
                <div className='flex h-full items-center justify-center'>
                    <p>Memuat data pasien...</p>
                </div>
            </AppShell>
        );
    }

    const { data, setData, post, errors, processing } = useForm({
        outpatient_queue_id: queue.id,
        tv_systolic_bp: '',
        tv_diastolic_bp: '',
        tv_pulse: '',
        tv_temperature: '',
        tv_respiration_rate: '',
        tv_oxygen_saturation: '',
        tv_weight: '',
        tv_height: '',
        tv_bmi: '',
        main_complaint: '',
        illness_history: queue?.patient_record?.illness_history ?? '',
        physical_examination: '',
        supporting_examination: '',
        diagnosis_details: [] as { diagnosas_id: string | null; diagnosa_name: string; diagnosa_code: string; diagnosa_description: string; diagnosa_text: string }[],
        prescriptions: [] as { 
            inventory_id: string | null; 
            inventory_name: string; 
            inventory_code: string; 
            inventory_unit: string;
            quantity: string | number; 
            instruction: string; 
        }[],
        lab_requests: [] as {
            lab_master_id: string | null;
            lab_name: string;
            lab_unit: string;
            result: string;
            result_status: string;
            reference: string;
            reference_type?: string;
        }[],
        available_labs: [] as {
            id: string;
            name: string;
            unit: string;
            references: any[];
        }[],
        selected_labs: [] as string[], // Lab IDs yang di-checklist
        shift_id: null as string | null,
        guarantor: null as string | null,
        examiner_id: null as string | null,
        shift_name: '',
        guarantor_name: '',
        examiner_name: '',
        save_as_draft: false as boolean,
    });

    const calculateBMI = (weight: string, height: string) => {
        const w = parseFloat(weight);
        const h = parseFloat(height) / 100; // convert cm to m
        if (w > 0 && h > 0) {
            const bmi = w / (h * h);
            return bmi.toFixed(2);
        }
        return '';
    };

    const getBMIStatus = (bmi: string) => {
        const bmiValue = parseFloat(bmi);
        if (!bmiValue) return '-';
        
        if (bmiValue < 18.5) return 'Underweight (Kekurangan Berat Badan)';
        if (bmiValue < 25) return 'Normal';
        if (bmiValue < 30) return 'Overweight (Kelebihan Berat Badan)';
        return 'Obese (Obesitas)';
    };

    useEffect(() => {
        const bmi = calculateBMI(data.tv_weight, data.tv_height);
        setData('tv_bmi', bmi);
    }, [data.tv_weight, data.tv_height]);

    useEffect(() => {
        if (defaultGuarantor) {
            setData(prev => ({
                ...prev,
                guarantor: defaultGuarantor.id,
                guarantor_name: defaultGuarantor.guarantor?.name || ''
            }));
        }
    }, [defaultGuarantor]);

    // Pre-populate form dengan data yang sudah ada (draft)
    useEffect(() => {
        if (existingMedicalRecord) {
            // Prepare diagnosis details dengan safe checking
            const diagnosisDetails = (existingMedicalRecord.diagnosis_details || []).map(detail => ({
                diagnosas_id: detail.diagnosa?.id || null,
                diagnosa_name: detail.diagnosa ? `${detail.diagnosa?.code || ''} - ${detail.diagnosa?.name || ''}` : '',
                diagnosa_code: detail.diagnosa?.code || '',
                diagnosa_description: detail.diagnosa?.description || '',
                diagnosa_text: detail.diagnosa_text || ''
            }));

            // Prepare prescriptions dengan safe checking
            const prescriptions = (existingMedicalRecord.prescriptions || []).flatMap(prescription => 
                (prescription.prescription_details || []).map(detail => ({
                    inventory_id: detail.inventory_id,
                    inventory_name: detail.inventory_item?.name || '',
                    inventory_code: detail.inventory_item?.code || '',
                    inventory_unit: detail.inventory_item?.unit || '',
                    quantity: detail.quantity,
                    instruction: detail.instruction || ''
                }))
            );

            // Update form data
            setData(prev => ({
                ...prev,
                tv_systolic_bp: existingMedicalRecord.systolic_bp?.toString() || '',
                tv_diastolic_bp: existingMedicalRecord.diastolic_bp?.toString() || '',
                tv_pulse: existingMedicalRecord.pulse_rate?.toString() || '',
                tv_temperature: existingMedicalRecord.temperature?.toString() || '',
                tv_respiration_rate: existingMedicalRecord.resp_rate?.toString() || '',
                tv_oxygen_saturation: existingMedicalRecord.oxygen_saturation?.toString() || '',
                tv_weight: existingMedicalRecord.weight?.toString() || '',
                tv_height: existingMedicalRecord.height?.toString() || '',
                main_complaint: existingMedicalRecord.chief_complaint || '',
                physical_examination: existingMedicalRecord.phys_exam || '',
                examiner_id: existingMedicalRecord.examiner?.id || null,
                examiner_name: existingMedicalRecord.examiner?.name || '',
                shift_id: existingMedicalRecord.shift?.id || null,
                shift_name: existingMedicalRecord.shift?.name || '',
                guarantor: existingMedicalRecord.guarantor?.id || null,
                guarantor_name: existingMedicalRecord.guarantor?.guarantor?.name || '',
                diagnosis_details: diagnosisDetails,
                prescriptions: prescriptions
            }));
        }
    }, [existingMedicalRecord]);

    useEffect(() => {
        // Load all available lab masters
        const fetchAvailableLabs = async () => {
            try {
                const params = new URLSearchParams();
                params.append('company_id', queue.patient_record.company_id || '');
                params.append('plant_id', queue.patient_record.plant_id || '');
                params.append('limit', '100'); // Get all labs
                
                const response = await fetch(`${route('laboratorium.search')}?${params.toString()}`);
                if (response.ok) {
                    const labs = await response.json();
                    setData('available_labs', labs);
                }
            } catch (error) {
                console.error('Error fetching available labs:', error);
            }
        };

        fetchAvailableLabs();
    }, [queue.patient_record.company_id, queue.patient_record.plant_id]);

    useEffect(() => {
        // Mapping labRequests (snake_case) ke state lab_requests (camelCase)
        if (labRequests && labRequests.length > 0) {
            setData('lab_requests', labRequests.map(lab => ({
                lab_master_id: lab.lab_master_id,
                lab_name: lab.lab_name,
                lab_unit: lab.lab_unit,
                result: lab.result,
                result_status: lab.result_status,
                reference: lab.reference,
                reference_type: lab.reference_type || '',
            })));
            setShowLabTable(true);
        }
    }, [labRequests]);

    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const loadOptions = async (
        url: string,
        query: string,
        mapCallback: (item: any) => SelectOption
    ) => {
        // Jika query kosong (user baru klik), ambil 5 data pertama saja
        const isInitial = query.length === 0;

        // Batasi pencarian jika query kurang dari 2 karakter (kecuali initial)
        if (!isInitial && query.length < 2) return [];

        try {
            const params = new URLSearchParams();
            
            // Add patient_id for patient-guarantors endpoint
            if (url.includes('patient-guarantors/search')) {
                params.append('patient_id', queue.patient_record.id);
            } else {
                params.append('company_id', queue.patient_record.company_id || '');
                params.append('plant_id', queue.patient_record.plant_id || '');
            }

            // Add context parameter for inventory search to ensure security
            if (url.includes('inventory/search')) {
                params.append('context', 'consultation');
            }

            if (!isInitial) {
                params.append('q', query);
            } else {
                params.append('limit', '5');
            }

            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.map(mapCallback);
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };
    
    const fetchDiagnoses = (query: string, callback: (options: SelectOption[]) => void) => {
        loadOptions(route('diagnosa.search'), query, (item) => {
            const mappedItem = { 
                id: item?.id || '', 
                name: `${item?.code || ''} - ${item?.name || ''}`, 
                code: item?.code || '',
                description: item?.description || '' 
            };
            return mappedItem;
        }).then((options) => {
            callback(options);
        });
    };

    const fetchInventories = (query: string, callback: (options: SelectOption[]) => void) => {
        loadOptions(route('inventory.search'), query, (item) => ({ ...item, name: `${item?.name || ''} (Stok: ${item?.stock || 0})`, code: item?.code || '' })).then(callback);
    };

    const fetchUsers = (query: string, callback: (options: SelectOption[]) => void) => {
        const loadOptionsWithParams = async (
            url: string,
            query: string,
            mapCallback: (item: any) => SelectOption
        ) => {
            const isInitial = query.length === 0;
            if (!isInitial && query.length < 2) return [];

            try {
                const params = new URLSearchParams();
                
                // Add company and plant params for user search
                params.append('company_id', queue.patient_record.company_id || '');
                params.append('plant_id', queue.patient_record.plant_id || '');
                
                if (query) params.append('q', query);
                params.append('limit', isInitial ? '5' : '15');

                const response = await fetch(`${url}?${params.toString()}`);
                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                return Array.isArray(data) ? data.map(mapCallback) : [];
            } catch (error) {
                console.error('Error loading options:', error);
                return [];
            }
        };

        loadOptionsWithParams(route('user.search'), query, (item) => ({ id: item?.id || '', name: item?.name || '', code: item?.name || '' })).then(callback);
    };

    const fetchShifts = (query: string, callback: (options: SelectOption[]) => void) => {
        loadOptions(route('shift.search'), query, (item) => ({ id: item?.id || '', name: item?.name || '', code: item?.code || '' })).then(callback);
    };

    const fetchGuarantors = (query: string, callback: (options: SelectOption[]) => void) => {
        // Use patient-guarantors endpoint
        loadOptions(route('patient-guarantors.search'), query, (item) => ({ id: item?.id || '', name: item?.name || '', code: item?.guarantor_number || '' })).then(callback);
    };

    const debouncedFetchDiagnoses = debounce(fetchDiagnoses, 500);
    const debouncedFetchInventories = debounce(fetchInventories, 500);
    const debouncedFetchUsers = debounce(fetchUsers, 500);
    const debouncedFetchShifts = debounce(fetchShifts, 500);
    const debouncedFetchGuarantors = debounce(fetchGuarantors, 500);
    
    const addDiagnosis = () => {
        setData('diagnosis_details', [
            ...data.diagnosis_details,
            { diagnosas_id: null, diagnosa_name: '', diagnosa_code: '', diagnosa_description: '', diagnosa_text: '' },
        ]);
    };

    const removeDiagnosis = (index: number) => {
        setData('diagnosis_details', data.diagnosis_details.filter((_, i) => i !== index));
    };

    const updateDiagnosis = (index: number, option: SelectOption | null) => {
        const newDetails = [...data.diagnosis_details];
        if(option) {
            newDetails[index] = {
                ...newDetails[index],
                diagnosas_id: option.id as string,
                diagnosa_name: option.name,
                diagnosa_code: option.code,
                diagnosa_description: (option as any).description || '',
            };
        } else {
            newDetails[index] = {
                ...newDetails[index],
                diagnosas_id: null,
                diagnosa_name: '',
                diagnosa_code: '',
                diagnosa_description: '',
            };
        }
        setData('diagnosis_details', newDetails);
    };

    const updateDiagnosisText = (index: number, text: string) => {
        const newDetails = [...data.diagnosis_details];
        newDetails[index] = {
            ...newDetails[index],
            diagnosa_text: text,
        };
        setData('diagnosis_details', newDetails);
    };

    const addPrescription = () => {
        // Validasi form temporary sebelum ditambahkan
        if (!tempPrescriptionForm.inventory_id || !tempPrescriptionForm.quantity || tempPrescriptionForm.quantity.toString().trim() === '') {
            alert('Silakan pilih obat dan masukkan jumlah yang valid sebelum menambahkan.');
            return;
        }

        // Tambahkan ke data prescriptions
        setData('prescriptions', [
            ...data.prescriptions,
            { ...tempPrescriptionForm }
        ]);

        // Reset form temporary
        setTempPrescriptionForm({
            inventory_id: null,
            inventory_name: '',
            inventory_code: '',
            inventory_unit: '',
            quantity: '',
            instruction: ''
        });
    };

    const removePrescription = (index: number) => {
        setData('prescriptions', data.prescriptions.filter((_, i) => i !== index));
    };

    const updatePrescription = (index: number, field: string, value: any, option?: SelectOption | null) => {
        const newPrescriptions = [...data.prescriptions];
        if (field === 'inventory_id' && option) {
            newPrescriptions[index] = {
                ...newPrescriptions[index],
                inventory_id: String(option.id),
                inventory_name: option.name,
                inventory_code: option.code || '',
                inventory_unit: (option as any).unit_name || '',
            };
        } else {
            newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
        }
        setData('prescriptions', newPrescriptions);
    };

    // Update temporary prescription form
    const updateTempPrescriptionForm = (field: string, value: any, option?: SelectOption | null) => {
        if (field === 'inventory_id' && option) {
            setTempPrescriptionForm({
                ...tempPrescriptionForm,
                inventory_id: String(option.id),
                inventory_name: option.name,
                inventory_code: option.code || '',
                inventory_unit: (option as any).unit_name || '',
            });
        } else {
            setTempPrescriptionForm({
                ...tempPrescriptionForm,
                [field]: value
            });
        }
    };

    // Update temporary diagnosis form
    const updateTempDiagnosisForm = (field: string, value: any, option?: SelectOption | null) => {
        if (field === 'diagnosas_id' && option) {
            setTempDiagnosisForm({
                ...tempDiagnosisForm,
                diagnosas_id: String(option.id),
                diagnosa_name: option.name,
                diagnosa_code: option.code || '',
                diagnosa_description: (option as any).description || '',
            });
        } else {
            setTempDiagnosisForm({
                ...tempDiagnosisForm,
                [field]: value
            });
        }
    };

    const addDiagnosisFromTemp = () => {
        // Validasi: diagnosas_id wajib diisi (harus pilih dari master data)
        if (!tempDiagnosisForm.diagnosas_id) {
            alert('Silakan pilih diagnosa dari master data terlebih dahulu!');
            return;
        }

        const newDiagnosis = {
            diagnosas_id: tempDiagnosisForm.diagnosas_id,
            diagnosa_name: tempDiagnosisForm.diagnosa_name,
            diagnosa_code: tempDiagnosisForm.diagnosa_code,
            diagnosa_description: tempDiagnosisForm.diagnosa_description,
            diagnosa_text: tempDiagnosisForm.diagnosa_text
        };

        setData('diagnosis_details', [...data.diagnosis_details, newDiagnosis]);
        
        // Reset form
        setTempDiagnosisForm({
            diagnosas_id: null,
            diagnosa_name: '',
            diagnosa_code: '',
            diagnosa_description: '',
            diagnosa_text: ''
        });
    };

    const toggleLabSelection = (lab: any) => {
        // Cek apakah lab sudah ada di table
        const isAlreadyInTable = data.lab_requests.some(req => req.lab_master_id === lab.id);
        if (isAlreadyInTable) {
            return; // Tidak bisa dipilih jika sudah ada di table
        }

        const isSelected = data.selected_labs.includes(lab.id);
        
        if (isSelected) {
            // Remove from selection
            setData('selected_labs', data.selected_labs.filter(id => id !== lab.id));
        } else {
            // Add to selection
            setData('selected_labs', [...data.selected_labs, lab.id]);
        }
    };

    // Tambahkan fungsi mapping gender yang fleksibel
    function mapGender(gender: string | undefined | null): 'male' | 'female' | '' {
        if (!gender) return '';
        const g = gender.toString().toLowerCase().trim();
        if ([
            'l', 'male', 'm', 'laki-laki', 'laki laki', 'pria'
        ].includes(g)) return 'male';
        if ([
            'p', 'female', 'f', 'perempuan', 'wanita'
        ].includes(g)) return 'female';
        return '';
    }

    const addSelectedLabsToTable = () => {
        const newLabRequests: Array<{
            lab_master_id: string | null;
            lab_name: string;
            lab_unit: string;
            result: string;
            result_status: string;
            reference: string;
            reference_type?: string;
        }> = [];

        data.selected_labs.forEach(labId => {
            const lab = data.available_labs.find(l => l.id === labId);
            if (lab) {
                // Gunakan mapping gender yang fleksibel
                const patientGender = mapGender(queue.patient_record.gender);
                const references = lab.references || [];
                let selectedReference = '';
                let referenceType = '';
                
                // Priority: Universal > Gender-specific
                const universalRef = references.find((ref: any) => ref.reference_type === 'universal');
                if (universalRef) {
                    selectedReference = universalRef.reference;
                    referenceType = 'Universal';
                } else {
                    // Jika tidak ada universal, cari berdasarkan gender
                    const genderRef = references.find((ref: any) => ref.reference_type === patientGender);
                    if (genderRef) {
                        selectedReference = genderRef.reference;
                        referenceType = patientGender === 'male' ? 'Laki-laki' : patientGender === 'female' ? 'Perempuan' : '';
                    }
                }

                // Debug log untuk memeriksa data
                console.log('Lab:', lab.name);
                console.log('Patient Gender:', patientGender);
                console.log('References:', references);
                console.log('Selected Reference:', selectedReference);
                console.log('Reference Type:', referenceType);

                newLabRequests.push({
                    lab_master_id: lab.id,
                    lab_name: lab.name,
                    lab_unit: lab.unit || '',
                    result: '',
                    result_status: 'normal',
                    reference: selectedReference,
                    reference_type: referenceType,
                });
            }
        });

        setData('lab_requests', [...data.lab_requests, ...newLabRequests]);
        setData('selected_labs', []); // Clear selection
        setShowLabTable(true); // Show table
    };

    const removeLabRequest = (index: number) => {
        const removedLab = data.lab_requests[index];
        
        // Hapus dari table
        setData('lab_requests', data.lab_requests.filter((_, i) => i !== index));
        
        // Hapus dari selected_labs jika ada
        const labMasterId = removedLab.lab_master_id;
        if (labMasterId && data.selected_labs.includes(labMasterId)) {
            setData('selected_labs', data.selected_labs.filter(id => id !== labMasterId));
        }
    };

    const updateLabRequest = (index: number, field: string, value: any) => {
        const newLabRequests = [...data.lab_requests];
        newLabRequests[index] = { ...newLabRequests[index], [field]: value };
        setData('lab_requests', newLabRequests);
    };
    
    const submitHandler: FormEventHandler = (e) => {
        e.preventDefault();
        
        post(route('konsultasi.store', { id: queue.id }));
    };

    const saveDraftHandler: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Create payload with explicit draft flag  
        const payload = {
            ...data,
            save_as_draft: true
        };
        
        // Submit with explicit payload
        router.post(route('konsultasi.store', { id: queue.id }), payload, {
            onSuccess: () => {
                console.log('Draft saved successfully');
            },
            onError: (errors: any) => {
                console.error('Error saving draft:', errors);
            }
        });
    };

    return (
        <AppShell breadcrumbs={breadcrumbs}>
            <Head title={`Konsultasi ${queue.patient_record.name}`} />
            <div className='flex min-h-screen'>
                {/* Sidebar - Data Pasien, Shift, dan Penjamin */}
                <div className='w-80 border-r bg-gray-50 p-4 flex-shrink-0'>
                    <div className='space-y-6'>
                        {/* Data Pasien */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Data Pasien</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-1'>
                                    <Label className='text-sm font-medium text-gray-600'>Nama Pasien</Label>
                                    <p className='text-lg font-semibold'>{queue?.patient_record?.name ?? 'Memuat...'}</p>
                                </div>
                                <div className='grid grid-cols-1 gap-3'>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>No. RM</Label>
                                        <p className='text-sm text-gray-700'>
                                            {queue?.patient_record?.medical_record_number ?? '-'}
                                        </p>
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>Tanggal Lahir</Label>
                                        <p className='text-sm text-gray-700'>
                                            {queue?.patient_record?.birth_date ?? '-'}{' '}
                                            ({queue?.patient_record?.age ?? 'N/A'} tahun)
                                        </p>
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>Jenis Kelamin</Label>
                                        <p className='text-sm text-gray-700'>{queue?.patient_record?.gender ?? '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>Perusahaan</Label>
                                        <p className='text-sm text-gray-700'>
                                            {queue?.patient_record?.company?.name ?? '-'}
                                        </p>
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>Plant</Label>
                                        <p className='text-sm text-gray-700'>
                                            {queue?.patient_record?.plant?.name ?? '-'}
                                        </p>
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-sm font-medium text-gray-600'>Departemen</Label>
                                        <p className='text-sm text-gray-700'>
                                            {queue?.patient_record?.department?.name ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        {/* Pilihan Shift */}
                            <CardHeader>
                                <CardTitle className='text-lg'>Shift <span className="text-red-500">*</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AsyncSelect
                                    loadOptions={debouncedFetchShifts}
                                    onChange={(option: SelectOption | null) => {
                                        setData('shift_id', option ? String(option.id) : null);
                                        setData('shift_name', option ? option.name : '');
                                    }}
                                    placeholder='Pilih shift...'
                                    value={data.shift_id ? { id: data.shift_id, name: data.shift_name, code: data.shift_name } : null}
                                    getOptionLabel={(option: SelectOption) => option.name}
                                    isClearable
                                    hideDropdownIndicator
                                />
                                <InputError message={errors.shift_id} />
                            </CardContent>

                        {/* Pilihan Penjamin */}
                            <CardHeader>
                                <CardTitle className='text-lg'>Penjamin <span className="text-red-500">*</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AsyncSelect
                                    loadOptions={debouncedFetchGuarantors}
                                    onChange={(option: SelectOption | null) => {
                                        setData('guarantor', option ? String(option.id) : null);
                                        setData('guarantor_name', option ? option.name : '');
                                    }}
                                    placeholder='Pilih penjamin...'
                                    value={data.guarantor ? { id: data.guarantor, name: data.guarantor_name, code: data.guarantor_name } : null}
                                    getOptionLabel={(option: SelectOption) => option.name}
                                    isClearable
                                    hideDropdownIndicator
                                />
                                <InputError message={errors.guarantor} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Section - Form Konsultasi */}
                <div className='flex-1 p-6'>
                    <form onSubmit={submitHandler} className='space-y-6'>
                        {/* Pemeriksa */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pemeriksa <span className="text-red-500">*</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={debouncedFetchUsers}
                                    onChange={(option: SelectOption | null) => {
                                        setData('examiner_id', option ? String(option.id) : null);
                                        setData('examiner_name', option ? option.name : '');
                                    }}
                                    placeholder='Pilih pemeriksa...'
                                    value={data.examiner_id ? { id: data.examiner_id, name: data.examiner_name, code: data.examiner_name } : null}
                                    getOptionLabel={(option: SelectOption) => option.name}
                                    isClearable
                                    hideDropdownIndicator
                                />
                                <InputError message={errors.examiner_id} />
                            </CardContent>
                        </Card>
						
                        <Card>
                        {/* Chief Complaint */}
                            <CardHeader>
                                <CardTitle>Chief Complaint <span className="text-red-500">*</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    value={data.main_complaint} 
                                    onChange={e => setData('main_complaint', e.target.value)} 
                                    placeholder='Masukkan keluhan utama pasien...'
                                    rows={3}
                                />
                                <InputError message={errors.main_complaint} />
                            </CardContent>

                        {/* Riwayat Penyakit */}
                            <CardHeader>
                                <CardTitle>Riwayat Penyakit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    value={data.illness_history} 
                                    onChange={e => setData('illness_history', e.target.value)} 
                                    placeholder='Masukkan riwayat penyakit pasien...'
                                    rows={3}
                                />
                                <InputError message={errors.illness_history} />
                            </CardContent>
                        </Card>

                        {/* Vital Signs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vital Signs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                    <div>
                                        <Label htmlFor='tv_systolic_bp'>Tekanan Darah Sistolik (mmHg)</Label>
                                        <Input 
                                            id='tv_systolic_bp' 
                                            value={data.tv_systolic_bp} 
                                            onChange={e => setData('tv_systolic_bp', e.target.value)} 
                                            placeholder='100-129' 
                                        />
                                        <InputError message={errors.tv_systolic_bp} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_diastolic_bp'>Tekanan Darah Diastolik (mmHg)</Label>
                                        <Input 
                                            id='tv_diastolic_bp' 
                                            value={data.tv_diastolic_bp} 
                                            onChange={e => setData('tv_diastolic_bp', e.target.value)} 
                                            placeholder='70-89' 
                                        />
                                        <InputError message={errors.tv_diastolic_bp} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_pulse'>Nadi (bpm)</Label>
                                        <Input 
                                            id='tv_pulse' 
                                            value={data.tv_pulse} 
                                            onChange={e => setData('tv_pulse', e.target.value)} 
                                            placeholder='60-100' 
                                        />
                                        <InputError message={errors.tv_pulse} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_respiration_rate'>Respirasi (per menit)</Label>
                                        <Input 
                                            id='tv_respiration_rate' 
                                            value={data.tv_respiration_rate} 
                                            onChange={e => setData('tv_respiration_rate', e.target.value)} 
                                            placeholder='16-20' 
                                        />
                                        <InputError message={errors.tv_respiration_rate} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_temperature'>Suhu (°C)</Label>
                                        <Input 
                                            id='tv_temperature' 
                                            value={data.tv_temperature} 
                                            onChange={e => setData('tv_temperature', e.target.value)} 
                                            placeholder='36.4-37,4' 
                                        />
                                        <InputError message={errors.tv_temperature} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_oxygen_saturation'>SpO2 (%)</Label>
                                        <Input 
                                            id='tv_oxygen_saturation' 
                                            value={data.tv_oxygen_saturation} 
                                            onChange={e => setData('tv_oxygen_saturation', e.target.value)} 
                                            placeholder='96-99' 
                                        />
                                        <InputError message={errors.tv_oxygen_saturation} />
                                    </div>
                                </div>
                            </CardContent>

                        {/* Antropometri & Status Gizi */}
                            <CardHeader>
                                <CardTitle>Antropometri & Status Gizi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                    <div>
                                        <Label htmlFor='tv_height'>Tinggi Badan (cm)</Label>
                                        <Input 
                                            id='tv_height' 
                                            value={data.tv_height} 
                                            onChange={e => setData('tv_height', e.target.value)} 
                                            placeholder='170' 
                                        />
                                        <InputError message={errors.tv_height} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_weight'>Berat Badan (kg)</Label>
                                        <Input 
                                            id='tv_weight' 
                                            value={data.tv_weight} 
                                            onChange={e => setData('tv_weight', e.target.value)} 
                                            placeholder='60' 
                                        />
                                        <InputError message={errors.tv_weight} />
                                    </div>
                                    <div>
                                        <Label htmlFor='tv_bmi'>BMI (kg/m²)</Label>
                                        <Input 
                                            id='tv_bmi' 
                                            value={data.tv_bmi} 
                                            readOnly 
                                            className="bg-gray-50"
                                        />
                                        <InputError message={errors.tv_bmi} />
                                    </div>
                                </div>
                                {data.tv_bmi && (
                                    <div className="p-3 bg-blue-50 rounded-md">
                                        <div className="text-sm font-medium text-blue-800">Status Gizi:</div>
                                        <div className="text-sm text-blue-700">{getBMIStatus(data.tv_bmi)}</div>
                                    </div>
                                )}
                            </CardContent>

                        {/* Pemeriksaan Fisik */}
                            <CardHeader>
                                <CardTitle>Pemeriksaan Fisik</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    value={data.physical_examination} 
                                    onChange={e => setData('physical_examination', e.target.value)} 
                                    placeholder='Masukkan hasil pemeriksaan fisik...'
                                    rows={4}
                                />
                                <InputError message={errors.physical_examination} />
                            </CardContent>
                        </Card>

                        {/* Diagnosa, Resep Obat & Laboratorium - Tab */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Asesement & Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="diagnosis" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="diagnosis">Diagnosa</TabsTrigger>
                                        <TabsTrigger value="prescription">Resep Obat</TabsTrigger>
                                        <TabsTrigger value="laboratory">Laboratorium</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="diagnosis" className="mt-4">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-gray-700">Daftar Diagnosis <span className="text-red-500">*</span>:</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[35%]">Diagnosa Tertulis (Opsional)</TableHead>
                                                        <TableHead className="w-[40%]">Diagnosa Master Data <span className="text-red-500">*</span></TableHead>
                                                        <TableHead className="w-[15%]">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {/* Form Input Row - Terintegrasi dalam table */}
                                                    <TableRow className="bg-gray-50 border-2 border-dashed border-gray-300">
                                                        <TableCell>
                                                            <Input 
                                                                value={tempDiagnosisForm.diagnosa_text}
                                                                onChange={e => updateTempDiagnosisForm('diagnosa_text', e.target.value)}
                                                                placeholder='Keterangan tambahan (opsional)...'
                                                                className='w-full'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                            <AsyncSelect
                                                cacheOptions
                                                defaultOptions
                                                loadOptions={debouncedFetchDiagnoses}
                                                                onChange={option => updateTempDiagnosisForm('diagnosas_id', option ? option.id : null, option)}
                                                                placeholder='🔍 *WAJIB* Pilih diagnosa dari master data...'
                                                                value={tempDiagnosisForm.diagnosas_id ? { 
                                                                    id: tempDiagnosisForm.diagnosas_id, 
                                                                    name: tempDiagnosisForm.diagnosa_name,
                                                                    code: tempDiagnosisForm.diagnosa_code
                                                                } : null}
                                                getOptionLabel={option => option.name}
                                                isClearable
                                                                hideDropdownIndicator
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                        <Button 
                                            type='button' 
                                                                onClick={addDiagnosisFromTemp}
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                + Tambah
                                        </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    
                                                    {/* Data Rows - Daftar diagnosis yang sudah ditambahkan */}
                                                    {data.diagnosis_details.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                                                Belum ada diagnosis yang ditambahkan. Gunakan form di baris atas untuk menambah diagnosis.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        data.diagnosis_details.map((diag, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell>
                                                                    <div className="text-sm text-gray-900">
                                                                        {diag.diagnosa_text || <span className="text-gray-400 italic">Tidak ada</span>}
                                                </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {diag.diagnosa_name}
                                            </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {diag.diagnosa_code}
                                        </div>
                                                                    {diag.diagnosa_description && (
                                                                        <div className="text-xs text-gray-500 mt-1 italic">
                                                                            {diag.diagnosa_description}
                                    </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                <Button 
                                    type='button' 
                                                                        variant='destructive' 
                                                                        size='sm' 
                                                                        onClick={() => removeDiagnosis(idx)}
                                                                    >
                                                                        ×
                                </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                            
                                <InputError message={errors.diagnosis_details} />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="prescription" className="mt-4">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-gray-700">Daftar Obat:</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[40%]">Nama Obat</TableHead>
                                                        <TableHead className="w-[15%]">Jumlah & Unit</TableHead>
                                                        <TableHead className="w-[20%]">Signa</TableHead>
                                                        <TableHead className="w-[20%]">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {/* Form Input Row - Terintegrasi dalam table */}
                                                    <TableRow className="bg-gray-50 border-2 border-dashed border-gray-300">
                                                        <TableCell>
                                            <AsyncSelect
                                                cacheOptions
                                                defaultOptions
                                                loadOptions={debouncedFetchInventories}
                                                                onChange={option => updateTempPrescriptionForm('inventory_id', option ? option.id : null, option)}
                                                                placeholder='🔍 Nama Obat'
                                                                value={tempPrescriptionForm.inventory_id ? { 
                                                                    id: tempPrescriptionForm.inventory_id, 
                                                                    name: tempPrescriptionForm.inventory_name,
                                                                    code: tempPrescriptionForm.inventory_code
                                                } : null}
                                                getOptionLabel={option => option.name}
                                                isClearable
                                                                hideDropdownIndicator
                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                            <Input 
                                                                    type='text' 
                                                                    value={tempPrescriptionForm.quantity} 
                                                                    onChange={e => updateTempPrescriptionForm('quantity', e.target.value)} 
                                                                    placeholder='Qty' 
                                                                    className='flex-1'
                                            />
                                                                <span className='text-sm text-gray-600 min-w-0 whitespace-nowrap'>
                                                                    {tempPrescriptionForm.inventory_unit || 'unit'}
                                                                </span>
                                        </div>
                                                        </TableCell>
                                                        <TableCell>
                                            <Input 
                                                                value={tempPrescriptionForm.instruction} 
                                                                onChange={e => updateTempPrescriptionForm('instruction', e.target.value)} 
                                                                placeholder='Dosis' 
                                                                className='w-full'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                type='button' 
                                                                onClick={addPrescription}
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                + Tambah
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    
                                                    {/* Data Rows - Daftar obat yang sudah ditambahkan */}
                                                    {data.prescriptions.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                                Belum ada obat yang ditambahkan. Gunakan form di baris atas untuk menambah obat.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        data.prescriptions.map((pres, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {pres.inventory_name}
                                        </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {pres.inventory_code}
                                        </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm text-gray-900">
                                                                        {pres.quantity} {pres.inventory_unit || 'unit'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm text-gray-900">
                                                                        {pres.instruction || '-'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                            <Button 
                                                type='button' 
                                                variant='destructive' 
                                                size='sm' 
                                                onClick={() => removePrescription(idx)}
                                            >
                                                                        ×
                                            </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                            
                                            <InputError message={errors['prescriptions']} />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="laboratory" className="mt-4">
                                        <div className="space-y-4">
                                            {/* Lab Selection Checkboxes */}
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                    Pilih Pemeriksaan Lab:
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                    {data.available_labs.map((lab) => {
                                                        const isSelected = data.selected_labs.includes(lab.id);
                                                        const isAlreadyInTable = data.lab_requests.some(req => req.lab_master_id === lab.id);
                                                        const isDisabled = isAlreadyInTable;
                                                        
                                                        return (
                                                            <label 
                                                                key={lab.id} 
                                                                className={`flex items-center space-x-2 ${
                                                                    isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected || isAlreadyInTable}
                                                                    onChange={() => toggleLabSelection(lab)}
                                                                    disabled={isDisabled}
                                                                    className={`rounded border-gray-300 focus:ring-blue-500 ${
                                                                        isDisabled 
                                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                                            : 'text-blue-600'
                                                                    }`}
                                                                />
                                                                <span className={`text-sm ${
                                                                    isDisabled 
                                                                        ? 'text-gray-400 line-through' 
                                                                        : 'text-gray-700'
                                                                }`}>
                                                                    {lab.name}
                                                                    {isAlreadyInTable && (
                                                                        <span className="ml-1 text-xs text-green-600 font-medium">
                                                                            ✓ Sudah dipilih
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                    </div>
                                                
                                                {/* Tombol Tambah Lab - hanya muncul jika ada yang di-checklist */}
                                                {data.selected_labs.length > 0 && (
                                                    <div className="flex justify-end">
                                <Button 
                                    type='button' 
                                                            onClick={addSelectedLabsToTable}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            Tambah Lab ({data.selected_labs.length})
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Lab Results Table */}
                                            {showLabTable && data.lab_requests.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 w-1/4">
                                                                    Nama Pemeriksaan
                                                                </th>
                                                                <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 w-1/6">
                                                                    Hasil Lab
                                                                </th>
                                                                <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 w-1/4">
                                                                    Nilai Referensi
                                                                </th>
                                                                <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 w-1/6">
                                                                    Unit
                                                                </th>
                                                                <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 w-1/6">
                                                                    Status
                                                                </th>
                                                                <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 w-16">
                                                                    Aksi
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.lab_requests.map((lab, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="border border-gray-200 px-3 py-2">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {lab.lab_name}
                                                                        </div>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-3 py-2">
                                                                        <Input
                                                                            value={lab.result} 
                                                                            onChange={e => updateLabRequest(idx, 'result', e.target.value)} 
                                                                            placeholder='Hasil...' 
                                                                            className="w-full"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-gray-200 px-3 py-2">
                                                                        <div className="text-sm text-gray-700 font-medium">
                                                                            {lab.reference || 'Referensi tidak tersedia'}
                                                                        </div>
                                                                        {lab.reference_type && (
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                ({lab.reference_type})
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border border-gray-200 px-3 py-2">
                                                                        <div className="text-sm text-gray-700 font-medium">
                                                                            {lab.lab_unit || '-'}
                                                                        </div>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-3 py-2 text-center">
                                                                        <button
                                                                            type='button'
                                                                            onClick={() => updateLabRequest(idx, 'result_status', lab.result_status === 'normal' ? 'abnormal' : 'normal')}
                                                                            className={`px-4 py-2 rounded text-sm font-medium transition-colors min-w-[80px] ${
                                                                                lab.result_status === 'normal' 
                                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                                    : 'bg-red-100 text-red-800 hover:bg-red-200 font-bold'
                                                                            }`}
                                                                        >
                                                                            {lab.result_status === 'normal' ? 'Normal' : 'Abnormal'}
                                                                        </button>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-3 py-2 text-center">
                                                                        <Button 
                                                                            type='button' 
                                                                            variant='destructive' 
                                    size='sm' 
                                                                            onClick={() => removeLabRequest(idx)}
                                                                            className="w-8 h-8 p-0"
                                >
                                                                            ×
                                </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            
                                            <InputError message={errors['lab_requests']} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Tombol Simpan */}
                        <div className='flex justify-between'>
                            <Button 
                                type='button' 
                                variant='outline' 
                                disabled={processing} 
                                size='lg'
                                onClick={saveDraftHandler}
                            >
                                {processing ? 'Menyimpan Draft...' : 'Simpan sebagai Draft'}
                            </Button>
                            <Button type='submit' disabled={processing} size='lg'>
                                {processing ? 'Menyimpan...' : 'Simpan Konsultasi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
}
