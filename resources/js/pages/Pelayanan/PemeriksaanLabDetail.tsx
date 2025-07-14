import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import AppShell from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AsyncSelect, { SelectOption } from '@/components/ui/async-select';
import InputError from '@/components/input-error';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pelayanan', href: '#' },
  { title: 'Pemeriksaan Lab', href: '/pelayanan/pemeriksaan-lab' },
  { title: 'Detail Pemeriksaan', href: '' },
];



interface Props {
  labQueue: {
    id: string;
    lab_visit_number: string;
    status: string;
    created_at: string;
    patientRecord: {
      name: string;
      nik: string;
      nip: string;
      medical_record_number: string;
      birth_date: string | null;
      age: number;
      gender: string;
      department: {
        name: string;
      } | null;
      employeeStatus: {
        name: string;
      } | null;
    };
    labRequest?: {
      id: string;
      labDetails: any[];
    } | null;
    labExamDetail?: {
      id: string;
      examiner?: {
        id: string;
        name: string;
      } | null;
      shift?: {
        id: string;
        name: string;
      } | null;
      guarantor?: {
        id: string;
        name: string;
      } | null;
    } | null;
  };
  labMasters: Array<{
    id: string;
    name: string;
    unit?: string;
  }>;
}

export default function PemeriksaanLabDetail({ labQueue, labMasters }: Props) {

  // Form untuk examiner, shift, dan guarantor
  const { data, setData, errors } = useForm({
    examiner_id: null as string | null,
    examiner_name: '',
    shift_id: null as string | null,
    shift_name: '',
    guarantor: null as string | null,
    guarantor_name: '',
    available_labs: [] as {
      id: string;
      name: string;
      unit: string;
      references: any[];
    }[],
    selected_labs: [] as string[], // Lab IDs yang di-checklist
    lab_requests: [] as {
      lab_master_id: string | null;
      lab_name: string;
      lab_unit: string;
      result: string;
      result_status: string;
      reference: string;
      reference_type?: string;
    }[],
  });

  const [showLabTable, setShowLabTable] = useState(false);

  // Pre-populate form dengan data yang sudah ada
  useEffect(() => {
    if (labQueue.labExamDetail) {
      setData(prev => ({
        ...prev,
        examiner_id: labQueue.labExamDetail?.examiner?.id || null,
        examiner_name: labQueue.labExamDetail?.examiner?.name || '',
        shift_id: labQueue.labExamDetail?.shift?.id || null,
        shift_name: labQueue.labExamDetail?.shift?.name || '',
        guarantor: labQueue.labExamDetail?.guarantor?.id || null,
        guarantor_name: labQueue.labExamDetail?.guarantor?.name || '',
      }));
    }
  }, [labQueue.labExamDetail]);

  // Load available labs
  useEffect(() => {
    const fetchAvailableLabs = async () => {
      try {
        const params = new URLSearchParams();
        const patientRecord = labQueue.patientRecord as any;
        params.append('company_id', patientRecord.company_id || '');
        params.append('plant_id', patientRecord.plant_id || '');
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
  }, [labQueue.patientRecord]);

  // Load existing lab data
  useEffect(() => {
    if (labQueue.labRequest?.labDetails && labQueue.labRequest.labDetails.length > 0) {
      const labRequests = labQueue.labRequest.labDetails.map(detail => {
        const labMaster = labMasters.find(master => master.id === detail.lab_master_id);
        return {
          lab_master_id: detail.lab_master_id,
          lab_name: labMaster?.name || '',
          lab_unit: labMaster?.unit || '',
          result: detail.labResult?.result || '',
          result_status: detail.labResult?.result_status || 'normal',
          reference: '', // Will be filled from lab master references
          reference_type: '',
        };
      });
      setData('lab_requests', labRequests);
      setShowLabTable(true);
    }
  }, [labQueue.labRequest, labMasters]);

  // Function to map gender
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

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Load options function
  const loadOptions = async (
    url: string,
    query: string,
    mapCallback: (item: any) => SelectOption,
    additionalParams?: Record<string, string>
  ) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      
      // Add additional parameters
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();
      return data.map(mapCallback);
    } catch (error) {
      console.error('Error loading options:', error);
      return [];
    }
  };

  // Fetch functions
  const fetchUsers = (query: string, callback: (options: SelectOption[]) => void) => {
    // Get patient's company and plant from labQueue
    const patientRecord = labQueue.patientRecord as any;
    const additionalParams = {
      company_id: patientRecord.company_id || '',
      plant_id: patientRecord.plant_id || '',
    };
    
    loadOptions(route('user.search'), query, (item) => ({ 
      id: item?.id || '', 
      name: item?.name || '', 
      code: item?.name || '' 
    }), additionalParams).then(callback);
  };

  const fetchShifts = (query: string, callback: (options: SelectOption[]) => void) => {
    // Get patient's company and plant from labQueue
    const patientRecord = labQueue.patientRecord as any;
    const additionalParams = {
      company_id: patientRecord.company_id || '',
      plant_id: patientRecord.plant_id || '',
    };
    
    loadOptions(route('shift.search'), query, (item) => ({ 
      id: item?.id || '', 
      name: item?.name || '', 
      code: item?.code || '' 
    }), additionalParams).then(callback);
  };

  const fetchGuarantors = (query: string, callback: (options: SelectOption[]) => void) => {
    // Get patient ID from labQueue
    const patientRecord = labQueue.patientRecord as any;
    const additionalParams = {
      patient_id: patientRecord.id || '',
    };
    
    loadOptions(route('patient-guarantors.search'), query, (item) => ({ 
      id: item?.id || '', 
      name: item?.name || '', 
      code: item?.guarantor_number || '' 
    }), additionalParams).then(callback);
  };

  const debouncedFetchUsers = debounce(fetchUsers, 500);
  const debouncedFetchShifts = debounce(fetchShifts, 500);
  const debouncedFetchGuarantors = debounce(fetchGuarantors, 500);

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
        const patientGender = mapGender(labQueue.patientRecord.gender);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (data.lab_requests.length === 0) {
      alert('Minimal harus ada satu pemeriksaan lab');
      return;
    }

    const hasEmptyResult = data.lab_requests.some(lab => !lab.result);
    if (hasEmptyResult) {
      alert('Semua hasil pemeriksaan harus diisi');
      return;
    }

    // Validasi examiner, shift, dan guarantor
    if (!data.examiner_id) {
      alert('Pemeriksa harus dipilih');
      return;
    }

    if (!data.shift_id) {
      alert('Shift harus dipilih');
      return;
    }

    if (!data.guarantor) {
      alert('Penjamin harus dipilih');
      return;
    }

    // Transform lab_requests to lab_details format for backend
    const lab_details = data.lab_requests.map(lab => ({
      lab_master_id: lab.lab_master_id,
      result: lab.result,
      result_status: lab.result_status,
    }));

    router.post(route('lab.store', labQueue.id), {
      lab_details: lab_details,
      examiner_id: data.examiner_id,
      shift_id: data.shift_id,
      guarantor_id: data.guarantor,
    });
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'H':
        return 'text-red-600 font-bold';
      case 'L':
        return 'text-blue-600 font-bold';
      default:
        return '';
    }
  };

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className='flex min-h-screen'>
        {/* Sidebar - Data Pasien dan Informasi Pemeriksaan */}
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
                  <p className='text-lg font-semibold'>{labQueue.patientRecord.name}</p>
                </div>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-gray-600'>NIK</Label>
                    <p className='text-sm text-gray-700'>{labQueue.patientRecord.nik}</p>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-gray-600'>NIP</Label>
                    <p className='text-sm text-gray-700'>{labQueue.patientRecord.nip}</p>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-gray-600'>No. RM</Label>
                    <p className='text-sm text-gray-700'>{labQueue.patientRecord.medical_record_number}</p>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-gray-600'>Tanggal Lahir</Label>
                    <p className='text-sm text-gray-700'>
                      {labQueue.patientRecord.birth_date ?? '-'}{' '}
                      ({labQueue.patientRecord.age} tahun)
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-gray-600'>Jenis Kelamin</Label>
                    <p className='text-sm text-gray-700'>{labQueue.patientRecord.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Pemeriksaan */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Informasi Pemeriksaan</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium text-gray-600'>No. Kunjungan Lab</Label>
                  <p className='text-sm text-gray-700'>{labQueue.lab_visit_number}</p>
                </div>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium text-gray-600'>Status</Label>
                  <p className='text-sm text-gray-700 capitalize'>{labQueue.status}</p>
                </div>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium text-gray-600'>Departemen</Label>
                  <p className='text-sm text-gray-700'>{labQueue.patientRecord.department?.name || '-'}</p>
                </div>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium text-gray-600'>Status Karyawan</Label>
                  <p className='text-sm text-gray-700'>{labQueue.patientRecord.employeeStatus?.name || '-'}</p>
                </div>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium text-gray-600'>Tanggal Pemeriksaan</Label>
                  <p className='text-sm text-gray-700'>{new Date(labQueue.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pilihan Shift */}
            <Card>
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
            </Card>

            {/* Pilihan Penjamin */}
            <Card>
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

            {/* Tombol Kembali */}
            <Card>
              <CardContent className='pt-4'>
                <Button 
                  variant="outline" 
                  onClick={() => router.visit(route('pelayanan.pemeriksaan-lab.index'))}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Antrian
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Section - Form Pemeriksaan Lab */}
        <div className='flex-1 p-6'>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Detail Pemeriksaan Laboratorium</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Pemeriksa */}
            <Card className="mb-6">
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
              <CardHeader>
                <CardTitle>Pemeriksaan Laboratorium</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Tombol Simpan */}
            <div className="flex justify-end mt-6">
              <Button type="submit" size="lg" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                <Save className="w-4 h-4 mr-2" />
                Simpan Hasil Pemeriksaan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
} 