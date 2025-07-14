# Perbaikan Konsistensi Field Pemeriksaan Lab

## Masalah yang Ditemukan

Setelah penyesuaian field pemeriksa, shift, dan penjamin di halaman detail pemeriksaan lab agar sama dengan halaman konsultasi, ditemukan beberapa masalah:

1. **Pemeriksa belum menampilkan pilihan** - dropdown tidak menampilkan data user
2. **Shift sudah menampilkan, tapi tidak terfilter** - menampilkan semua shift tanpa filter company/plant
3. **Penjamin belum menampilkan pilihan** - dropdown tidak menampilkan data penjamin pasien

## Analisis Masalah

### 1. Pemeriksa (User Search)
- **Masalah**: Route `user.search` memerlukan parameter `company_id` dan `plant_id` untuk filtering
- **Penyebab**: Frontend tidak mengirim parameter yang diperlukan
- **Solusi**: Tambahkan parameter `company_id` dan `plant_id` dari data pasien

### 2. Shift Search
- **Masalah**: Route `shift.search` memerlukan parameter `company_id` dan `plant_id` untuk filtering
- **Penyebab**: Frontend tidak mengirim parameter yang diperlukan
- **Solusi**: Tambahkan parameter `company_id` dan `plant_id` dari data pasien

### 3. Penjamin (Patient Guarantors Search)
- **Masalah**: Route `patient-guarantors.search` memerlukan parameter `patient_id`
- **Penyebab**: Frontend tidak mengirim parameter yang diperlukan
- **Solusi**: Tambahkan parameter `patient_id` dari data pasien

## Perbaikan yang Dilakukan

### 1. Backend - Controller PemeriksaanLabController.php

**File**: `app/Http/Controllers/Pelayanan/PemeriksaanLabController.php`

**Method**: `show($id)`

**Perubahan**: Menambahkan `id`, `company_id`, dan `plant_id` ke data patientRecord yang dikirim ke frontend

```php
'patientRecord' => [
    'id' => $labQueue->patientRecord->id,                    // ✅ Ditambahkan
    'name' => $labQueue->patientRecord->name,
    'nik' => $labQueue->patientRecord->nik,
    'nip' => $labQueue->patientRecord->nip,
    'medical_record_number' => $labQueue->patientRecord->medical_record_number,
    'birth_date' => $labQueue->patientRecord->birth_date ? $labQueue->patientRecord->birth_date->format('Y-m-d') : null,
    'age' => $labQueue->patientRecord->age,
    'gender' => $labQueue->patientRecord->gender,
    'company_id' => $labQueue->patientRecord->company_id,    // ✅ Ditambahkan
    'plant_id' => $labQueue->patientRecord->plant_id,        // ✅ Ditambahkan
    'department' => $labQueue->patientRecord->department ? [
        'name' => $labQueue->patientRecord->department->name,
    ] : null,
    'employeeStatus' => $labQueue->patientRecord->employeeStatus ? [
        'name' => $labQueue->patientRecord->employeeStatus->name,
    ] : null,
],
```

### 2. Frontend - PemeriksaanLabDetail.tsx

**File**: `resources/js/pages/Pelayanan/PemeriksaanLabDetail.tsx`

**Perubahan**: Memperbaiki fungsi fetch untuk menambahkan parameter yang diperlukan

#### A. Perbaikan fungsi loadOptions
```typescript
const loadOptions = async (
  url: string,
  query: string,
  mapCallback: (item: any) => SelectOption,
  additionalParams?: Record<string, string>  // ✅ Ditambahkan parameter
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
```

#### B. Perbaikan fungsi fetchUsers
```typescript
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
```

#### C. Perbaikan fungsi fetchShifts
```typescript
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
```

#### D. Perbaikan fungsi fetchGuarantors
```typescript
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
```

## Hasil Perbaikan

Setelah perbaikan ini:

1. **Pemeriksa**: ✅ Menampilkan pilihan user yang sesuai dengan company dan plant pasien
2. **Shift**: ✅ Menampilkan pilihan shift yang terfilter sesuai company dan plant pasien  
3. **Penjamin**: ✅ Menampilkan pilihan penjamin yang terkait dengan pasien tersebut

## Konsistensi dengan Halaman Konsultasi

Sekarang halaman detail pemeriksaan lab memiliki konsistensi penuh dengan halaman konsultasi dalam hal:

- ✅ Field name dan tipe data yang sama
- ✅ Parameter filtering yang sama
- ✅ Validasi yang sama
- ✅ User experience yang sama

## Testing

Untuk memastikan perbaikan berfungsi:

1. Buka halaman pemeriksaan lab
2. Klik tombol "Mulai Pemeriksaan" pada salah satu antrian
3. Di halaman detail, coba klik dropdown:
   - **Pemeriksa**: Harus menampilkan user dari company/plant yang sama
   - **Shift**: Harus menampilkan shift dari company/plant yang sama
   - **Penjamin**: Harus menampilkan penjamin yang terkait dengan pasien

## Catatan Penting

- Pastikan data pasien memiliki `company_id` dan `plant_id` yang valid
- Pastikan ada data user, shift, dan penjamin yang sesuai dengan company/plant pasien
- Jika tidak ada data yang sesuai, dropdown akan kosong (sesuai dengan logika filtering) 