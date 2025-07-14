# Implementasi Sistem Checkbox Pemeriksaan Lab

## Overview

Halaman detail pemeriksaan laboratorium telah diubah dari sistem tab menjadi sistem checkbox yang konsisten dengan halaman konsultasi. Perubahan ini meningkatkan user experience dan konsistensi antar halaman.

## Perubahan yang Dilakukan

### 1. Menghilangkan Tab System

**Sebelum**: Menggunakan tab "Pemeriksaan Lab" dan "Hasil Pemeriksaan"
**Sesudah**: Menggunakan sistem checkbox langsung tanpa tab

### 2. Implementasi Checkbox System

#### A. State Management
```typescript
const { data, setData, errors } = useForm({
  // ... existing fields
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
```

#### B. Load Available Labs
```typescript
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
```

#### C. Load Existing Lab Data
```typescript
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
```

### 3. Fungsi-fungsi Utama

#### A. Toggle Lab Selection
```typescript
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
```

#### B. Add Selected Labs to Table
```typescript
const addSelectedLabsToTable = () => {
  const newLabRequests = [];

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
```

#### C. Remove Lab Request
```typescript
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
```

#### D. Update Lab Request
```typescript
const updateLabRequest = (index: number, field: string, value: any) => {
  const newLabRequests = [...data.lab_requests];
  newLabRequests[index] = { ...newLabRequests[index], [field]: value };
  setData('lab_requests', newLabRequests);
};
```

### 4. UI Components

#### A. Checkbox Selection Area
```tsx
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
```

#### B. Lab Results Table
```tsx
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
```

### 5. Form Submission

#### A. Updated Handle Submit
```typescript
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
```

## Fitur-fitur yang Ditambahkan

### 1. Checkbox Selection
- ✅ Pilih pemeriksaan lab dengan checkbox
- ✅ Visual feedback untuk lab yang sudah dipilih
- ✅ Disable checkbox untuk lab yang sudah ada di tabel

### 2. Dynamic Table
- ✅ Tabel muncul setelah menekan tombol "Tambah Lab"
- ✅ Kolom: Nama Pemeriksaan, Hasil Lab, Nilai Referensi, Unit, Status, Aksi
- ✅ Input field untuk hasil lab
- ✅ Toggle button untuk status Normal/Abnormal
- ✅ Tombol hapus untuk setiap baris

### 3. Reference System
- ✅ Otomatis load nilai referensi berdasarkan gender pasien
- ✅ Priority: Universal > Gender-specific
- ✅ Display reference type (Universal/Laki-laki/Perempuan)

### 4. Data Persistence
- ✅ Load existing lab data saat edit
- ✅ Transform data untuk backend compatibility
- ✅ Maintain state consistency

## Konsistensi dengan Halaman Konsultasi

Sekarang halaman pemeriksaan lab memiliki konsistensi penuh dengan halaman konsultasi dalam hal:

- ✅ UI/UX yang sama
- ✅ Logic yang sama
- ✅ Data structure yang sama
- ✅ Reference handling yang sama
- ✅ Form validation yang sama

## Testing

Untuk memastikan implementasi berfungsi:

1. Buka halaman pemeriksaan lab
2. Klik tombol "Mulai Pemeriksaan" pada salah satu antrian
3. Di halaman detail:
   - ✅ Checkbox lab tersedia dan bisa dipilih
   - ✅ Tombol "Tambah Lab" muncul setelah memilih checkbox
   - ✅ Tabel muncul setelah menekan tombol tambah
   - ✅ Input field untuk hasil lab berfungsi
   - ✅ Toggle status Normal/Abnormal berfungsi
   - ✅ Tombol hapus berfungsi
   - ✅ Form submission berfungsi

## Catatan Penting

- Pastikan data lab master memiliki references yang sesuai
- Pastikan patient record memiliki gender yang valid
- Jika tidak ada references, akan menampilkan "Referensi tidak tersedia"
- Data akan disimpan dalam format yang kompatibel dengan backend 