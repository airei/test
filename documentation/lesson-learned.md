# Lesson Learned - Medicare System

## 2025-06-25: Perbaikan Toggle Status Inventory

### Masalah
Toggle status aktif/nonaktif pada inventory tidak berfungsi - data tidak berubah di database meskipun tombol diklik.

### Root Cause
1. **Parameter Route Binding Tidak Konsisten**: Route menggunakan `{inventory}` tapi controller menggunakan `InventoryItem $inventoryItem`
2. **Cache Route**: Route cache dan ziggy tidak di-clear setelah perubahan parameter binding

### Solusi
1. **Tambahkan Parameter Binding Eksplisit**:
   ```php
   Route::resource('inventory', InventoryController::class)->names('inventory')->parameters([
       'inventory' => 'inventoryItem'
   ]);
   Route::patch('inventory/{inventoryItem}/toggle-status', [InventoryController::class, 'toggleStatus'])->name('inventory.toggle-status');
   ```

2. **Clear Cache dan Regenerate Ziggy**:
   ```bash
   php artisan route:clear
   php artisan config:clear
   php artisan ziggy:generate
   ```

3. **Tambahkan Auto-refresh di Frontend**:
   ```js
   router.patch(route(routeName, id), {}, { onSuccess: () => router.reload() });
   ```

### Lesson Learned
- Selalu pastikan parameter route binding konsisten antara route dan controller
- Clear cache setelah perubahan route untuk memastikan perubahan teraplikasi
- Gunakan callback `onSuccess` pada Inertia router untuk auto-refresh data setelah aksi berhasil
- Debug dengan logging di controller dan console.log di frontend untuk troubleshooting

## 2025-06-25: Perbaikan Redirect Toggle Status Kategori dan Unit

### Masalah
Ketika toggle status pada kategori atau unit, URL berubah dari `manajemen/inventory` menjadi `manajemen/inventory-category` atau `manajemen/inventory-unit`, padahal seharusnya tetap di halaman yang sama.

### Root Cause
Controller kategori dan unit redirect ke route terpisah:
- `InventoryCategoryController::toggleStatus()` redirect ke `inventory.category.index`
- `InventoryUnitController::toggleStatus()` redirect ke `inventory.unit.index`

### Solusi
Ubah redirect pada kedua controller agar kembali ke halaman utama inventory:

**InventoryCategoryController.php:**
```php
public function toggleStatus(InventoryCategory $category)
{
    $category->update([
        'is_active' => !$category->is_active,
        'updated_by' => Auth::id(),
    ]);

    return redirect()->route('inventory.index')  // Sebelumnya: inventory.category.index
        ->with('success', 'Status kategori berhasil diubah.');
}
```

**InventoryUnitController.php:**
```php
public function toggleStatus(InventoryUnit $unit)
{
    $unit->update([
        'is_active' => !$unit->is_active,
        'updated_by' => Auth::id(),
    ]);

    return redirect()->route('inventory.index')  // Sebelumnya: inventory.unit.index
        ->with('success', 'Status unit berhasil diubah.');
}
```

### Lesson Learned
- Saat menggunakan tabs dalam satu halaman, pastikan semua aksi redirect ke halaman utama, bukan ke halaman terpisah
- Konsistensi UX penting - user tidak boleh "terlempar" ke halaman lain saat melakukan aksi dalam tabs
- Perhatikan redirect route pada setiap controller method untuk memastikan user experience yang konsisten

## 2025-06-25: Perbaikan Lengkap Redirect Kategori dan Unit

### Masalah
Semua aksi CRUD pada kategori dan unit (create, edit, delete, toggle status) menyebabkan perubahan URL dari `manajemen/inventory` ke halaman terpisah.

### Root Cause
Semua method di controller kategori dan unit redirect ke route terpisah:
- `store()` → `inventory.category.index` / `inventory.unit.index`
- `update()` → `inventory.category.index` / `inventory.unit.index`
- `destroy()` → `inventory.category.index` / `inventory.unit.index`
- `toggleStatus()` → `inventory.category.index` / `inventory.unit.index`

### Solusi
Ubah semua redirect pada kedua controller agar kembali ke halaman utama inventory:

**InventoryCategoryController.php:**
```php
// store()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.category.index

// update()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.category.index

// destroy()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.category.index

// toggleStatus()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.category.index
```

**InventoryUnitController.php:**
```php
// store()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.unit.index

// update()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.unit.index

// destroy()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.unit.index

// toggleStatus()
return redirect()->route('inventory.index');  // Sebelumnya: inventory.unit.index
```

### Lesson Learned
- Saat menggunakan tabs dalam satu halaman, **SEMUA** aksi CRUD harus redirect ke halaman utama
- Jangan lupa cek method `store()`, `update()`, `destroy()`, dan `toggleStatus()` pada semua controller terkait
- Konsistensi UX sangat penting - user harus selalu kembali ke halaman yang sama setelah melakukan aksi apapun
- Test semua aksi CRUD untuk memastikan tidak ada yang "terlewat" dalam perbaikan

## 2025-06-25: Perbaikan Tab Aktif Setelah Create/Edit

### Masalah
Setelah create/edit kategori atau unit, sistem otomatis berpindah ke tab "items" padahal seharusnya kembali ke tab yang sedang aktif (kategori atau unit).

### Root Cause
Controller redirect ke halaman utama inventory tanpa parameter tab, sehingga frontend default ke tab "items".

### Solusi
1. **Tambahkan Parameter Tab di Controller Redirect**:
   ```php
   // InventoryCategoryController.php
   return redirect()->route('inventory.index', ['tab' => 'categories']);
   
   // InventoryUnitController.php  
   return redirect()->route('inventory.index', ['tab' => 'units']);
   ```

2. **Modifikasi Controller Utama untuk Menerima Parameter Tab**:
   ```php
   // InventoryController.php
   public function index(Request $request)
   {
       $activeTab = $request->get('tab', 'items'); // Default ke 'items'
       
       return Inertia::render('Manajemen/Inventory/Index', [
           // ... data lainnya
           'activeTab' => $activeTab, // Kirim ke frontend
       ]);
   }
   ```

3. **Modifikasi Frontend untuk Menggunakan Tab dari Props**:
   ```jsx
   export default function InventoryIndex({ inventoryItems, categories, units, filters, activeTab: initialActiveTab }: any) {
       const [activeTab, setActiveTab] = useState(initialActiveTab || 'items');
       // ...
   }
   ```

### Lesson Learned
- Saat menggunakan tabs, selalu pertimbangkan state tab aktif saat redirect
- Gunakan parameter URL untuk mengingat tab yang sedang aktif
- Konsistensi UX penting - user harus kembali ke konteks yang sama setelah melakukan aksi
- Test semua flow create/edit untuk memastikan tab aktif dipertahankan

## 2025-01-27: Perbaikan Multi-Tenant untuk Inventory Management

### Masalah
- Field perusahaan dan plant muncul di form tambah/edit inventory untuk semua user
- Opsi "Semua Perusahaan" dan "Semua Plant" tersedia yang melanggar prinsip multi-tenant
- User biasa bisa memilih perusahaan/plant yang bukan milik mereka
- Super admin tidak memiliki perlakuan khusus

### Solusi
1. **Implementasi Multi-Tenant di Controller:**
   - User biasa: hanya bisa melihat/mengelola data dari company/plant mereka sendiri
   - Super admin: bisa melihat/mengelola semua data
   - Field company/plant disembunyikan untuk user biasa di frontend
   - Opsi "Semua" dihapus dari dropdown

2. **Validasi Akses:**
   - Tambahkan validasi di semua method CRUD untuk memastikan user hanya bisa mengakses data yang sesuai
   - Gunakan `abort(403)` untuk menolak akses yang tidak sah

3. **Filter Data:**
   - Filter inventory items, categories, dan units berdasarkan company_id dan plant_id user
   - Super admin tidak difilter (bisa melihat semua data)

### File yang Dimodifikasi
- `app/Http/Controllers/Manajemen/InventoryController.php`
- `app/Http/Controllers/Manajemen/InventoryCategoryController.php`
- `app/Http/Controllers/Manajemen/InventoryUnitController.php`
- `resources/js/pages/Manajemen/Inventory/Create.tsx`
- `resources/js/pages/Manajemen/Inventory/Edit.tsx`

### Implementasi Detail
1. **Controller Logic:**
   ```php
   $user = Auth::user();
   $isSuperAdmin = $user->role->name === 'super_admin';
   
   // Filter data berdasarkan multi-tenant
   ->when(!$isSuperAdmin, function($query) use ($user) {
       $query->where('company_id', $user->company_id)
             ->where('plant_id', $user->plant_id);
   })
   ```

2. **Frontend Logic:**
   ```tsx
   {isSuperAdmin && (
     // Tampilkan field company/plant hanya untuk super admin
   )}
   ```

3. **Validasi Akses:**
   ```php
   if (!$isSuperAdmin) {
       if ($item->company_id !== $user->company_id || $item->plant_id !== $user->plant_id) {
           abort(403, 'Anda tidak memiliki akses ke data ini.');
       }
   }
   ```

### Hasil
- ✅ User biasa tidak bisa melihat field company/plant
- ✅ User biasa hanya bisa mengelola data dari company/plant mereka
- ✅ Super admin bisa mengelola semua data
- ✅ Opsi "Semua" dihapus dari dropdown
- ✅ Validasi akses mencegah akses tidak sah
- ✅ Prinsip multi-tenant diterapkan dengan benar

### Catatan Penting
- Pastikan user memiliki `company_id` dan `plant_id` yang valid
- Role `super_admin` harus ada di database
- Validasi akses diterapkan di semua method CRUD
- Frontend menyesuaikan tampilan berdasarkan role user

## 2025-01-27: Penggabungan Migrasi untuk Optimasi Database

### Masalah
Terdapat dua file migrasi untuk tabel `guarantors`:
1. `2025_06_24_061021_create_guarantors_table.php` - Membuat tabel dasar
2. `2025_06_26_103633_add_company_plant_guarantors.php` - Menambahkan kolom company_id dan plant_id

Ini menyebabkan:
- Migrasi terpisah yang tidak efisien
- Potensi masalah jika migrasi kedua gagal
- Struktur tabel tidak lengkap dari awal

### Solusi
1. **Gabungkan Kedua Migrasi:**
   - Tambahkan kolom `company_id` dan `plant_id` langsung ke dalam file pembuatan tabel utama
   - Tambahkan foreign key constraints untuk kedua kolom
   - Hapus file migrasi kedua yang sudah tidak diperlukan

2. **Struktur Tabel yang Dioptimalkan:**
   ```php
   Schema::create('guarantors', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->uuid('company_id')->nullable()->after('id');
       $table->uuid('plant_id')->nullable()->after('company_id');
       $table->string('name');
       $table->text('description')->nullable();
       $table->boolean('is_active')->default(true);
       $table->uuid('created_by')->nullable();
       $table->uuid('updated_by')->nullable();
       $table->timestamps();

       $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
       $table->foreign('plant_id')->references('id')->on('plants')->onDelete('set null');
       $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
       $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
   });
   ```

3. **Update Dokumentasi:**
   - Perbarui `cursor-database.md` untuk mencatat perubahan struktur
   - Tambahkan catatan migrasi untuk referensi masa depan

### Lesson Learned
- **Plan Ahead**: Selalu pertimbangkan struktur tabel lengkap sebelum membuat migrasi
- **Single Migration**: Lebih baik menggabungkan kolom terkait dalam satu migrasi daripada membuat migrasi terpisah
- **Documentation**: Selalu update dokumentasi setelah perubahan struktur database
- **Clean Code**: Hapus file yang tidak diperlukan untuk menjaga kebersihan codebase
- **Multi-Tenant Design**: Pertimbangkan kebutuhan multi-tenant dari awal desain database

## 2025-01-27: Penggabungan Migrasi Inventory Stock Movements

### Masalah
Terdapat dua file migrasi untuk tabel `inventory_stock_movements`:
1. `2025_06_25_000004_create_inventory_stock_movements_table.php` - Membuat tabel dengan ENUM type
2. `2025_06_26_130348_update_inventory_stock_movements_type_enum.php` - Menambahkan komentar ENUM

Ini menyebabkan:
- Migrasi terpisah yang tidak efisien
- Komentar ENUM tidak ada dari awal pembuatan tabel
- Potensi masalah jika migrasi kedua gagal

### Solusi
1. **Gabungkan Komentar ENUM:**
   - Tambahkan komentar ENUM langsung ke dalam definisi kolom saat pembuatan tabel
   - Gunakan method `->comment()` pada kolom ENUM
   - Hapus file migrasi kedua yang sudah tidak diperlukan

2. **Struktur ENUM yang Dioptimalkan:**
   ```php
   $table->enum('type', ['in', 'out', 'adj', 'waste'])
         ->comment('in: stock masuk, out: stock keluar, adj: penyesuaian, waste: pembuangan');
   ```

3. **Update Dokumentasi:**
   - Perbarui `cursor-database.md` dengan dokumentasi lengkap tabel inventory_stock_movements
   - Tambahkan relasi dan business rules yang jelas
   - Dokumentasikan semua field dan constraint

### Lesson Learned
- **ENUM Comments**: Selalu tambahkan komentar ENUM saat pembuatan tabel untuk dokumentasi yang jelas
- **Single Migration**: Lebih baik menggabungkan semua definisi kolom dalam satu migrasi
- **Documentation**: Dokumentasikan struktur tabel dengan lengkap termasuk business rules
- **Business Logic**: Pertimbangkan kebutuhan bisnis saat mendesain struktur ENUM
- **Audit Trail**: Tabel inventory_stock_movements penting untuk audit trail stok

## 2025-01-27: Penggabungan Migrasi Patient Records Index

### Masalah
Terdapat dua file migrasi untuk tabel `patient_records`:
1. `2025_06_27_070526_create_patient_records_table.php` - Membuat tabel dengan beberapa index
2. `2025_06_28_051229_add_name_index_to_patient_records_table.php` - Menambahkan index untuk kolom name

Ini menyebabkan:
- Migrasi terpisah yang tidak efisien
- Index name tidak ada dari awal pembuatan tabel
- Potensi masalah performa query pencarian berdasarkan nama

### Solusi
1. **Gabungkan Index:**
   - Tambahkan index untuk kolom `name` langsung ke dalam file pembuatan tabel utama
   - Hapus file migrasi kedua yang sudah tidak diperlukan

2. **Struktur Index yang Dioptimalkan:**
   ```php
   // Indexes
   $table->index(['company_id', 'plant_id']);
   $table->index('medical_record_number');
   $table->index('nik');
   $table->index('nip');
   $table->index('name'); // Ditambahkan untuk optimasi pencarian
   ```

3. **Update Dokumentasi:**
   - Perbarui `cursor-database.md` dengan dokumentasi lengkap tabel patient_records
   - Tambahkan relasi dan business rules yang jelas
   - Dokumentasikan semua index dan constraint

### Lesson Learned
- **Index Planning**: Selalu pertimbangkan index yang diperlukan saat mendesain tabel
- **Search Optimization**: Index pada kolom yang sering digunakan untuk pencarian (seperti nama)
- **Single Migration**: Lebih baik menggabungkan semua index dalam satu migrasi
- **Documentation**: Dokumentasikan semua index dan tujuan penggunaannya
- **Performance**: Index yang tepat dapat meningkatkan performa query secara signifikan

## 2025-01-27: Penggabungan Migrasi Medical Records

### Masalah
Terdapat dua file migrasi untuk tabel `medical_records`:
1. `2025_06_27_070552_create_medical_records_table.php` - Membuat tabel dengan doctor_id
2. `2025_06_28_061500_update_medical_records_for_visit_details.php` - Mengubah doctor_id menjadi examiner_id dan menambahkan shift_id, guarantor_id

Ini menyebabkan:
- Migrasi terpisah yang tidak efisien
- Perubahan struktur tabel setelah pembuatan
- Potensi masalah jika migrasi kedua gagal
- Nama kolom yang tidak konsisten (doctor_id vs examiner_id)

### Solusi
1. **Gabungkan Perubahan Struktur:**
   - Ubah `doctor_id` menjadi `examiner_id` langsung saat pembuatan tabel
   - Tambahkan kolom `shift_id` dan `guarantor_id` langsung saat pembuatan tabel
   - Hapus file migrasi kedua yang sudah tidak diperlukan

2. **Struktur Tabel yang Dioptimalkan:**
   ```php
   Schema::create('medical_records', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->uuid('outpatient_visit_id');
       $table->uuid('examiner_id'); // Sebelumnya doctor_id
       $table->uuid('shift_id')->nullable(); // Ditambahkan
       $table->uuid('guarantor_id')->nullable(); // Ditambahkan
       // ... kolom lainnya
       
       // Foreign key constraints
       $table->foreign('examiner_id')->references('id')->on('users')->onDelete('cascade');
       $table->foreign('shift_id')->references('id')->on('shifts')->onDelete('set null');
       $table->foreign('guarantor_id')->references('id')->on('guarantors')->onDelete('set null');
       
       // Indexes
       $table->index('examiner_id');
       $table->index('shift_id');
       $table->index('guarantor_id');
   });
   ```

3. **Update Dokumentasi:**
   - Perbarui `cursor-database.md` dengan struktur tabel yang baru
   - Tambahkan relasi dan constraint yang lengkap
   - Dokumentasikan perubahan nama kolom dan penambahan kolom baru

### Lesson Learned
- **Naming Convention**: Gunakan nama kolom yang konsisten dan deskriptif dari awal (examiner_id lebih baik dari doctor_id)
- **Complete Design**: Pertimbangkan semua kebutuhan bisnis saat mendesain tabel (shift, guarantor)
- **Single Migration**: Lebih baik menggabungkan semua perubahan struktur dalam satu migrasi
- **Documentation**: Update dokumentasi setiap kali ada perubahan struktur tabel
- **Business Logic**: Pertimbangkan alur bisnis lengkap saat mendesain relasi antar tabel

## Database Design

### 1. Migration Management
**Lesson**: Selalu gunakan transaction database untuk operasi yang melibatkan multiple tabel untuk menjaga konsistensi data.

**Example**: Saat menyimpan lab master dan referensi, gunakan DB::transaction untuk memastikan semua data tersimpan atau tidak sama sekali.

```php
DB::beginTransaction();
try {
    $labMaster = LabMaster::create([...]);
    foreach ($references as $reference) {
        LabReference::create([...]);
    }
    DB::commit();
} catch (\Exception $e) {
    DB::rollback();
    throw $e;
}
```

### 2. Foreign Key Relationships
**Lesson**: Selalu definisikan foreign key constraints dengan cascade rules yang tepat.

**Example**: 
```php
$table->foreign('lab_master_id')->references('id')->on('lab_masters')->cascadeOnDelete();
```

### 3. Enum Types
**Lesson**: Gunakan enum untuk field yang memiliki nilai terbatas dan tetap.

**Example**: 
```php
$table->enum('reference_type', ['universal', 'male', 'female']);
```

## Frontend Development

### 1. TypeScript Type Safety
**Lesson**: Definisikan interface yang jelas untuk data yang dikirim dari backend ke frontend.

**Example**:
```typescript
interface Reference {
  id?: string;
  reference_type: 'universal' | 'male' | 'female';
  reference: string;
}
```

### 2. Dynamic Form Management
**Lesson**: Gunakan state management yang tepat untuk form yang dinamis.

**Example**: Untuk form referensi yang bisa ditambah/hapus:
```typescript
const [references, setReferences] = useState<Reference[]>([]);

const addReference = () => {
  setReferences([...references, { reference_type: 'universal', reference: '' }]);
};

const removeReference = (index: number) => {
  setReferences(references.filter((_, i) => i !== index));
};
```

### 3. Form Validation
**Lesson**: Implementasikan validasi di backend dan frontend untuk keamanan data.

**Backend**:
```php
$request->validate([
    'references.*.reference_type' => 'required|in:universal,male,female',
    'references.*.reference' => 'required|string',
]);
```

## UI/UX Design

### 1. Color Coding
**Lesson**: Gunakan warna yang konsisten untuk membedakan kategori atau status.

**Example**: Badge warna untuk tipe referensi:
```typescript
const getReferenceTypeColor = (type: string) => {
  switch (type) {
    case 'universal': return 'bg-blue-100 text-blue-800';
    case 'male': return 'bg-green-100 text-green-800';
    case 'female': return 'bg-pink-100 text-pink-800';
  }
};
```

### 2. Progressive Disclosure
**Lesson**: Tampilkan informasi secara bertahap untuk menghindari overload informasi.

**Example**: Tampilkan jumlah referensi di tabel, detail lengkap di halaman view.

### 3. Dynamic UI Elements
**Lesson**: Berikan feedback visual yang jelas untuk aksi dinamis.

**Example**: Tombol tambah/hapus referensi dengan icon yang jelas.

## Data Management

### 1. Reference Data Handling
**Lesson**: Untuk data referensi yang kompleks, gunakan pendekatan "delete and recreate" untuk update.

**Example**:
```php
// Hapus semua referensi lama
$labMaster->references()->delete();

// Buat referensi baru
foreach ($newReferences as $reference) {
    LabReference::create([...]);
}
```

### 2. Data Integrity
**Lesson**: Selalu validasi relasi data sebelum operasi CRUD.

**Example**: Pastikan lab_master_id valid sebelum membuat referensi.

## Performance Optimization

### 1. Eager Loading
**Lesson**: Gunakan eager loading untuk menghindari N+1 query problem.

**Example**:
```php
$labMasters = LabMaster::with(['company', 'plant', 'references'])->get();
```

### 2. Pagination
**Lesson**: Implementasikan pagination untuk data yang besar.

**Example**:
```php
$labMasters = LabMaster::paginate(10)->withQueryString();
```

## Error Handling

### 1. User-Friendly Error Messages
**Lesson**: Berikan pesan error yang informatif dan mudah dipahami user.

**Example**:
```php
return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
```

### 2. Graceful Degradation
**Lesson**: Pastikan aplikasi tetap berfungsi meski ada error pada fitur tertentu.

**Example**: Jika referensi gagal dimuat, tampilkan pesan "Belum ada referensi" daripada error.

## Code Organization

### 1. Separation of Concerns
**Lesson**: Pisahkan logika bisnis, validasi, dan presentasi dengan jelas.

**Example**:
- Controller: Handle request/response
- Model: Business logic dan relationships
- View: Presentation logic

### 2. Reusable Components
**Lesson**: Buat komponen yang dapat digunakan kembali untuk UI yang konsisten.

**Example**: Badge component untuk status, form components untuk input.

## Testing

### 1. Data Seeding
**Lesson**: Buat seeder yang realistic dan comprehensive untuk testing.

**Example**: Seeder yang membuat data lab master dengan berbagai tipe referensi.

### 2. Edge Cases
**Lesson**: Test edge cases seperti data kosong, nilai maksimum, karakter khusus.

**Example**: Test dengan referensi kosong, nama yang sangat panjang, dll.

## Security

### 1. Input Validation
**Lesson**: Validasi input di frontend dan backend untuk keamanan.

**Example**: Validasi tipe referensi hanya menerima nilai yang diizinkan.

### 2. SQL Injection Prevention
**Lesson**: Gunakan Eloquent ORM untuk mencegah SQL injection.

**Example**: Gunakan `where()` method daripada raw SQL.

## Maintenance

### 1. Documentation
**Lesson**: Dokumentasikan perubahan penting dan alasan di balik keputusan teknis.

**Example**: Update documentation setiap ada fitur baru atau perubahan struktur.

### 2. Version Control
**Lesson**: Gunakan commit message yang deskriptif dan grouping yang logis.

**Example**: 
```
feat: add laboratory reference system
- Add gender-based and universal reference types
- Implement dynamic reference management
- Add color-coded reference display
```

## Multi-Tenant Architecture

### 1. Role-Based Access Control
**Lesson**: Implementasikan access control berdasarkan role user untuk memisahkan data antar tenant.

**Example**: 
```php
$user = Auth::user();
$isSuperAdmin = $user->role && $user->role->name === 'super_admin';

if (!$isSuperAdmin) {
    $query->where('company_id', $user->company_id)
          ->where('plant_id', $user->plant_id);
}
```

### 2. Dynamic UI Based on User Role
**Lesson**: Adaptasi UI berdasarkan role user untuk memberikan pengalaman yang sesuai.

**Example**: 
```typescript
{isSuperAdmin ? (
  <Select value={company_id} onValueChange={setCompanyId}>
    <SelectItem value="all">Semua Perusahaan</SelectItem>
    {companies.map(company => (
      <SelectItem key={company.id} value={company.id}>
        {company.name}
      </SelectItem>
    ))}
  </Select>
) : (
  <div className="bg-blue-50 p-4">
    <p>Perusahaan: {userCompany?.name}</p>
    <p>Plant: {userPlant?.name}</p>
  </div>
)}
```

### 3. Backend Security Validation
**Lesson**: Selalu validasi akses di backend, jangan hanya mengandalkan frontend.

**Example**:
```php
// Multi-tenant access control
if (!$isSuperAdmin) {
    if ($labMaster->company_id !== $user->company_id || 
        $labMaster->plant_id !== $user->plant_id) {
        abort(403, 'Anda tidak memiliki akses ke data ini.');
    }
}
```

### 4. Conditional Validation
**Lesson**: Gunakan validasi kondisional berdasarkan role user.

**Example**:
```php
$request->validate([
    'company_id' => $isSuperAdmin ? 'nullable' : 'prohibited',
    'plant_id' => $isSuperAdmin ? 'nullable' : 'prohibited',
    'name' => 'required|string|max:30',
]);
```

### 5. Data Isolation
**Lesson**: Pastikan data benar-benar terisolasi antar tenant dengan filtering yang konsisten.

**Example**:
```php
// Query filtering untuk multi-tenant
$query = LabMaster::with(['company', 'plant', 'references']);

if ($user->role && $user->role->name !== 'super_admin') {
    $query->where(function($q) use ($user) {
        $q->where('company_id', $user->company_id)
          ->where('plant_id', $user->plant_id);
    });
}
```

## Best Practices Summary

1. **Database**: Gunakan transactions, foreign keys, dan validasi
2. **Frontend**: Type safety, dynamic state management, user feedback
3. **UI/UX**: Color coding, progressive disclosure, consistent design
4. **Performance**: Eager loading, pagination, optimization
5. **Security**: Input validation, SQL injection prevention, multi-tenant access control
6. **Multi-Tenant**: Role-based access, data isolation, conditional validation
7. **Maintenance**: Documentation, version control, testing

## 1. Database Migration dan Seeder

### 1.1 Migrasi Tabel
- **Pelajaran:** Selalu gunakan `php artisan migrate:fresh --seed` untuk reset database yang bersih
- **Alasan:** Menghindari konflik foreign key dan data yang tidak konsisten
- **Best Practice:** Backup data penting sebelum melakukan fresh migration

### 1.2 Seeder dan Data Dummy
- **Pelajaran:** Pastikan seeder tidak menghasilkan duplicate entry
- **Solusi:** Gunakan unique constraint dan validasi data sebelum insert
- **Contoh:** Nomor kunjungan outpatient harus unik dengan format YYMM-XXXX

### 1.3 Foreign Key Constraints
- **Pelajaran:** Selalu definisikan foreign key dengan cascade/restrict yang tepat
- **Best Practice:** 
  - `cascadeOnDelete()` untuk data yang saling terkait erat
  - `nullOnDelete()` untuk data opsional
  - `restrictOnDelete()` untuk mencegah penghapusan data penting

## 2. Multi-Tenant Architecture

### 2.1 Prinsip Multi-Tenant
- **Pelajaran:** Setiap user hanya bisa mengakses data perusahaan/plant mereka sendiri
- **Implementasi:** Filter data berdasarkan `company_id` dan `plant_id` user
- **Keamanan:** Validasi akses di setiap controller method

### 2.2 Role-Based Access Control
- **Pelajaran:** Super admin bisa akses semua data, user biasa terbatas
- **Implementasi:** Cek role user sebelum memberikan akses
- **Best Practice:** Gunakan middleware atau policy untuk konsistensi

### 2.3 Penghapusan Pilihan "Semua Perusahaan/Plant"
- **Pelajaran:** Pilihan "Semua Perusahaan" dan "Semua Plant" dapat mengganggu stabilitas server
- **Alasan:** 
  - Melanggar prinsip multi-tenant
  - Dapat menyebabkan data corruption
  - Meningkatkan beban server
- **Solusi:** 
  - Super admin harus memilih perusahaan/plant spesifik
  - User biasa otomatis terkait dengan perusahaan/plant mereka
  - Validasi wajib untuk company_id dan plant_id

## 3. Frontend Development

### 3.1 Form Validation
- **Pelajaran:** Validasi di frontend dan backend harus konsisten
- **Best Practice:** 
  - Gunakan TypeScript untuk type safety
  - Validasi real-time di frontend
  - Validasi server-side sebagai backup

### 3.2 State Management
- **Pelajaran:** Gunakan state lokal untuk data yang tidak perlu di-share
- **Contoh:** References laboratorium menggunakan useState lokal
- **Best Practice:** Kirim data ke backend hanya saat submit

### 3.3 User Experience
- **Pelajaran:** Berikan feedback yang jelas kepada user
- **Implementasi:** 
  - Loading state saat processing
  - Error message yang informatif
  - Success message setelah operasi berhasil

## 4. API Design

### 4.1 RESTful API
- **Pelajaran:** Gunakan resource routing yang konsisten
- **Best Practice:** 
  - `GET /resource` untuk index
  - `POST /resource` untuk create
  - `PUT /resource/{id}` untuk update
  - `DELETE /resource/{id}` untuk delete

### 4.2 Data Validation
- **Pelajaran:** Validasi data di backend lebih penting dari frontend
- **Implementasi:** 
  - Gunakan Laravel validation rules
  - Custom validation untuk business logic
  - Return error message yang jelas

### 4.3 Database Transactions
- **Pelajaran:** Gunakan transaction untuk operasi yang melibatkan multiple table
- **Contoh:** Create lab master + references
- **Best Practice:** 
  - Begin transaction di awal
  - Commit jika semua berhasil
  - Rollback jika ada error

## 5. Security

### 5.1 Access Control
- **Pelajaran:** Selalu validasi akses user sebelum operasi CRUD
- **Implementasi:** 
  - Cek role user
  - Cek company_id dan plant_id
  - Gunakan middleware auth

### 5.2 Data Sanitization
- **Pelajaran:** Sanitasi input user untuk mencegah XSS dan injection
- **Best Practice:** 
  - Gunakan Laravel validation
  - Escape output HTML
  - Gunakan prepared statements

## 6. Performance

### 6.1 Database Queries
- **Pelajaran:** Optimasi query untuk performa yang baik
- **Best Practice:** 
  - Gunakan eager loading untuk relasi
  - Index pada kolom yang sering di-query
  - Pagination untuk data besar

### 6.2 Caching
- **Pelajaran:** Cache data yang jarang berubah
- **Implementasi:** 
  - Cache master data (companies, plants)
  - Cache user permissions
  - Invalidate cache saat data berubah

## 7. Testing

### 7.1 Unit Testing
- **Pelajaran:** Test setiap method secara terpisah
- **Best Practice:** 
  - Test happy path dan error cases
  - Mock external dependencies
  - Test edge cases

### 7.2 Integration Testing
- **Pelajaran:** Test integrasi antar komponen
- **Implementasi:** 
  - Test API endpoints
  - Test database transactions
  - Test multi-tenant logic

## 8. Documentation

### 8.1 Code Documentation
- **Pelajaran:** Dokumentasi kode yang jelas membantu maintenance
- **Best Practice:** 
  - Comment untuk business logic kompleks
  - README untuk setup project
  - API documentation

### 8.2 Database Documentation
- **Pelajaran:** Dokumentasi struktur database penting untuk tim
- **Implementasi:** 
  - ERD (Entity Relationship Diagram)
  - Dokumentasi foreign key
  - Dokumentasi business rules

## 9. Deployment

### 9.1 Environment Configuration
- **Pelajaran:** Pisahkan konfigurasi development dan production
- **Best Practice:** 
  - Gunakan .env file
  - Jangan commit sensitive data
  - Validasi environment variables

### 9.2 Database Migration
- **Pelajaran:** Selalu backup database sebelum migration
- **Best Practice:** 
  - Test migration di staging
  - Rollback plan
  - Monitor migration progress

## 10. Monitoring dan Maintenance

### 10.1 Error Logging
- **Pelajaran:** Log error untuk debugging
- **Implementasi:** 
  - Laravel logging
  - Error tracking service
  - Alert untuk critical errors

### 10.2 Performance Monitoring
- **Pelajaran:** Monitor performa aplikasi
- **Tools:** 
  - Laravel Telescope
  - Database query log
  - Server monitoring

---

**Catatan:** Dokumen ini akan terus diupdate seiring dengan pembelajaran dan pengalaman development.
