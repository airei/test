# Dokumentasi Sistem Laboratorium

## Overview
Sistem laboratorium pada aplikasi Medicare digunakan untuk mengelola data master pemeriksaan laboratorium beserta referensi nilainya.

## File yang Dibutuhkan

### 1. Frontend (React/Inertia)
- **resources/js/pages/Manajemen/Laboratorium/Create.tsx**
  - Halaman form tambah laboratorium
  - Menggunakan komponen UI dari shadcn/ui
  - Mendukung multiple references (universal, male, female)

### 2. Backend (Laravel)
- **app/Http/Controllers/Manajemen/LaboratoriumController.php**
  - Controller untuk handle CRUD laboratorium
  - Sistem store yang simple dan mudah dipahami
  - Validasi data yang straightforward

### 3. Model
- **app/Models/LabMaster.php**
  - Model utama laboratorium
  - Relasi dengan LabReference, Company, Plant, User
- **app/Models/LabReference.php**
  - Model referensi laboratorium
  - Mendukung 3 jenis: universal, male, female

### 4. Database
- **database/migrations/2025_06_25_000005_create_lab_masters_table.php**
- **database/migrations/2025_06_25_000006_create_lab_references_table.php**

### 5. Routing
- **routes/web.php** - Route resource untuk laboratorium

## Fitur Utama

### 1. Create Laboratorium
- Form input sederhana: nama, unit, harga
- Dynamic references (bisa tambah/hapus)
- Validasi client-side dan server-side
- Auto-save dengan created_by

### 2. Store Data (Simple)
```php
// Validasi sederhana
$request->validate([
    'name' => 'required|string|max:100',
    'unit' => 'required|string|max:50',
    'price' => 'required|numeric|min:0',
    'references' => 'required|array|min:1',
    'references.*.type' => 'required|in:universal,male,female',
    'references.*.reference' => 'required|string',
]);

// Simpan lab master
$labMaster = LabMaster::create([
    'name' => $request->name,
    'unit' => $request->unit,
    'price' => $request->price,
    'is_active' => true,
    'created_by' => Auth::id(),
]);

// Simpan references
foreach ($request->references as $ref) {
    LabReference::create([
        'lab_master_id' => $labMaster->id,
        'reference_type' => $ref['type'],
        'reference' => $ref['reference'],
        'created_by' => Auth::id(),
    ]);
}
```

### 3. Struktur Data
```typescript
interface Reference {
  type: 'universal' | 'male' | 'female';
  reference: string;
}

interface LabMaster {
  name: string;
  unit: string;
  price: number;
  references: Reference[];
}
```

## Cara Penggunaan

### 1. Akses Halaman
- URL: `/manajemen/laboratorium/create`
- Route: `laboratorium.create`

### 2. Input Data
1. Isi nama pemeriksaan (contoh: Hemoglobin)
2. Isi unit (contoh: g/dL)
3. Isi harga (contoh: 50000)
4. Tambah referensi dengan klik "Tambah Referensi"
5. Pilih jenis referensi (Universal/Laki-laki/Perempuan)
6. Isi nilai referensi (contoh: 12-16 g/dL)

### 3. Simpan Data
- Klik tombol "Simpan"
- Data akan disimpan ke database
- Redirect ke halaman index dengan pesan sukses

## Validasi

### Client-side
- Minimal 1 referensi
- Semua field wajib diisi
- Nilai referensi tidak boleh kosong

### Server-side
- Validasi Laravel dengan pesan error yang jelas
- Try-catch untuk handle error database
- Redirect dengan flash message

## Keunggulan Sistem

1. **Simple & Clean**: Kode mudah dipahami dan dipelihara
2. **User-friendly**: Interface yang intuitif
3. **Flexible**: Bisa tambah multiple references
4. **Robust**: Validasi lengkap dan error handling
5. **Consistent**: Mengikuti pola aplikasi yang sudah ada

## Troubleshooting

### Error Umum
1. **"Minimal harus ada 1 referensi!"**
   - Pastikan sudah menambah minimal 1 referensi

2. **"Semua nilai referensi harus diisi!"**
   - Pastikan semua field referensi sudah diisi

3. **"Gagal menyimpan data"**
   - Cek log Laravel untuk detail error
   - Pastikan database connection normal

### Debug
- Gunakan `dd($request->all())` di controller untuk cek data
- Cek browser console untuk error JavaScript
- Monitor Laravel log di `storage/logs/laravel.log`

## Maintenance

### Backup Data
- Backup tabel `lab_masters` dan `lab_references`
- Export data secara berkala

### Update
- Untuk menambah field baru, update migration dan model
- Test di environment development dulu
- Backup sebelum deploy ke production

## Kesimpulan

Sistem laboratorium ini dirancang dengan prinsip **KISS (Keep It Simple, Stupid)** untuk memudahkan maintenance dan pengembangan di masa depan. Kode yang simple namun tetap robust dan user-friendly.

# Modul Laboratorium - Multi-Tenant System

## Overview
Modul laboratorium telah diimplementasikan dengan sistem multi-tenant yang memungkinkan setiap user memiliki akses ke data berdasarkan perusahaan dan plant yang dipilih.

## Fitur Multi-Tenant

### 1. **Dropdown Company & Plant (Super Admin Only)**
- **Super Admin**: Dropdown untuk memilih perusahaan dan plant
- **User Biasa**: Tidak ada dropdown, menggunakan profil default
- **Dynamic Plants**: Plant dropdown berubah berdasarkan company yang dipilih
- **Single Selection**: Hanya bisa memilih 1 company dan 1 plant yang terkait

### 2. **Role-based Access**
- **Super Admin**: Dapat memilih company dan plant manapun
- **User Biasa**: Otomatis menggunakan company dan plant dari profil mereka
- **Backend Security**: Validasi role dan access control

### 3. **Form Structure**
```
1. Company & Plant Dropdown (Super Admin Only)
2. Data Utama (Nama, Unit, Harga)
3. Referensi Laboratorium (Dynamic)
4. Action Buttons
```

## Implementasi Frontend

### **Create.tsx Features**
- ✅ Dropdown company dan plant hanya untuk super admin
- ✅ Dynamic plant dropdown berdasarkan company yang dipilih
- ✅ Radio button untuk jenis referensi (Universal/Male/Female)
- ✅ Input field untuk nilai referensi
- ✅ Dynamic references management (tambah/hapus)
- ✅ Clean UX tanpa popup notifications
- ✅ Simple form tanpa info box yang mengganggu

### **Form Validation**
- Company dan plant harus dipilih (super admin)
- Semua field utama harus diisi
- Minimal 1 referensi
- Semua nilai referensi harus diisi

### **Data Submission**
- Menggunakan fetch API untuk mengirim data
- FormData untuk handling references array
- JSON response handling
- Simple error handling tanpa popup

## Implementasi Backend

### **Controller Methods**

#### **Create Method**
```php
public function create()
{
    $user = auth()->user();
    
    $data = [
        'isSuperAdmin' => $user->is_super_admin,
        'userCompany' => null,
        'userPlant' => null,
    ];

    if ($user->is_super_admin) {
        $data['companies'] = Company::all();
        $data['plants'] = Plant::all();
    } else {
        $data['userCompany'] = Company::find($user->company_id);
        $data['userPlant'] = Plant::find($user->plant_id);
    }

    return Inertia::render('Manajemen/Laboratorium/Create', $data);
}
```

#### **Get Plants By Company Method**
```php
public function getPlantsByCompany($companyId)
{
    $plants = Plant::where('company_id', $companyId)->get();
    return response()->json($plants);
}
```

#### **Store Method (Simplified)**
```php
public function store(Request $request)
{
    try {
        // Validasi input
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'plant_id' => 'required|exists:plants,id',
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'references' => 'required|array|min:1',
            'references.*.type' => 'required|in:universal,male,female',
            'references.*.reference' => 'required|string|max:255',
        ]);

        // Role-based assignment
        $user = auth()->user();
        $companyId = $user->is_super_admin ? $request->company_id : $user->company_id;
        $plantId = $user->is_super_admin ? $request->plant_id : $user->plant_id;

        // Create lab master and references
        $labMaster = LabMaster::create([...]);
        
        foreach ($request->references as $referenceData) {
            LabReference::create([...]);
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}
```

### **Routes**
```php
Route::get('laboratorium/plants/{companyId}', [LaboratoriumController::class, 'getPlantsByCompany'])
    ->name('laboratorium.plants-by-company');
```

## UX Improvements

### **Clean Interface**
- ❌ Hilangkan popup notifications
- ❌ Hilangkan info box multi-tenant
- ❌ Hilangkan debug information
- ✅ Simple form tanpa gangguan
- ✅ Direct navigation setelah submit

### **Super Admin Experience**
- Dropdown company dan plant
- Dynamic plant loading
- Single selection constraint
- Clean form submission

### **User Biasa Experience**
- Tidak ada dropdown yang membingungkan
- Otomatis menggunakan profil mereka
- Simple form tanpa complexity

## Multi-Tenant Security

### **Access Control**
1. **Super Admin**: Dapat memilih company dan plant manapun
2. **User Biasa**: Terbatas pada company dan plant profil mereka
3. **Backend Validation**: Memastikan data isolation

### **Data Isolation**
- Data laboratorium terisolasi berdasarkan company dan plant
- Query filtering otomatis berdasarkan user context
- Validasi backend untuk mencegah unauthorized access

## Testing Checklist

### **Frontend Testing**
- [ ] Dropdown company dan plant hanya muncul untuk super admin
- [ ] Dynamic plant loading berdasarkan company
- [ ] Form validation tanpa popup
- [ ] Clean submission process
- [ ] No unnecessary info boxes

### **Backend Testing**
- [ ] Role-based access control
- [ ] Dynamic plant API
- [ ] Data isolation
- [ ] Simple JSON response
- [ ] Error handling

### **Multi-Tenant Testing**
- [ ] Super admin dapat memilih company/plant
- [ ] User biasa tidak melihat dropdown
- [ ] Data terisolasi dengan benar
- [ ] Plant terkait dengan company yang dipilih

## Key Benefits
- **Clean UX**: Tanpa popup dan info box yang mengganggu
- **Simple Process**: Proses store yang straightforward
- **Role-based**: Dropdown hanya untuk yang membutuhkan
- **Dynamic**: Plant berubah berdasarkan company
- **Secure**: Multi-tenant data isolation

# Laboratorium - Dokumentasi Lengkap

## Overview
Modul Laboratorium mengelola data master laboratorium dengan sistem multi-tenant dan role-based access control.

## Fitur Utama
- ✅ CRUD Laboratorium Master
- ✅ Multi-tenant (Company & Plant)
- ✅ Role-based Access Control
- ✅ Import/Export (jika diperlukan)
- ✅ Validasi Referensi (Universal, Male, Female)
- ✅ Policy & Authorization

## Struktur Database

### LabMaster
- `id` (UUID) - Primary Key
- `company_id` (UUID) - Foreign Key ke companies
- `plant_id` (UUID) - Foreign Key ke plants
- `name` (String) - Nama pemeriksaan
- `unit` (String) - Satuan
- `price` (Decimal) - Harga
- `is_active` (Boolean) - Status aktif
- `created_by` (UUID) - User yang membuat
- `updated_by` (UUID) - User yang update terakhir
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### LabReference
- `id` (UUID) - Primary Key
- `lab_master_id` (UUID) - Foreign Key ke lab_masters
- `reference_type` (Enum: universal, male, female)
- `reference` (String) - Nilai referensi
- `created_by` (UUID) - User yang membuat
- `updated_by` (UUID) - User yang update terakhir
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Authorization & Policy

### LabMasterPolicy
Policy yang mengatur akses ke data Laboratorium:

#### Kriteria Authorization:
1. **Super Admin**: Bisa akses semua data (create, read, update, delete)
2. **User Biasa**: Hanya bisa akses data milik company/plant mereka

#### Method Policy:
- `viewAny()`: Semua user login bisa lihat list
- `view()`: Super admin semua, user biasa hanya data milik mereka
- `create()`: Semua user login bisa create
- `update()`: Super admin semua, user biasa hanya data milik mereka
- `delete()`: Super admin semua, user biasa hanya data milik mereka
- `restore()`: Super admin semua, user biasa hanya data milik mereka
- `forceDelete()`: Super admin semua, user biasa hanya data milik mereka

### Implementasi di Controller
```php
// Di setiap method yang memerlukan authorization
$this->authorize('delete', $laboratorium);

// Validasi multi-tenant tambahan
$user = Auth::user();
$isSuperAdmin = $user->role && $user->role->name === 'super_admin';

if (!$isSuperAdmin) {
    if ($laboratorium->company_id !== $user->company_id || 
        $laboratorium->plant_id !== $user->plant_id) {
        abort(403, 'Anda tidak memiliki akses ke data ini.');
    }
}
```

## Multi-Tenant Implementation

### Frontend (Create Form)
- **Super Admin**: Dropdown company dan plant
- **User Biasa**: Otomatis dari profil user
- Plant dropdown dinamis berdasarkan company yang dipilih

### Backend (Controller)
- **Super Admin**: Bisa pilih company/plant
- **User Biasa**: Otomatis dari user profile
- Filter data berdasarkan company/plant user

### Database Query
```php
// Filter untuk user biasa
if (!$isSuperAdmin) {
    $query->where('company_id', $user->company_id)
          ->where('plant_id', $user->plant_id);
}
```

## API Endpoints

### Routes
```php
Route::prefix('manajemen')->middleware(['auth', 'verified'])->group(function () {
    Route::resource('laboratorium', LaboratoriumController::class)
        ->names('laboratorium')
        ->parameters(['laboratorium' => 'labMaster']);
    
    Route::patch('laboratorium/{laboratorium}/toggle-status', 
        [LaboratoriumController::class, 'toggleStatus'])
        ->name('laboratorium.toggle-status');
    
    Route::get('laboratorium/plants/{companyId}', 
        [LaboratoriumController::class, 'getPlantsByCompany'])
        ->name('laboratorium.plants-by-company');
});
```

### Controller Methods
- `index()` - List laboratorium dengan filter multi-tenant
- `create()` - Form create dengan dropdown company/plant untuk super admin
- `store()` - Simpan data dengan validasi multi-tenant
- `edit()` - Form edit dengan authorization
- `update()` - Update data dengan authorization
- `destroy()` - Hapus data dengan authorization
- `toggleStatus()` - Toggle status aktif/nonaktif
- `getPlantsByCompany()` - AJAX endpoint untuk dropdown plant

## Validasi

### Frontend Validation
- Company dan Plant required
- Nama pemeriksaan required
- Unit required
- Price required dan numeric
- References minimal 1 item
- Type reference: universal, male, female
- Reference value required

### Backend Validation
```php
$request->validate([
    'company_id' => 'required|exists:companies,id',
    'plant_id' => 'required|exists:plants,id',
    'name' => 'required|string|max:255',
    'unit' => 'required|string|max:50',
    'price' => 'required|numeric|min:0',
    'references' => 'required|array|min:1',
    'references.*.type' => 'required|in:universal,male,female',
    'references.*.reference' => 'required|string|max:255',
]);
```

## Error Handling

### Authorization Errors
- 403 Forbidden: User tidak punya akses ke data
- Policy akan otomatis handle authorization
- Multi-tenant validation sebagai backup

### Validation Errors
- Frontend: Real-time validation dengan Inertia
- Backend: Laravel validation dengan custom messages
- Error response dalam format JSON untuk AJAX

### Database Errors
- Try-catch untuk operasi database
- Log error untuk debugging
- User-friendly error messages

## Security Features

### Multi-Tenant Security
- Data isolation berdasarkan company/plant
- User tidak bisa akses data company/plant lain
- Super admin bypass untuk maintenance

### Authorization Security
- Policy-based authorization
- Role-based access control
- Method-level authorization checks

### Input Validation
- Server-side validation
- Client-side validation
- SQL injection protection via Eloquent
- XSS protection via Blade/Inertia

## Troubleshooting

### Common Issues

#### 1. Tombol Hapus Tidak Berfungsi
**Gejala**: Klik hapus tidak ada response atau redirect 302
**Penyebab**: 
- Authorization policy tidak terpenuhi
- Multi-tenant validation gagal
- Session expired

**Solusi**:
- Cek log Laravel untuk error detail
- Pastikan user punya akses ke data
- Cek network tab browser untuk response

#### 2. Data Tidak Tersimpan
**Gejala**: Submit form tapi data tidak masuk database
**Penyebab**:
- Validation error
- Multi-tenant data tidak sesuai
- Database constraint violation

**Solusi**:
- Cek validation error di frontend
- Pastikan company_id dan plant_id sesuai
- Cek log Laravel untuk error detail

#### 3. Dropdown Plant Kosong
**Gejala**: Setelah pilih company, dropdown plant tetap kosong
**Penyebab**:
- AJAX request gagal
- Route tidak terdaftar
- Company tidak punya plant

**Solusi**:
- Cek network tab untuk AJAX request
- Pastikan route `laboratorium.plants-by-company` terdaftar
- Cek data plant di database

### Debug Steps
1. Cek Laravel log: `storage/logs/laravel.log`
2. Cek browser console untuk JavaScript error
3. Cek network tab untuk HTTP response
4. Cek database untuk data integrity
5. Test dengan user super admin vs user biasa

## Testing

### Manual Testing Checklist
- [ ] Login sebagai super admin
- [ ] Login sebagai user biasa
- [ ] Create laboratorium (super admin)
- [ ] Create laboratorium (user biasa)
- [ ] Edit laboratorium (milik sendiri)
- [ ] Edit laboratorium (milik orang lain) - harus 403
- [ ] Delete laboratorium (milik sendiri)
- [ ] Delete laboratorium (milik orang lain) - harus 403
- [ ] Toggle status laboratorium
- [ ] Filter data berdasarkan company/plant

### Automated Testing
```bash
# Run tests
php artisan test --filter=LaboratoriumTest

# Run specific test
php artisan test --filter=test_user_cannot_delete_other_company_laboratorium
```

## Performance Considerations

### Database Optimization
- Index pada `company_id` dan `plant_id`
- Eager loading untuk relasi
- Pagination untuk list data

### Frontend Optimization
- Lazy loading untuk dropdown data
- Debounce untuk search input
- Optimistic UI updates

## Future Enhancements

### Planned Features
- [ ] Soft delete untuk data recovery
- [ ] Audit trail untuk perubahan data
- [ ] Bulk operations (import/export)
- [ ] Advanced filtering dan sorting
- [ ] API endpoints untuk mobile app
- [ ] Real-time notifications
- [ ] Data validation rules per company

### Technical Debt
- [ ] Unit tests untuk policy
- [ ] Integration tests untuk controller
- [ ] Performance monitoring
- [ ] Error tracking integration
- [ ] Documentation automation

## Nilai Referensi Berdasarkan Gender

### Logika Pemilihan Referensi
1. **Priority Universal**: Jika ada referensi universal, selalu gunakan yang universal
2. **Gender-specific**: Jika tidak ada universal, gunakan referensi berdasarkan gender pasien
3. **Fallback**: Jika tidak ada referensi yang sesuai, tampilkan "Referensi tidak tersedia"

### Implementasi di Frontend (Konsultasi)
```typescript
const addSelectedLabsToTable = () => {
    const newLabRequests = [];
    
    data.selected_labs.forEach(labId => {
        const lab = data.available_labs.find(l => l.id === labId);
        if (lab) {
            const patientGender = queue.patient_record.gender;
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
                    referenceType = patientGender === 'male' ? 'Laki-laki' : 'Perempuan';
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
};
```

### Implementasi di Backend (Controller)
```php
// Di KonsultasiController::show()
$selectedReference = '';
$referenceType = '';
if ($labMaster) {
    $patientGender = $outpatientQueue->patientRecord->gender;
    $references = $labMaster->references;
    
    // Priority: Universal > Gender-specific
    $universalRef = $references->where('reference_type', 'universal')->first();
    if ($universalRef) {
        $selectedReference = $universalRef->reference;
        $referenceType = 'Universal';
    } else {
        $genderRef = $references->where('reference_type', $patientGender)->first();
        if ($genderRef) {
            $selectedReference = $genderRef->reference;
            $referenceType = $patientGender === 'male' ? 'Laki-laki' : 'Perempuan';
        }
    }
}
```

### Tampilan di Tabel Konsultasi
- Nilai referensi ditampilkan dengan jenis referensi dalam kurung
- Contoh: "13.0-17.0 (Universal)" atau "12.0-15.0 (Perempuan)"

## Known Issues & Solutions

### Issue: Referensi Gender Tidak Muncul
**Problem**: Nilai referensi berdasarkan gender tidak ditampilkan di tabel konsultasi

**Root Cause**: 
1. Logika pemilihan referensi tidak mempertimbangkan gender pasien
2. Data referensi tidak dikirim dengan benar dari backend

**Solution**:
1. Perbaiki logika pemilihan referensi di frontend dan backend
2. Tambahkan debug logging untuk memeriksa data
3. Pastikan data referensi dikirim dengan struktur yang benar

### Issue: Universal Reference Selalu Dipilih
**Problem**: Meskipun ada referensi gender-specific, yang universal selalu dipilih

**Root Cause**: Priority logic tidak berfungsi dengan benar

**Solution**: 
1. Perbaiki priority logic: Universal > Gender-specific
2. Tambahkan fallback untuk kasus tidak ada referensi
3. Test dengan berbagai kombinasi referensi

## Future Improvements

### Planned Features
1. **Range Validation**: Validasi hasil lab berdasarkan range referensi
2. **Trend Analysis**: Analisis trend hasil lab dari waktu ke waktu
3. **Alert System**: Alert untuk hasil abnormal
4. **PDF Report**: Generate laporan lab dalam format PDF
5. **Integration**: Integrasi dengan sistem lab eksternal

### Performance Optimizations
1. **Caching**: Cache data referensi untuk performa lebih baik
2. **Pagination**: Implementasi pagination untuk data besar
3. **Search Index**: Optimasi search dengan database indexing

### Security Enhancements
1. **Audit Trail**: Logging lengkap untuk semua perubahan
2. **Data Encryption**: Encrypt data sensitif
3. **Access Control**: Role-based access control yang lebih granular

---

**Last Updated**: 2025-06-29
**Version**: 1.0.0
**Author**: Cursor AI Assistant 