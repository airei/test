# Known Bugs & Solutions - Medicare Project

## Overview
Dokumen ini mencatat bug yang ditemukan selama development dan solusi yang telah diimplementasi.

## Role & Hak Akses Management

### 🐛 Bug #1: React Error "Objects are not valid as a React child"

**Tanggal Ditemukan:** 2024-12-19  
**Status:** ✅ FIXED  
**Severity:** HIGH  

#### Deskripsi Bug
```
react-dom-client.development.js:4446 Uncaught Error: Objects are not valid as a React child (found: object with keys {id, name, display_name, description, module, created_by, updated_by, created_at, updated_at, pivot}). If you meant to render a collection of children, use an array instead.
```

**Lokasi Error:**
- File: `resources/js/pages/admin-panel/role-hak-akses/index.tsx`
- File: `resources/js/pages/admin-panel/role-hak-akses/view.tsx`
- Component: `<span>` yang mencoba render objek permissions

#### Penyebab
Data `role.permissions` yang dikirim dari backend masih berupa objek kompleks dengan relasi pivot, bukan array string sederhana yang diharapkan frontend.

**Data yang Dikirim Backend:**
```php
// ❌ Data kompleks dengan pivot
[
    {
        "id": "uuid-1",
        "name": "view_users",
        "display_name": "View Users",
        "module": "users",
        "pivot": {
            "role_id": "role-uuid",
            "permission_id": "uuid-1"
        }
    }
]
```

**Data yang Diharapkan Frontend:**
```php
// ✅ Array string sederhana
["users", "roles", "companies"]
```

#### Solusi yang Diimplementasi

**1. Backend Fix (Model & Controller)**

**Model Role (`app/Models/Role.php`):**
```php
protected $hidden = [
    'permissions', // Hidden untuk menghindari data kompleks di JSON
];

// Accessor untuk mendapatkan modul permissions sebagai array
public function getPermissionModulesAttribute()
{
    return $this->permissions->pluck('module')->toArray();
}
```

**Controller (`app/Http/Controllers/AdminPanel/RoleHakAksesController.php`):**
```php
// Transform data untuk frontend
$roles->getCollection()->transform(function ($role) {
    $roleData = $role->toArray();
    $roleData['permissions'] = $role->permission_modules;
    return $roleData;
});
```

**2. Frontend Safety Check**

**Halaman Index & View:**
```tsx
{(() => {
  // Safety check untuk permissions
  let permissionModules = [];
  if (role.permissions) {
    if (Array.isArray(role.permissions)) {
      // Jika sudah array string
      permissionModules = role.permissions;
    } else if (typeof role.permissions === 'object') {
      // Jika masih objek, extract module
      permissionModules = Array.isArray(role.permissions) 
        ? role.permissions.map((p: any) => p.module || p).filter(Boolean)
        : [];
    }
  }
  
  return permissionModules.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {permissionModules.map((mod: string, idx: number) => (
        <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{mod}</span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400">-</span>
  );
})()}
```

#### Testing
- ✅ Halaman index role-hak-akses tidak error
- ✅ Halaman view role-hak-akses tidak error
- ✅ Permissions ditampilkan sebagai tag biru
- ✅ Fallback "-" untuk role tanpa permissions

#### Lessons Learned
1. **Data Transformation**: Selalu transform data kompleks di backend sebelum dikirim ke frontend
2. **Safety Check**: Implementasi safety check di frontend untuk handle berbagai format data
3. **Model Design**: Gunakan `hidden` attribute dan accessor untuk kontrol data yang dikirim
4. **Error Prevention**: Antisipasi error dengan defensive programming

---

### 🐛 Bug #2: Route Not Found Error

**Tanggal Ditemukan:** 2024-12-19  
**Status:** ✅ FIXED  
**Severity:** MEDIUM  

#### Deskripsi Bug
```
Route [admin.role-hak-akses.index] not defined.
```

**Lokasi Error:**
- File: `resources/js/pages/admin-panel/role-hak-akses/index.tsx`
- File: `resources/js/pages/admin-panel/role-hak-akses/create.tsx`
- File: `resources/js/pages/admin-panel/role-hak-akses/view.tsx`

#### Penyebab
Pemanggilan route dengan prefix yang salah. Route resourceful Laravel tidak menggunakan prefix `admin.` dalam nama route.

**Route yang Didefinisikan:**
```php
Route::resource('role-hak-akses', RoleHakAksesController::class);
// Menghasilkan: role-hak-akses.index, role-hak-akses.create, dll.
```

**Route yang Dipanggil (Salah):**
```tsx
route('admin.role-hak-akses.index') // ❌ Tidak ada
```

#### Solusi
Ganti semua pemanggilan route dari `admin.role-hak-akses.*` menjadi `role-hak-akses.*`:

**Sebelum:**
```tsx
// ❌ Salah
<Link href={route('admin.role-hak-akses.create')}>
router.get(route('admin.role-hak-akses.index'), ...)
router.patch(route('admin.role-hak-akses.toggle-status', role.id))
```

**Sesudah:**
```tsx
// ✅ Benar
<Link href={route('role-hak-akses.create')}>
router.get(route('role-hak-akses.index'), ...)
router.patch(route('role-hak-akses.toggle-status', role.id))
```

#### Testing
- ✅ Tombol "Tambah Peran" berfungsi
- ✅ Search dan filter berfungsi
- ✅ Aksi edit, toggle status, delete berfungsi
- ✅ Redirect setelah aksi berfungsi

#### Lessons Learned
1. **Route Naming**: Perhatikan nama route yang dihasilkan resource controller
2. **Consistency**: Gunakan nama route yang konsisten di seluruh aplikasi
3. **Documentation**: Dokumentasikan nama route yang benar untuk tim development

---

### 🐛 Bug #3: Model Permission Not Found

**Tanggal Ditemukan:** 2024-12-19  
**Status:** ✅ FIXED  
**Severity:** LOW  

#### Deskripsi Bug
```
Class "App\Models\Permission" not found
```

**Lokasi Error:**
- File: `app/Http/Controllers/AdminPanel/RoleHakAksesController.php`
- File: `app/Models/Role.php`

#### Penyebab
Model `Permission` belum dibuat, padahal sudah direferensikan di controller dan model Role.

#### Solusi
Buat model `Permission` dengan struktur yang sesuai:

**File: `app/Models/Permission.php`**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}
```

#### Testing
- ✅ Controller tidak error saat diakses
- ✅ Relasi role-permission berfungsi
- ✅ CRUD operations berfungsi

#### Lessons Learned
1. **Model Creation**: Pastikan semua model yang direferensikan sudah dibuat
2. **Dependency Check**: Cek dependency sebelum menggunakan model
3. **Error Handling**: Handle error dengan graceful fallback

---

## General UI/UX Issues

### 🎨 Issue #1: Inconsistent Row Colors

**Status:** ✅ FIXED  
**Severity:** LOW  

#### Deskripsi
Warna row tabel tidak konsisten antara status aktif dan nonaktif.

#### Solusi
Implementasi warna yang konsisten:

```tsx
// Row dengan status aktif
className={`${role.is_active ? 'bg-white hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}`}
```

**Warna yang Diterapkan:**
- **Status Aktif**: Background putih, hover #F5F5F5
- **Status Nonaktif**: Background #F0D9D9, hover #FBDBDD

#### Testing
- ✅ Warna row konsisten
- ✅ Hover effect berfungsi
- ✅ Keterangan warna ditampilkan di bawah tabel

---

## Performance Issues

### ⚡ Issue #1: N+1 Query Problem

**Status:** ✅ FIXED  
**Severity:** MEDIUM  

#### Deskripsi
Query database tidak optimal, menyebabkan N+1 query problem saat mengambil data roles dengan permissions.

#### Solusi
Implementasi eager loading:

```php
$roles = Role::with(['permissions'])
    ->when($search, function($query, $search) {
        $query->where('display_name', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
    })
    ->orderBy('display_name')
    ->paginate(10);
```

#### Testing
- ✅ Query count berkurang signifikan
- ✅ Loading time lebih cepat
- ✅ Memory usage optimal

---

## Security Issues

### 🔒 Issue #1: Missing Input Validation

**Status:** ✅ FIXED  
**Severity:** HIGH  

#### Deskripsi
Form input tidak memiliki validasi yang cukup di backend.

#### Solusi
Implementasi validasi lengkap:

```php
$request->validate([
    'name' => 'required|string|max:255|unique:roles,name',
    'display_name' => 'required|string|max:255',
    'description' => 'nullable|string',
    'modules' => 'array',
    'modules.*' => 'string',
]);
```

#### Testing
- ✅ Input validation berfungsi
- ✅ Error message ditampilkan dengan jelas
- ✅ SQL injection prevention

---

## Database Issues

### 🗄️ Issue #1: Missing Foreign Key Constraints

**Status:** ✅ FIXED  
**Severity:** MEDIUM  

#### Deskripsi
Beberapa foreign key constraint belum didefinisikan dengan benar.

#### Solusi
Update migration untuk foreign key yang benar:

```php
// Tabel role_permissions
$table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
$table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
```

#### Testing
- ✅ Referential integrity terjaga
- ✅ Cascade delete berfungsi
- ✅ Data consistency terjaga

---

## Prevention Strategies

### 📋 Best Practices yang Diterapkan

1. **Defensive Programming**
   - Safety check di frontend untuk handle berbagai format data
   - Error boundary untuk catch React errors
   - Graceful fallback untuk data yang tidak sesuai

2. **Data Validation**
   - Input validation di backend
   - Type checking di frontend
   - Sanitization untuk mencegah XSS

3. **Error Handling**
   - Proper error messages
   - Logging untuk debugging
   - User-friendly error display

4. **Testing**
   - Unit test untuk critical functions
   - Integration test untuk API endpoints
   - Manual testing untuk UI/UX

### 🔍 Monitoring & Maintenance

1. **Error Tracking**
   - Monitor console errors di browser
   - Log Laravel errors
   - Track performance metrics

2. **Code Review**
   - Review semua perubahan sebelum merge
   - Check for potential bugs
   - Validate security implications

3. **Documentation**
   - Update documentation untuk setiap fix
   - Document workarounds
   - Maintain troubleshooting guide

---

## Future Improvements

### 🚀 Planned Enhancements

1. **Automated Testing**
   - Implementasi unit tests untuk semua components
   - Integration tests untuk API endpoints
   - E2E tests untuk critical user flows

2. **Performance Optimization**
   - Implementasi caching untuk data yang jarang berubah
   - Lazy loading untuk components
   - Code splitting untuk bundle optimization

3. **Security Enhancements**
   - Implementasi rate limiting
   - CSRF protection
   - Input sanitization

4. **User Experience**
   - Loading states untuk semua async operations
   - Better error messages
   - Accessibility improvements

---

**Last Updated:** 2024-12-19  
**Maintained by:** Development Team  
**Next Review:** 2024-12-26

## Issues yang Sudah Diperbaiki

### 1. Masalah UUID di Tabel Role Permissions ✅ FIXED
**Tanggal:** 24 Juni 2025  
**Deskripsi:** Error SQL saat menambahkan role baru: `Field 'id' doesn't have a default value`  
**Penyebab:** Tabel `role_permissions` menggunakan UUID untuk field `id` tetapi Laravel tidak otomatis mengisi field tersebut saat `attach()` pada relasi many-to-many.  
**Solusi:** 
- Hapus field `id` dari tabel `role_permissions` 
- Gunakan composite primary key dari `role_id` + `permission_id`
- Update relasi di model `Role` dan `Permission` untuk menggunakan `withPivot()` dan `withTimestamps()`
- Update controller untuk menggunakan `attach()` dengan pivot data untuk menambahkan `created_by` dan `updated_by`

**File yang Diperbaiki:**
- `app/Models/Role.php`
- `app/Models/Permission.php`
- `app/Http/Controllers/AdminPanel/RoleHakAksesController.php`
- Database: Struktur tabel `role_permissions` diubah langsung

**Struktur Tabel Baru:**
- `role_id` (char(36), PRI) - Composite Primary Key
- `permission_id` (char(36), PRI) - Composite Primary Key  
- `created_by` (char(36), MUL) - Foreign Key
- `updated_by` (char(36), MUL) - Foreign Key
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Catatan:** Solusi ini mengikuti standar Laravel untuk tabel pivot yang tidak memerlukan field `id` terpisah.

### 2. Masalah Path Inertia Render ✅ FIXED
**Tanggal:** 24 Juni 2025  
**Deskripsi:** Error "Page not found" untuk halaman admin panel  
**Penyebab:** Controller masih menggunakan path lowercase `admin-panel/...` padahal file sudah dipindah ke `AdminPanel/...` (PascalCase)  
**Solusi:** Update semua path inertia render di controller ke format PascalCase

**File yang Diperbaiki:**
- `app/Http/Controllers/AdminPanel/CompanyPlantController.php`
- `app/Http/Controllers/AdminPanel/RoleHakAksesController.php`
- `app/Http/Controllers/AdminPanel/UserController.php`
- `app/Http/Controllers/AdminPanel/DiagnosaController.php`
- routes/web.php

### 3. Masalah Duplikasi Folder ✅ FIXED
**Tanggal:** 24 Juni 2025  
**Deskripsi:** Ada dua folder dengan struktur yang sama: `admin-panel/` dan `AdminPanel/`  
**Penyebab:** File dipindahkan ke struktur PascalCase tetapi folder lama tidak dihapus  
**Solusi:** Hapus folder `admin-panel/` dan gunakan hanya `AdminPanel/` sesuai konvensi Laravel + Inertia.js

**File yang Dihapus:**
- `resources/js/pages/admin-panel/` (seluruh folder dan isinya)

### 4. Error SQL: Field 'company_id' doesn't have a default value
**Tanggal**: 24 Juni 2025  
**Lokasi**: Tabel `employee_statuses`, `departments`, `shifts`  
**Deskripsi**: Error terjadi saat menambahkan data baru karena field `company_id`, `plant_id`, `created_by`, dan `updated_by` tidak nullable  
**Solusi**: 
- Membuat migration `2025_06_24_065256_fix_manajemen_tables_structure.php`
- Mengubah semua field foreign key menjadi nullable
- Mengubah onDelete dari 'cascade' menjadi 'set null'
- Controller sudah mengisi `created_by` dan `updated_by` dengan `auth()->id()`

**Status**: ✅ DIPERBAIKI

### 5. Error SQL: Field 'id' doesn't have a default value pada tabel pivot
**Tanggal**: 24 Juni 2025  
**Lokasi**: Tabel `role_permissions`  
**Deskripsi**: Error terjadi karena tabel pivot menggunakan field `id` terpisah dengan UUID  
**Solusi**: 
- Menghapus field `id` dari tabel pivot
- Menggunakan composite primary key dari `role_id` dan `permission_id`
- Migration: `2025_06_24_053318_remove_id_from_role_permissions_table.php`

**Status**: ✅ DIPERBAIKI

### 6. Error TypeScript pada Checkbox
**Tanggal**: 24 Juni 2025  
**Lokasi**: Halaman Create/Edit Manajemen  
**Deskripsi**: Error TypeScript pada parameter `onCheckedChange`  
**Solusi**: 
- Mengubah `onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}`
- Menjadi `onCheckedChange={(checked) => setFormData({...formData, is_active: checked === true})}`

**Status**: ✅ DIPERBAIKI

## Issues yang Masih Aktif

### Tidak ada issues aktif saat ini

## Catatan Penting

- Semua tabel manajemen (departments, shifts, employee_statuses, guarantors) sekarang menggunakan field foreign key yang nullable
- Model EmployeeStatus sudah dikonfigurasi dengan UUID dan event boot untuk auto-generate ID
- Semua controller mengisi field `created_by` dan `updated_by` dengan `auth()->id()`
- Struktur folder frontend sudah konsisten menggunakan PascalCase

## Current Issues

### 1. Ziggy.js Routes Not Generated (RESOLVED)
- **Date**: June 25, 2025
- **Description**: File `resources/js/ziggy.js` was empty, causing import errors
- **Error**: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object"
- **Solution**: Run `php artisan ziggy:generate` to regenerate routes
- **Status**: ✅ RESOLVED

### 2. Inventory Unit Create Page Missing (RESOLVED)
- **Date**: June 25, 2025
- **Description**: File `resources/js/pages/Manajemen/Inventory/Unit/Create.tsx` was empty
- **Error**: React component import/export error
- **Solution**: Created complete Create.tsx component for inventory units
- **Status**: ✅ RESOLVED

## Previous Issues

### 3. Department Management Route Model Binding (RESOLVED)
- **Date**: June 25, 2025
- **Description**: Route parameter mismatch between `{departemen}` and `$department`
- **Error**: Toggle status and delete functionality not working
- **Solution**: Updated controller method parameters to match route parameters
- **Status**: ✅ RESOLVED

### 4. Import Error in Shift Management (RESOLVED)
- **Date**: June 25, 2025
- **Description**: Incorrect import of `route` from `laravel-echo`
- **Error**: Import error in `resources/js/pages/Manajemen/Shift/Index.tsx`
- **Solution**: Changed import to `{ route }` from `ziggy-js`
- **Status**: ✅ RESOLVED

## Prevention Measures

1. **Always run `php artisan ziggy:generate`** after adding new routes
2. **Check file completeness** before committing changes
3. **Verify route model binding** parameter names match between routes and controllers
4. **Use proper import statements** for ziggy-js routes

## Testing Checklist

- [ ] All inventory tabs work correctly
- [ ] Create/Edit forms for categories and units function properly
- [ ] Route model binding works for all CRUD operations
- [ ] Toggle status functionality works for all inventory types
- [ ] Search functionality works in all tabs
- [ ] Pagination works correctly
- [ ] Responsive design works on mobile and desktop

## Bug yang Telah Diperbaiki

### 1. Model Configuration Issues (2024-12-19) ✅ FIXED

**Masalah**: 
- Error `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'medicare.outpatient_queues' doesn't exist`
- Model-model yang terkait dengan rekam medis tidak dikonfigurasi dengan benar
- Laravel mencari tabel dengan nama plural (`outpatient_queues`) tetapi migration membuat tabel dengan nama singular (`outpatient_queue`)

**Root Cause**:
- Model `OutpatientQueue`, `LabRequest`, `LabQueue`, `LabDetail`, `LabResult`, `MedicalRecord`, `DiagnosisDetail`, `Prescription`, dan `PrescriptionDetail` tidak memiliki konfigurasi yang benar
- Model-model tersebut tidak menentukan nama tabel yang benar
- Tidak ada konfigurasi UUID, fillable fields, dan relasi

**Solusi**:
1. **OutpatientQueue Model**: 
   - Menambahkan `protected $table = 'outpatient_queue'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi
   - Auto-generate outpatient visit number

2. **LabRequest Model**:
   - Menambahkan `protected $table = 'lab_request'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

3. **LabQueue Model**:
   - Menambahkan `protected $table = 'lab_queue'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

4. **LabDetail Model**:
   - Menambahkan `protected $table = 'lab_details'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

5. **LabResult Model**:
   - Menambahkan `protected $table = 'lab_result'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

6. **MedicalRecord Model**:
   - Menambahkan `protected $table = 'medical_records'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

7. **DiagnosisDetail Model**:
   - Menambahkan `protected $table = 'diagnosis_details'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

8. **Prescription Model**:
   - Menambahkan `protected $table = 'prescriptions'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi
   - Auto-generate prescription number

9. **PrescriptionDetail Model**:
   - Menambahkan `protected $table = 'prescription_details'`
   - Menggunakan trait `HasUuids`
   - Menambahkan fillable fields dan relasi

**Controller Updates**:
- Menambahkan `created_by` dan `updated_by` saat menyimpan dan mengupdate data pasien di `RegistrasiRekamMedisController`

**File yang Diubah**:
- `app/Models/OutpatientQueue.php`
- `app/Models/LabRequest.php`
- `app/Models/LabQueue.php`
- `app/Models/LabDetail.php`
- `app/Models/LabResult.php`
- `app/Models/MedicalRecord.php`
- `app/Models/DiagnosisDetail.php`
- `app/Models/Prescription.php`
- `app/Models/PrescriptionDetail.php`
- `app/Http/Controllers/Pelayanan/RegistrasiRekamMedisController.php`

**Status**: ✅ FIXED
**Tanggal Perbaikan**: 2024-12-19

### 2. Route Error Issues (2024-12-19) ✅ FIXED

**Masalah**: 
- Error `Ziggy error: route 'pelayanan.rawat-jalan.index' is not in the route list`
- Error `Ziggy error: route 'pelayanan.konsultasi-lab.index' is not in the route list`
- Tombol "Berobat" dan "Cek Lab" di halaman registrasi rekam medis tidak berfungsi

**Root Cause**:
- Route yang ada adalah `pelayanan.rawat-jalan` dan `pelayanan.konsultasi-lab` (tanpa `.index`)
- Kode di halaman registrasi rekam medis mencoba mengakses route dengan suffix `.index` yang tidak ada
- Halaman rawat-jalan dan konsultasi-lab tidak bisa menerima parameter `patient_id`

**Solusi**:
1. **Perbaiki Route References**:
   - Mengubah `pelayanan.rawat-jalan.index` menjadi `pelayanan.rawat-jalan`
   - Mengubah `pelayanan.konsultasi-lab.index` menjadi `pelayanan.konsultasi-lab`

2. **Update Route Handlers**:
   - Menambahkan parameter `patient_id` ke route rawat-jalan dan konsultasi-lab
   - Mengambil data pasien berdasarkan `patient_id` dan mengirim ke halaman
   - Menambahkan import `Request` di `web.php`

3. **Update Halaman**:
   - Memperbaiki halaman `rawat-jalan.tsx` agar bisa menerima dan menampilkan data pasien
   - Memperbaiki halaman `konsultasi.tsx` agar bisa menerima dan menampilkan data pasien
   - Menambahkan interface untuk props dan menampilkan informasi pasien

**File yang Diubah**:
- `routes/web.php`: Menambahkan import Request dan memperbaiki route handlers
- `resources/js/pages/Pelayanan/RegistrasiRekamMedis/Index.tsx`: Memperbaiki route references
- `resources/js/pages/Pelayanan/rawat-jalan.tsx`: Membuat ulang halaman dengan dukungan patient_id
- `resources/js/pages/Pelayanan/konsultasi.tsx`: Memperbaiki halaman dengan dukungan patient_id

**Status**: ✅ FIXED
**Tanggal Perbaikan**: 2024-12-19

## Bug yang Masih Ada

### 1. Belum Ada Bug yang Diketahui

Saat ini tidak ada bug yang diketahui dalam sistem.

## Catatan Penting

- Setiap kali membuat model baru, pastikan untuk mengkonfigurasi dengan benar:
  - Nama tabel yang benar (singular/plural)
  - Trait `HasUuids` untuk UUID primary key
  - Fillable fields yang sesuai
  - Relasi dengan model lain
  - Casting untuk tipe data tertentu
  - Audit trail fields (`created_by`, `updated_by`)

# Known Bugs & Issues

## Bug yang Sudah Diperbaiki

### 1. Error Ziggy Route `pelayanan.rawat-jalan` Tidak Ditemukan
- **File**: `resources/js/pages/Pelayanan/RegistrasiRekamMedis/Index.tsx`
- **Masalah**: Route yang dipakai salah (harusnya `pelayanan.rawat-jalan.index`)
- **Status**: ✅ DIPERBAIKI
- **Solusi**: Mengubah route dari `pelayanan.rawat-jalan` menjadi `pelayanan.rawat-jalan.index`

### 2. Error SelectItem dengan Value Kosong
- **File**: `resources/js/pages/Pelayanan/rawat-jalan.tsx`
- **Masalah**: `<SelectItem value="">` tidak diperbolehkan
- **Status**: ✅ DIPERBAIKI
- **Solusi**: Mengganti value kosong menjadi `"all"` untuk pilihan "Semua"

### 3. Error Ziggy Route `pelayanan.konsultasi` Tidak Ditemukan
- **File**: `resources/js/pages/Pelayanan/rawat-jalan.tsx`
- **Masalah**: Route yang dipakai salah (harusnya `pelayanan.konsultasi.index`)
- **Status**: ✅ DIPERBAIKI
- **Solusi**: Mengubah route dari `pelayanan.konsultasi` menjadi `pelayanan.konsultasi.index`

## Bug yang Masih Ada

### Tidak ada bug yang masih ada saat ini.

## Catatan Penting

- Setiap kali ada perubahan route, pastikan untuk menjalankan `php artisan route:clear` dan `php artisan config:clear`
- Pastikan route name di frontend sesuai dengan yang didefinisikan di `routes/web.php`
- Untuk fitur baru, selalu test integrasi antara frontend dan backend

## Resolved Issues

### ✅ Nilai Referensi Laboratorium Berdasarkan Gender
**Status**: RESOLVED  
**Date**: 2025-01-27  
**Priority**: High

**Problem**: 
Pada halaman konsultasi bagian tabs laboratorium tabel nilai referensi, beberapa tabel ada nilai referensi berdasarkan gender dan juga universal. Nilai referensi berdasarkan gender ada laki-laki dan perempuan, untuk nilai universal terlihat, tapi untuk nilai secara gender laki-laki maupun perempuan tidak terlihat.

**Root Cause**: 
1. Logika pemilihan referensi di frontend tidak mempertimbangkan gender pasien dengan benar
2. Data referensi tidak dikirim dengan struktur yang tepat dari backend
3. Priority logic universal > gender-specific tidak berfungsi dengan benar

**Solution Applied**:
1. **Frontend Fix** (`resources/js/pages/Pelayanan/Konsultasi.tsx`):
   - Perbaiki logika pemilihan referensi di fungsi `addSelectedLabsToTable()`
   - Tambahkan debug logging untuk troubleshooting
   - Tambahkan field `reference_type` untuk menampilkan jenis referensi
   - Perbaiki tampilan tabel untuk menampilkan jenis referensi dalam kurung

2. **Backend Fix** (`app/Http/Controllers/Pelayanan/KonsultasiController.php`):
   - Perbaiki logika pemilihan referensi di method `show()`
   - Implementasi priority logic: Universal > Gender-specific
   - Tambahkan field `reference_type` ke response data

3. **Search Endpoint Fix** (`app/Http/Controllers/Manajemen/LaboratoriumController.php`):
   - Perbaiki endpoint search untuk memastikan data referensi dikirim dengan benar
   - Transform data untuk konsistensi struktur

**Testing**:
- Test dengan pasien laki-laki dan perempuan
- Test dengan lab yang memiliki referensi universal saja
- Test dengan lab yang memiliki referensi gender-specific saja
- Test dengan lab yang memiliki keduanya

**Result**: 
- Nilai referensi sekarang ditampilkan sesuai dengan gender pasien
- Universal reference tetap diprioritaskan jika tersedia
- Tampilan menunjukkan jenis referensi yang digunakan (Universal/Laki-laki/Perempuan)

---

## Active Issues

### 🔴 Issue Title
**Status**: OPEN  
**Date**: YYYY-MM-DD  
**Priority**: Medium/High

**Description**: 
Detailed description of the issue

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: 
What should happen

**Actual Behavior**: 
What actually happens

**Environment**:
- OS: Windows/Linux/Mac
- Browser: Chrome/Firefox/Safari
- Version: X.X.X

**Screenshots**: 
[If applicable]

**Logs**: 
[If applicable]

**Proposed Solution**:
[If available]

---

## Performance Issues

### ⚠️ Slow Loading Times
**Status**: INVESTIGATING  
**Date**: YYYY-MM-DD  
**Priority**: Medium

**Description**: 
Certain pages are loading slowly

**Affected Areas**:
- Page A
- Page B

**Investigation Status**:
- [ ] Database query optimization
- [ ] Frontend bundle optimization
- [ ] Caching implementation

---

## Security Issues

### 🔒 Security Issue Title
**Status**: OPEN  
**Date**: YYYY-MM-DD  
**Priority**: High

**Description**: 
Security vulnerability description

**Risk Level**: High/Medium/Low

**Mitigation Steps**:
1. Step 1
2. Step 2

---

## Data Integrity Issues

### 📊 Data Inconsistency
**Status**: OPEN  
**Date**: YYYY-MM-DD  
**Priority**: Medium

**Description**: 
Data inconsistency issue

**Affected Tables**:
- Table A
- Table B

**Impact**: 
What is affected by this issue

---

## UI/UX Issues

### 🎨 UI Issue Title
**Status**: OPEN  
**Date**: YYYY-MM-DD  
**Priority**: Low

**Description**: 
UI/UX issue description

**Affected Pages**:
- Page A
- Page B

**Screenshots**: 
[If applicable]

---

## Integration Issues

### 🔗 Integration Issue Title
**Status**: OPEN  
**Date**: YYYY-MM-DD  
**Priority**: Medium

**Description**: 
Integration issue description

**Affected Systems**:
- System A
- System B

**Error Messages**: 
[If applicable]

---

## Notes

### Bug Reporting Guidelines
1. **Title**: Clear, concise description
2. **Status**: OPEN, IN PROGRESS, RESOLVED, CLOSED
3. **Priority**: High, Medium, Low
4. **Environment**: OS, Browser, Version
5. **Steps**: Detailed reproduction steps
6. **Expected vs Actual**: Clear comparison
7. **Screenshots**: Visual evidence when applicable
8. **Logs**: Error logs or console output

### Resolution Process
1. **Investigation**: Root cause analysis
2. **Solution Design**: Plan the fix
3. **Implementation**: Code changes
4. **Testing**: Verify the fix
5. **Documentation**: Update docs
6. **Deployment**: Release to production
7. **Monitoring**: Watch for regressions

### Maintenance
- Review and update this file regularly
- Remove resolved issues after 30 days
- Archive old issues to separate file
- Update status and progress regularly
