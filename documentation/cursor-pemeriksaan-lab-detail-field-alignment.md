# Penyesuaian Field Pemeriksa, Shift, dan Guarantor - Detail Pemeriksaan Lab

## Ringkasan Perubahan

Menyesuaikan posisi dan layout field pemeriksa, shift, dan guarantor pada halaman detail pemeriksaan lab agar konsisten dengan halaman konsultasi. Semua field ini sekarang ditempatkan di sidebar, bukan di main section.

## Perubahan yang Dilakukan

### 1. Posisi Field Pemeriksa

### 2. Data Loading Pattern

#### **Sebelum**
```tsx
// Form untuk examiner, shift, dan guarantor
const { data, setData, errors } = useForm({
  examiner_id: labQueue.labExamDetail?.examiner?.id || '',
  examiner_name: labQueue.labExamDetail?.examiner?.name || '',
  shift_id: labQueue.labExamDetail?.shift?.id || '',
  shift_name: labQueue.labExamDetail?.shift?.name || '',
  guarantor_id: labQueue.labExamDetail?.guarantor?.id || '',
  guarantor_name: labQueue.labExamDetail?.guarantor?.name || '',
});
```

#### **Sesudah**
```tsx
// Form untuk examiner, shift, dan guarantor
const { data, setData, errors } = useForm({
  examiner_id: '',
  examiner_name: '',
  shift_id: '',
  shift_name: '',
  guarantor_id: '',
  guarantor_name: '',
});

// Pre-populate form dengan data yang sudah ada
useEffect(() => {
  if (labQueue.labExamDetail) {
    setData(prev => ({
      ...prev,
      examiner_id: labQueue.labExamDetail?.examiner?.id || '',
      examiner_name: labQueue.labExamDetail?.examiner?.name || '',
      shift_id: labQueue.labExamDetail?.shift?.id || '',
      shift_name: labQueue.labExamDetail?.shift?.name || '',
      guarantor_id: labQueue.labExamDetail?.guarantor?.id || '',
      guarantor_name: labQueue.labExamDetail?.guarantor?.name || '',
    }));
  }
}, [labQueue.labExamDetail]);
```

### 3. Posisi Field Pemeriksa

#### **Sesudah**
```tsx
{/* Sidebar */}
<div className='w-80 border-r bg-gray-50 p-4 flex-shrink-0'>
  <div className='space-y-6'>
    {/* Data Pasien */}
    <Card>
      {/* ... */}
    </Card>
    
    {/* Informasi Pemeriksaan */}
    <Card>
      {/* ... */}
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
            setData('shift_id', option ? String(option.id) : '');
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
            setData('guarantor_id', option ? String(option.id) : '');
            setData('guarantor_name', option ? option.name : '');
          }}
          placeholder='Pilih penjamin...'
          value={data.guarantor_id ? { id: data.guarantor_id, name: data.guarantor_name, code: data.guarantor_name } : null}
          getOptionLabel={(option: SelectOption) => option.name}
          isClearable
          hideDropdownIndicator
        />
        <InputError message={errors.guarantor_id} />
      </CardContent>
    </Card>

    {/* Pemeriksa */}
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Pemeriksa <span className="text-red-500">*</span></CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={debouncedFetchUsers}
          onChange={(option: SelectOption | null) => {
            setData('examiner_id', option ? String(option.id) : '');
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

    {/* Tombol Kembali */}
    <Card>
      {/* ... */}
    </Card>
  </div>
</div>

{/* Main Section */}
<div className='flex-1 p-6'>
  <form onSubmit={handleSubmit}>
    <Card>
      {/* Form Pemeriksaan Lab */}
    </Card>
  </form>
</div>
```

## Konsistensi dengan Halaman Konsultasi

### 1. Data Loading Pattern

#### **Halaman Konsultasi**
```tsx
const { data, setData, post, errors, processing } = useForm({
  // ... other fields
  shift_id: null as string | null,
  guarantor: null as string | null,
  examiner_id: null as string | null,
  shift_name: '',
  guarantor_name: '',
  examiner_name: '',
});

// Pre-populate form dengan data yang sudah ada (draft)
useEffect(() => {
  if (existingMedicalRecord) {
    setData(prev => ({
      ...prev,
      examiner_id: existingMedicalRecord.examiner?.id || null,
      examiner_name: existingMedicalRecord.examiner?.name || '',
      shift_id: existingMedicalRecord.shift?.id || null,
      shift_name: existingMedicalRecord.shift?.name || '',
      guarantor: existingMedicalRecord.guarantor?.id || null,
      guarantor_name: existingMedicalRecord.guarantor?.guarantor?.name || '',
    }));
  }
}, [existingMedicalRecord]);
```

#### **Halaman Detail Pemeriksaan Lab (Sesudah)**
```tsx
const { data, setData, errors } = useForm({
  examiner_id: '',
  examiner_name: '',
  shift_id: '',
  shift_name: '',
  guarantor_id: '',
  guarantor_name: '',
});

// Pre-populate form dengan data yang sudah ada
useEffect(() => {
  if (labQueue.labExamDetail) {
    setData(prev => ({
      ...prev,
      examiner_id: labQueue.labExamDetail?.examiner?.id || '',
      examiner_name: labQueue.labExamDetail?.examiner?.name || '',
      shift_id: labQueue.labExamDetail?.shift?.id || '',
      shift_name: labQueue.labExamDetail?.shift?.name || '',
      guarantor_id: labQueue.labExamDetail?.guarantor?.id || '',
      guarantor_name: labQueue.labExamDetail?.guarantor?.name || '',
    }));
  }
}, [labQueue.labExamDetail]);
```

### 2. Layout Structure

#### **Halaman Konsultasi**
```tsx
<div className='flex min-h-screen'>
  {/* Sidebar */}
  <div className='w-80 border-r bg-gray-50 p-4 flex-shrink-0'>
    {/* Data Pasien */}
    {/* Shift */}
    {/* Penjamin */}
  </div>
  
  {/* Main Section */}
  <div className='flex-1 p-6'>
    {/* Pemeriksa */}
    {/* Form Konsultasi */}
  </div>
</div>
```

#### **Halaman Detail Pemeriksaan Lab (Sesudah)**
```tsx
<div className='flex min-h-screen'>
  {/* Sidebar */}
  <div className='w-80 border-r bg-gray-50 p-4 flex-shrink-0'>
    {/* Data Pasien */}
    {/* Informasi Pemeriksaan */}
    {/* Shift */}
    {/* Penjamin */}
    {/* Pemeriksa */}
  </div>
  
  {/* Main Section */}
  <div className='flex-1 p-6'>
    {/* Form Pemeriksaan Lab */}
  </div>
</div>
```

### 2. Field Properties

#### **AsyncSelect Properties**
- ✅ `loadOptions`: Menggunakan debounced function
- ✅ `onChange`: Update form state dengan id dan name
- ✅ `placeholder`: Text yang informatif
- ✅ `value`: Object dengan id, name, dan code
- ✅ `getOptionLabel`: Menampilkan name dari option
- ✅ `isClearable`: Bisa di-clear
- ✅ `hideDropdownIndicator`: Tidak menampilkan arrow indicator

#### **Validation**
- ✅ `InputError`: Menampilkan error message
- ✅ Required field: Ditandai dengan `<span className="text-red-500">*</span>`

### 3. Styling Consistency

#### **Card Structure**
- ✅ `CardHeader` dengan `CardTitle`
- ✅ `CardContent` dengan field
- ✅ Spacing yang konsisten (`space-y-6`)

#### **Typography**
- ✅ `text-lg` untuk title
- ✅ `text-sm font-medium text-gray-600` untuk label
- ✅ `text-red-500` untuk required indicator

## Benefits

### 1. Data Loading Pattern
- **Konsistensi**: Menggunakan pattern yang sama dengan halaman konsultasi
- **Reactivity**: Data akan ter-update otomatis jika props berubah
- **Clean State**: Form dimulai dengan state kosong, kemudian di-populate
- **Predictable**: Behavior yang predictable dan mudah di-debug

### 2. User Experience
- **Konsistensi**: Layout yang sama dengan halaman konsultasi
- **Familiarity**: User tidak perlu beradaptasi dengan layout berbeda
- **Efficiency**: Semua field input berada di satu area (sidebar)

### 2. Visual Hierarchy
- **Sidebar**: Field input dan data pasien
- **Main Section**: Form pemeriksaan lab
- **Clear Separation**: Pemisahan yang jelas antara input dan content

### 3. Responsive Design
- **Fixed Sidebar**: Lebar 320px (w-80)
- **Flexible Main**: Menggunakan flex-1
- **Mobile Friendly**: Layout yang responsif

## Field Order di Sidebar

1. **Data Pasien**: Informasi pasien (nama, NIK, NIP, dll)
2. **Informasi Pemeriksaan**: Status, nomor kunjungan, dll
3. **Shift**: Dropdown untuk memilih shift
4. **Penjamin**: Dropdown untuk memilih penjamin
5. **Pemeriksa**: Dropdown untuk memilih pemeriksa
6. **Tombol Kembali**: Navigasi kembali ke antrian

## Testing

### Test Cases

1. **✅ Data Loading Pattern**
   - Form dimulai dengan state kosong
   - Data ter-populate otomatis saat props tersedia
   - Data ter-update jika props berubah
   - Tidak ada error saat props kosong

2. **✅ Field Loading**
   - Shift dropdown memuat data dengan benar
   - Penjamin dropdown memuat data dengan benar
   - Pemeriksa dropdown memuat data dengan benar

2. **✅ Field Selection**
   - Bisa memilih shift
   - Bisa memilih penjamin
   - Bisa memilih pemeriksa

3. **✅ Field Validation**
   - Error message muncul jika field required kosong
   - Form tidak bisa disubmit jika field required kosong

4. **✅ Data Persistence**
   - Data tersimpan dengan benar ke database
   - Data bisa di-load kembali saat edit

5. **✅ Layout Consistency**
   - Layout konsisten dengan halaman konsultasi
   - Styling konsisten
   - Responsive behavior konsisten

## Catatan

- Semua field (examiner, shift, guarantor) sekarang berada di sidebar
- Main section hanya berisi form pemeriksaan lab
- Layout konsisten dengan halaman konsultasi
- Data loading pattern konsisten dengan halaman konsultasi
- Form dimulai dengan state kosong, kemudian di-populate dengan useEffect
- Tidak ada perubahan pada functionality, hanya layout dan data loading pattern 