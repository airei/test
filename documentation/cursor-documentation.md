# Dokumentasi Sistem Medicare

## Ringkasan
Sistem Medicare adalah aplikasi manajemen rumah sakit yang dibangun menggunakan Laravel 12, Inertia.js, dan React dengan TypeScript. Sistem ini dirancang untuk mengelola berbagai aspek operasional rumah sakit termasuk manajemen user, role & hak akses, data master, dan pelayanan pasien.

## Teknologi yang Digunakan
- **Backend**: Laravel 12 (PHP)
- **Frontend**: React 18 dengan TypeScript
- **Database**: MySQL
- **UI Framework**: Shadcn/ui dengan Tailwind CSS
- **State Management**: Inertia.js
- **Authentication**: Laravel Breeze

## Struktur Database

### Tabel Utama
1. **users** - Data pengguna sistem
2. **roles** - Role/peran pengguna
3. **permissions** - Hak akses/modul
4. **role_permissions** - Relasi many-to-many role dan permission
5. **companies** - Data perusahaan
6. **plants** - Data cabang/pabrik
7. **diagnosas** - Data diagnosa penyakit
8. **departments** - Data departemen
9. **shifts** - Data shift kerja
10. **employee_statuses** - Data status karyawan
11. **guarantors** - Data penjamin asuransi

### Tabel Rekam Medis
12. **patient_records** - Data pasien dengan informasi lengkap
13. **outpatient_queue** - Antrian rawat jalan
14. **medical_records** - Rekam medis pasien
15. **diagnosis_details** - Detail diagnosa
16. **prescriptions** - Resep obat
17. **prescription_details** - Detail resep

### Tabel Laboratorium
18. **lab_request** - Permintaan pemeriksaan lab
19. **lab_queue** - Antrian pemeriksaan lab
20. **lab_details** - Detail pemeriksaan lab
21. **lab_result** - Hasil pemeriksaan lab

### Audit Trail
- **audit_trails** - Log perubahan data untuk semua tabel

## Fitur Utama

### 1. Admin Panel
- **User Management**: CRUD user dengan role assignment
- **Role & Hak Akses**: Manajemen role dan permission
- **Company & Plant**: Manajemen data perusahaan dan cabang
- **Diagnosa**: 
  - Manajemen data diagnosa penyakit dengan struktur lengkap
  - **Kolom**: Kode, Nama, Deskripsi, Status (Aktif/Tidak Aktif)
  - **Export Excel**: Download data diagnosa dalam format Excel (.xlsx)
  - **Import Excel**: Upload file Excel untuk import batch data diagnosa
  - **Format Import**: Kolom wajib `kode`, `nama`, dan opsional `deskripsi`
  - **Validasi**: Kode unik maksimal 50 karakter, nama dan deskripsi maksimal 300 karakter
  - **Template**: Template download tersedia melalui tombol "Download Template" di halaman import

### 2. Manajemen
- **Departemen**: 
  - CRUD data departemen dengan kode dan deskripsi
  - **Export/Import Excel**: Fitur export dan import data departemen
  - **Layout Tombol**: Tombol export dan import diposisikan di samping tombol "Tambah Departemen" di header halaman
  - **Komponen DataPageLayout**: Mendukung prop `headerActions` untuk menampilkan tombol tambahan di header
- **Shift**: CRUD data shift kerja dengan waktu mulai dan selesai
- **Status Karyawan**: CRUD data status karyawan (Tetap, Kontrak, dll)
- **Penjamin**: CRUD data penjamin asuransi dengan kode
- **Laboratorium**: Manajemen data laboratorium (dalam pengembangan)
- **Inventory**: 
  - **Item Inventory**: Manajemen item inventory dengan CRUD lengkap di halaman utama `/inventory`
  - **Kategori**: Manajemen kategori inventory terpisah di halaman `/inventory/category`
  - **Unit**: Manajemen unit inventory terpisah di halaman `/inventory/unit`
  - Fitur: Stock tracking, price management, status management (active/inactive)
  - Navigasi: Tombol untuk akses ke halaman kategori dan unit dari halaman utama
  - **Toggle Status**: Fitur toggle aktif/nonaktif dengan parameter binding yang benar dan auto-refresh data

### 3. Pelayanan

#### Registrasi & Rekam Medis ✅
- **Database Schema**: Tabel patient_records dengan struktur lengkap
- **Controller**: RegistrasiRekamMedisController dengan method CRUD
- **Model**: PatientRecord dengan relasi ke tabel lain
- **Route**: Resource route untuk registrasi rekam medis
- **Halaman**: Index page dasar (dalam pengembangan)
- **Fitur yang akan ditambahkan**:
  - Tabel data pasien dengan pagination
  - Filter berdasarkan perusahaan, plant, departemen, status karyawan
  - Pencarian berdasarkan nama, NIK, NIP, atau nomor rekam medis
  - Aksi medis (riwayat, berobat, cek lab)
  - Aksi data (detail, edit, hapus)

#### Rawat Jalan ✅
- **Halaman**: Tabel paginasi data outpatient queue dengan filter dan aksi
- **Filter**: Status (waiting, in_progress, completed, cancelled)
- **Aksi**: Update status dan tombol konsultasi
- **Controller**: OutpatientQueueController dengan method CRUD dan update status
- **Model**: OutpatientQueue dengan relasi ke patient
- **Route**: Resource route dengan method tambahan untuk update status
- **Seeder**: Data dummy untuk testing

#### Konsultasi ✅
- **Halaman**: Form SOAP lengkap untuk pemeriksaan dokter
- **Struktur**:
  - **Sidebar**: Data pasien lengkap dengan informasi perusahaan, plant, dan departemen
  - **Form Konsultasi**:
    - **Pemeriksa**: Dropdown pemilihan dokter/pemeriksa
    - **Chief Complaint**: Keluhan utama pasien (textarea)
    - **Riwayat Penyakit**: Field yang dapat diedit langsung, data dari patient_record.illness_history ✅
    - **Vital Signs**: Tekanan darah sistol & diastol terpisah, nadi, respirasi, suhu, SpO2 ✅
    - **Antropometri & Status Gizi**: Grouping tinggi badan, berat badan, BMI dengan indikator status gizi ✅
    - **Pemeriksaan Fisik**: Hasil pemeriksaan fisik
    - **Diagnosa**: Multiple diagnosa dengan autocomplete ICD-10
    - **Resep Obat**: Multiple resep dengan autocomplete inventory items
- **Fitur Terbaru**:
  - **Tekanan Darah Terpisah**: Sistol dan diastol input terpisah sesuai struktur database
  - **Riwayat Penyakit Editable**: Field dapat diedit langsung dan disimpan ke patient_record
  - **Status Gizi Otomatis**: Kalkulasi BMI dan penampilan status gizi berdasarkan nilai BMI
  - **Grouping Antropometri**: Section terpisah untuk data tinggi, berat, BMI dengan tampilan status
  - **Validasi Enhanced**: Validasi range nilai untuk vital signs (sistol 0-300, diastol 0-200, dll)
- **Controller**: KonsultasiController dengan validasi dan penyimpanan yang diperbarui
- **Model**: MedicalRecord dengan field terpisah untuk sistol/diastol, tanpa field BMI
- **Database**: Field status enum (draft, complete) ditambahkan ke medical_records ✅
- **Integration**: 
  - Update patient_record.illness_history saat konsultasi
  - Penyimpanan vital signs terpisah sesuai struktur database
  - Auto-calculation BMI di frontend dengan status gizi

#### Pemeriksaan Lab ⏳
- Halaman dasar (belum dikembangkan)

### 4. Laporan
- **Kunjungan Rawat Jalan**: Laporan kunjungan pasien rawat jalan
- **Kunjungan Pemeriksaan Lab**: Laporan pemeriksaan laboratorium
- **Obat Keluar**: Laporan pengeluaran obat
- **Tagihan**: Laporan tagihan pasien

## Arsitektur Frontend

### Struktur Komponen
```
resources/js/
├── components/
│   ├── ui/           # Komponen UI dasar (Button, Input, dll)
│   ├── app-*.tsx     # Komponen layout aplikasi
│   └── *.tsx         # Komponen umum
├── pages/
│   ├── AdminPanel/   # Halaman admin panel
│   ├── Manajemen/    # Halaman manajemen
│   ├── Pelayanan/    # Halaman pelayanan
│   │   ├── RegistrasiRekamMedis/  # Halaman registrasi rekam medis
│   │   ├── rawat-jalan.tsx        # Halaman rawat jalan
│   │   └── konsultasi-form.tsx    # Halaman form konsultasi SOAP
│   └── Laporan/      # Halaman laporan
└── layouts/          # Layout aplikasi
```

### Pola Halaman
Setiap modul mengikuti pola yang konsisten:
- **Index.tsx**: Daftar data dengan search, filter, dan aksi CRUD
- **Create.tsx**: Form tambah data baru
- **Edit.tsx**: Form edit data existing
- **Show.tsx**: Detail data (opsional)

### Komponen DataPageLayout
Komponen layout utama untuk halaman data yang menyediakan:
- **Header**: Judul halaman dan tombol aksi utama
- **Search Form**: Form pencarian dengan input dan tombol cari
- **Content Area**: Area untuk konten tabel dan komponen lainnya
- **Props**:
  - `title`: Judul halaman
  - `createRoute`: URL untuk tombol "Tambah"
  - `createLabel`: Label tombol "Tambah"
  - `listRoute`: Route untuk pencarian
  - `initialSearch`: Nilai awal pencarian
  - `searchPlaceholder`: Placeholder input pencarian
  - `headerActions`: Tombol tambahan di header (export, import, dll) - **BARU**
  - `children`: Konten utama halaman

### Komponen UI yang Digunakan
- **Card**: Container utama untuk konten
- **Button**: Tombol aksi dengan berbagai variant
- **Input**: Input text, number, time, dll
- **Textarea**: Input multi-line
- **Checkbox**: Input boolean
- **Badge**: Status indicator
- **Dialog**: Modal konfirmasi
- **Icon**: Lucide React icons

## Route Management & Optimization

### Route Cleanup - Auth Settings ✅
- **Masalah**: Route duplikat untuk `password.update` dan `profile.update`
- **Lokasi Duplikat**: 
  - `routes/web.php`: `PUT password` dan `PUT profile`
  - `routes/settings.php`: `PUT settings/password` dan `PATCH settings/profile`
- **Solusi**: Menghapus route duplikat di `web.php` dan mempertahankan route di `settings.php`
- **Alasan**:
  - Route di `settings.php` lebih terorganisir dengan prefix `settings/`
  - Method PATCH lebih semantic untuk update profile
  - Struktur lebih clean dan tidak menimbulkan konflik
  - Frontend sudah kompatibel dengan kedua route name
- **Hasil**: Route yang digunakan sekarang:
  - `PUT settings/password` → `password.update`
  - `PATCH settings/profile` → `profile.update`

## Arsitektur Backend

### Struktur Controller
```
app/Http/Controllers/
├── AdminPanel/       # Controller admin panel
├── Manajemen/        # Controller manajemen
├── Pelayanan/        # Controller pelayanan
│   ├── RegistrasiRekamMedisController.php  # Controller registrasi rekam medis
│   ├── OutpatientQueueController.php       # Controller rawat jalan
│   └── KonsultasiController.php            # Controller konsultasi
├── Laporan/          # Controller laporan
└── Auth/            # Controller autentikasi
```

### Pola Controller
Setiap controller mengikuti pola resource controller Laravel:
- `index()` - Menampilkan daftar data
- `create()` - Form tambah data
- `store()` - Menyimpan data baru
- `show()` - Menampilkan detail data
- `edit()` - Form edit data
- `update()` - Memperbarui data
- `destroy()` - Menghapus data
- `toggleStatus()` - Toggle status aktif/nonaktif

### Model
Semua model menggunakan UUID sebagai primary key dan memiliki:
- `$incrementing = false`
- `$keyType = 'string'`
- Relasi dengan model lain
- Event boot untuk generate UUID otomatis
- Audit trail integration

## Routing

### Struktur Route
```php
// Admin Panel
Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::resource('user', UserController::class);
    Route::resource('role-hak-akses', RoleHakAksesController::class);
    Route::resource('diagnosa', DiagnosaController::class);
    // Company & Plant routes
});

// Manajemen
Route::prefix('manajemen')->middleware(['auth', 'verified'])->group(function () {
    Route::resource('departemen', DepartemenController::class);
    Route::resource('shift', ShiftController::class);
    Route::resource('status-karyawan', StatusKaryawanController::class);
    Route::resource('penjamin', PenjaminController::class);
    Route::resource('laboratorium', LaboratoriumController::class);
    Route::resource('inventory', InventoryController::class);
    Route::resource('inventory/category', InventoryCategoryController::class);
    Route::resource('inventory/unit', InventoryUnitController::class);
    Route::patch('inventory/{inventory}/toggle-status', [InventoryController::class, 'toggleStatus'])->name('inventory.toggle-status');
});

// Pelayanan
Route::prefix('pelayanan')->middleware(['auth', 'verified'])->group(function () {
    Route::resource('registrasi-rekam-medis', RegistrasiRekamMedisController::class);
    Route::resource('rawat-jalan', OutpatientQueueController::class);
    Route::patch('rawat-jalan/{outpatientQueue}/update-status', [OutpatientQueueController::class, 'updateStatus'])->name('rawat-jalan.update-status');
    Route::resource('konsultasi', KonsultasiController::class);
});

// Laporan
Route::prefix('laporan')->middleware(['auth', 'verified'])->group(function () {
    Route::get('kunjungan-rawat-jalan', [KunjunganRawatJalanController::class, 'index'])->name('laporan.kunjungan-rawat-jalan');
    Route::get('kunjungan-pemeriksaan-lab', [KunjunganPemeriksaanLabController::class, 'index'])->name('laporan.kunjungan-pemeriksaan-lab');
    Route::get('obat-keluar', [ObatKeluarController::class, 'index'])->name('laporan.obat-keluar');
    Route::get('tagihan', [TagihanController::class, 'index'])->name('laporan.tagihan');
});
```

## Status Pengembangan

### ✅ Selesai
- **Admin Panel**: User management, role & hak akses, company & plant, diagnosa
- **Manajemen**: Departemen (dengan export/import), shift, status karyawan, penjamin, laboratorium, inventory (dengan kategori dan unit)
- **Pelayanan**: 
  - Rawat jalan dengan tabel, filter, dan aksi update status
  - Konsultasi dengan form SOAP lengkap
- **Laporan**: Struktur dasar untuk semua laporan

### ⏳ Dalam Pengembangan
- **Pelayanan**: Registrasi rekam medis (halaman index)
- **Pelayanan**: Pemeriksaan lab
- **Laporan**: Implementasi detail untuk semua laporan

### 📋 Rencana Pengembangan
- **Pelayanan**: Integrasi lengkap antar modul
- **Dashboard**: Dashboard dengan statistik dan grafik
- **Notifikasi**: Sistem notifikasi real-time
- **Export/Import**: Fitur export/import untuk semua modul
- **API**: REST API untuk integrasi eksternal

## Catatan Teknis

### Error yang Sudah Diperbaiki
1. **Ziggy Route Error**: Route `pelayanan.rawat-jalan` tidak ditemukan - diperbaiki dengan mengganti ke `pelayanan.rawat-jalan.index`
2. **Select Component Error**: Value kosong menyebabkan error - diperbaiki dengan mengganti value kosong menjadi `"all"`
3. **Konsultasi Form Error**: Struktur file yang rusak - diperbaiki dengan membuat ulang file dengan struktur yang benar
4. **TypeScript Errors**: Error tipe data - diperbaiki dengan menyesuaikan interface dan type definitions

### Best Practices yang Diterapkan
1. **Component Structure**: Komponen terpisah untuk setiap bagian SOAP (Subjective, Objective, Assessment, Plan)
2. **Type Safety**: Penggunaan TypeScript untuk type safety
3. **Error Handling**: Validasi input dan error handling yang proper
4. **User Experience**: UI/UX yang user-friendly dengan layout yang jelas
5. **Code Organization**: Struktur kode yang terorganisir dan mudah dipelihara

## Instalasi dan Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- XAMPP/WAMP/LAMP

### Setup Development
```bash
# Clone repository
git clone <repository-url>
cd medicare

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Build assets
npm run build

# Start development server
php artisan serve
```

### Database Seeding
```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=MedicareSeeder
php artisan db:seed --class=OutpatientQueueSeeder
```

## Troubleshooting

### Common Issues
1. **Route not found**: Clear route cache dengan `php artisan route:clear`
2. **Component not found**: Clear config cache dengan `php artisan config:clear`
3. **TypeScript errors**: Restart TypeScript server di IDE
4. **Database connection**: Periksa konfigurasi database di `.env`

### Cache Management
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Clear specific cache
php artisan cache:clear --tags=medicare
```

## Kontribusi

### Guidelines
1. Ikuti coding standards Laravel dan PSR-12
2. Gunakan TypeScript untuk frontend
3. Tulis unit tests untuk fitur baru
4. Update dokumentasi untuk perubahan
5. Gunakan conventional commits

### Branch Strategy
- `main`: Branch utama untuk production
- `develop`: Branch development
- `feature/*`: Branch untuk fitur baru
- `hotfix/*`: Branch untuk perbaikan urgent

## Lisensi
Proprietary - All rights reserved

## Halaman Konsultasi

### Deskripsi
Halaman konsultasi adalah form pemeriksaan dan konsultasi pasien yang terdiri dari 2 section utama:

1. **Sidebar - Informasi Pasien**: Menampilkan data lengkap pasien dan form input shift/penjamin
2. **Main Section - Form Konsultasi**: Form lengkap untuk pemeriksaan medis

### Struktur Halaman

#### Sidebar (Informasi Pasien)
- **Data Pasien**:
  - No. RM (Medical Record Number)
  - Nama pasien
  - NIK/NIP
  - Jenis kelamin
  - Tanggal lahir
  - Golongan darah
  - No. telepon
  - Alamat
  - Departemen
  - Status karyawan

- **Form Input**:
  - Shift (dropdown dari database)
  - Penjamin (dropdown dari database)

- **Data Medis**:
  - Riwayat penyakit (dari patient record)
  - Alergi (dari patient record)

#### Main Section (Form Konsultasi)
1. **Pemeriksa**: Dropdown untuk memilih nama pemeriksa dari database user
2. **Chief Complaint**: Textarea untuk keluhan utama pasien
3. **TTV (Tanda Tanda Vital)**:
   - Tekanan darah sistolik/diastolik
   - Nadi
   - Pernafasan
   - Suhu
   - Saturasi oksigen
4. **Status Gizi**:
   - Berat badan (kg)
   - Tinggi badan (cm)
   - BMI (otomatis dihitung)
   - Kategori BMI (Kurus/Normal/Gemuk/Obesitas)
5. **Pemeriksaan Fisik**: Textarea untuk hasil pemeriksaan fisik
6. **Diagnosa**:
   - Diagnosa (tulis)
   - Diagnosa ICD-10 (dropdown dari tabel diagnosa)
7. **Resep Obat**:
   - Nama obat (dropdown dari inventory)
   - Dosis
   - Aturan pakai
   - Bisa menambah/hapus obat

### Fitur Utama
- **Responsive Design**: Layout 2 kolom pada desktop, 1 kolom pada mobile
- **Auto BMI Calculation**: Menghitung BMI otomatis saat input berat dan tinggi
- **Dynamic Medicine Form**: Bisa menambah/hapus obat secara dinamis
- **Data Validation**: Validasi input sesuai standar medis
- **Multi-tenant Support**: Filter data berdasarkan company/plant user

### Route
- **GET** `/pelayanan/konsultasi/{id}` - Menampilkan form konsultasi
- **POST** `/pelayanan/konsultasi/{id}` - Menyimpan data konsultasi

### Controller
- **KonsultasiController@show** - Menampilkan form dengan data yang diperlukan
- **KonsultasiController@store** - Menyimpan data konsultasi ke database

### Database Tables
- `medical_records` - Data pemeriksaan medis
- `diagnosis_details` - Data diagnosa
- `prescriptions` - Data resep
- `prescription_details` - Detail obat dalam resep
- `outpatient_queue` - Update status menjadi completed

### Validasi
- Examiner ID wajib diisi
- Chief complaint wajib diisi
- TTV: nilai dalam range yang masuk akal
- BMI: otomatis dihitung dari berat dan tinggi
- Obat: minimal 1 obat jika ada resep

### Integrasi
- Terintegrasi dengan sistem rawat jalan
- Menggunakan data dari patient record
- Terhubung dengan inventory untuk stok obat
- Support multi-tenant (company/plant)

## Laboratory Reference System

### Overview
Sistem referensi laboratorium memungkinkan pengelolaan nilai referensi untuk setiap jenis pemeriksaan laboratorium dengan dukungan untuk:

1. **Universal References** - Nilai referensi yang berlaku untuk semua gender
2. **Gender-based References** - Nilai referensi khusus untuk laki-laki dan perempuan

### Database Structure
- `lab_masters` - Master data pemeriksaan laboratorium
- `lab_references` - Nilai referensi dengan tipe (universal, male, female)

### Features
- **Create/Edit Laboratory Tests** dengan multiple referensi
- **Reference Type Management**:
  - Universal (Semua Gender)
  - Laki-laki
  - Perempuan
- **Dynamic Reference Addition** - Tambah/hapus referensi secara dinamis
- **Reference Display** - Tampilan referensi berdasarkan tipe dengan warna berbeda
- **Reference Count** - Menampilkan jumlah referensi di tabel index

### UI Components
- Form input untuk jenis referensi (dropdown)
- Form input untuk nilai referensi (text)
- Dynamic form untuk multiple referensi
- Color-coded badges untuk tipe referensi
- Grouped display di halaman detail

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset

### Master Data
- `GET /admin/companies` - Company management
- `GET /admin/plants` - Plant management
- `GET /admin/users` - User management
- `GET /admin/roles` - Role management

### Management
- `GET /manajemen/departemen` - Department management
- `GET /manajemen/shift` - Shift management
- `GET /manajemen/status-karyawan` - Employee status management
- `GET /manajemen/penjamin` - Guarantor management
- `GET /manajemen/inventory` - Inventory management
- `GET /manajemen/laboratorium` - Laboratory management

### Patient Services
- `GET /pelayanan/registrasi-rekam-medis` - Medical record registration
- `GET /pelayanan/rawat-jalan` - Outpatient services
- `GET /pelayanan/konsultasi` - Consultation services

### Reports
- `GET /laporan/kunjungan-rawat-jalan` - Outpatient visit reports
- `GET /laporan/kunjungan-pemeriksaan-lab` - Laboratory test reports
- `GET /laporan/obat-keluar` - Drug dispensing reports
- `GET /laporan/tagihan` - Billing reports

## Development Guidelines

### Code Standards
- Follow Laravel best practices
- Use TypeScript for frontend components
- Implement proper error handling
- Add input validation
- Use database transactions for data integrity
- Implement audit trails for critical operations

### File Structure
```
app/
├── Http/Controllers/
│   ├── AdminPanel/     # Admin panel controllers
│   ├── Manajemen/      # Management controllers
│   ├── Pelayanan/      # Service controllers
│   └── Laporan/        # Report controllers
├── Models/             # Eloquent models
├── Exports/            # Excel export classes
└── Imports/            # Excel import classes

resources/js/
├── pages/              # React page components
├── components/         # Reusable UI components
├── layouts/            # Layout components
└── types/              # TypeScript type definitions
```

### Database Migrations
- Use descriptive migration names
- Include foreign key constraints
- Add indexes for performance
- Implement soft deletes where appropriate
- Add audit trail columns (created_by, updated_by)

### Frontend Components
- Use Shadcn/ui components
- Implement responsive design
- Add loading states
- Handle form validation
- Use proper TypeScript types

## Deployment

### Requirements
- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Composer
- NPM/Yarn

### Installation
1. Clone repository
2. Install PHP dependencies: `composer install`
3. Install Node dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Generate application key: `php artisan key:generate`
6. Configure database in `.env`
7. Run migrations: `php artisan migrate`
8. Seed database: `php artisan db:seed`
9. Build assets: `npm run build`

### Environment Variables
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medicare
DB_USERNAME=root
DB_PASSWORD=

APP_NAME="Medicare System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
```

## Recent Updates

### FastExcel Migration (Latest)
- **Tanggal:** 2025-07-04
- **Perubahan:** Mengganti Maatwebsite/Excel dengan FastExcel untuk performa yang lebih baik
- **Package Changes:**
  - Install `rap2hpoutre/fast-excel` package
  - Keep `maatwebsite/excel` for backward compatibility (if needed)
- **Performance Benefits:**
  - Faster file processing (up to 3x faster than Maatwebsite/Excel)
  - Lower memory usage
  - Simpler syntax and API
  - Better handling of large files
- **Implementation Changes:**
  - **DiagnosaImport**: Completely rewritten using FastExcel
    - Removed complex interface implementations (ToModel, WithHeadingRow, etc.)
    - Simplified to direct file processing with custom logic
    - Maintains all validation and error handling
    - Better memory management with individual saves
  - **DiagnosaExport**: Rewritten using FastExcel
    - Cleaner export logic with direct data mapping
    - Added `exportToFile()` method for testing
    - Template export functionality maintained
  - **DiagnosaController**: Updated to use FastExcel
    - Simplified import/export method calls
    - Better file handling with temporary storage
    - Enhanced error logging and cleanup
- **Backward Compatibility:**
  - All existing functionality preserved
  - Same API endpoints and responses
  - No frontend changes required
  - Same file formats supported (.xlsx, .xls)

### Diagnosa Import/Export Enhancement

#### Enhanced Import Features
- **Template Download**: Added dedicated route for downloading import template
- **Description Support**: Import now supports description column (optional)
- **Validation**: Enhanced validation for all fields (code, name, description)
- **Error Handling**: Smart error reporting with categorization
- **Memory Optimization**: Normal PHP memory limits with optimized session handling
- **Performance**: Optimized chunking and batch processing for large datasets

#### Import Process Flow
1. **File Upload**: Excel files (.xlsx, .xls) up to 10MB
2. **Validation**: Format and data validation per row
3. **Processing**: Batch processing with memory-efficient chunking
4. **Error Handling**: Limited error messages (max 50) to prevent session overflow
5. **Session Management**: Automatic cleanup to prevent MySQL max_allowed_packet issues
6. **User Feedback**: Comprehensive error summaries with actionable guidance

#### Technical Optimizations
- **FastExcel Integration**: Replaced Maatwebsite/Excel for better performance
- **Normal Memory Usage**: Uses default PHP settings (128M typical)
- **Session Payload**: Limited to max 50 error messages
- **Individual Processing**: Records saved individually for UUID compatibility
- **Database Transactions**: Atomic operations with rollback on failure
- **Error Categorization**: Smart grouping of similar errors
- **Template Support**: Auto-generated template with sample data

#### Session Overflow Prevention
- **Root Cause**: Large datasets (9000+ rows) create massive session payload
- **Solution**: Limit error messages to first 50 occurrences
- **User Experience**: Clear error summary with tips for resolution
- **Performance**: Maintains responsive UI even with large error sets

### Inventory Management Pagination
- Implemented pagination untuk semua tab di halaman inventory management
- **Pagination Style**: Menggunakan pola yang sama dengan halaman departemen untuk konsistensi
- **Items Tab**: Pagination untuk daftar item inventory dengan 10 item per halaman
- **Categories Tab**: Pagination untuk daftar kategori inventory dengan 10 item per halaman
- **Units Tab**: Pagination untuk daftar unit inventory dengan 10 item per halaman
- **Backend Support**: Menggunakan Laravel `paginate(10)` dengan `withQueryString()`
- **Frontend Display**: Menampilkan informasi jumlah data dan navigasi halaman
- **Responsive Design**: Tombol pagination responsive untuk desktop dan mobile

### Multi-Tenant Laboratory System
- Implemented multi-tenant architecture for laboratory management
- **Super Admin Access**: Can select any company/plant for laboratory data
- **Regular User Access**: Data automatically follows user's company/plant
- **Access Control**: Users can only view/edit data from their assigned company/plant
- **UI Adaptation**: Dynamic form fields based on user role
- **Security**: Backend validation prevents unauthorized access to other tenant data

### Laboratory Reference System
- Added support for gender-based and universal laboratory references
- Implemented dynamic reference management in Create/Edit forms
- Added reference display in View page with color-coded badges
- Updated Index page to show reference count
- Enhanced controller with transaction support for data integrity
- Added proper validation for reference data

### Table Header Reordering
- Updated Department table: No., Nama Departemen, Deskripsi, Lokasi, Status, Aksi
- Updated Employee Status table: No., Nama Status, Deskripsi, Lokasi, Status, Aksi
- Updated Shift table: No., Nama Shift, Waktu, Deskripsi, Lokasi, Aksi
- Updated Guarantor table: No., Penjamin, Deskripsi, Lokasi, Aksi

### Outpatient Queue Numbering
- Fixed duplicate entry issues in seeder
- Implemented YYMM-XXXX format for visit numbers
- YY = year of birth, MM = month of birth, XXXX = sequential number per patient

## Known Issues
See [known-bugs.md](known-bugs.md) for current issues and their status.

## Lessons Learned
See [lesson-learned.md](lesson-learned.md) for development insights and best practices.

## Fitur Konsultasi

### Diagnosa

#### Dua Jenis Field Diagnosa
- **Diagnosa Tertulis**: Field textarea untuk menulis diagnosa secara manual
- **Diagnosa Master**: Dropdown untuk memilih dari master data diagnosa
- **Validasi**: Minimal salah satu field harus diisi

#### Struktur Data
```typescript
diagnosis_details: {
  diagnosas_id: string | null,     // ID dari master diagnosa
  diagnosa_name: string,           // Nama diagnosa dari master
  diagnosa_code: string,           // Kode diagnosa dari master
  diagnosa_text: string            // Diagnosa tertulis manual
}[]
```

### Resep Obat - Keamanan Multi-Tenant

#### Masalah yang Diselesaikan
Sebelumnya, super_admin bisa mengakses obat dari company/plant mana saja saat konsultasi. Hal ini tidak sesuai dengan prinsip bahwa resep obat harus sesuai dengan lokasi pasien.

#### Solusi yang Diimplementasikan
**Backend (`InventoryController::search()`)**:
```php
// Check if this is a consultation context
$context = $request->get('context', '');

if ($context === 'consultation') {
    // For consultation, ALL users must use patient's company_id and plant_id
    $companyId = $request->company_id;
    $plantId = $request->plant_id;
    
    // Validate that company_id and plant_id are provided
    if (empty($companyId) || empty($plantId)) {
        return response()->json([]);
    }
} else {
    // For regular inventory management, use existing logic
    $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
    $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;
}
```

**Frontend (`Konsultasi.tsx`)**:
```typescript
// Add context parameter for inventory search to ensure security
if (url.includes('inventory/search')) {
    params.append('context', 'consultation');
}
```

#### Keamanan yang Dicapai
1. **Semua Role Terbatas**: Baik super_admin maupun user biasa hanya bisa mengakses obat sesuai company_id dan plant_id pasien
2. **Konteks Spesifik**: Pembatasan hanya berlaku untuk konsultasi, tidak mengganggu manajemen inventory biasa
3. **Validasi Mandatory**: Jika company_id atau plant_id tidak tersedia, sistem mengembalikan array kosong

#### Skenario Penggunaan
- **Super Admin konsultasi Pasien Company A, Plant X**: Hanya bisa memilih obat dari Company A, Plant X
- **User Biasa konsultasi Pasien Company B, Plant Y**: Hanya bisa memilih obat dari Company B, Plant Y
- **Super Admin di halaman Inventory Management**: Tetap bisa mengakses inventory dari company/plant mana saja

#### ⚠️ **Catatan Penting: Item dengan Nama Sama**
**Sistem sudah bekerja dengan benar!** Jika Anda melihat item dengan nama yang sama (seperti "Microscope Slides") muncul dalam hasil pencarian konsultasi, itu adalah item yang **memang berasal dari company dan plant yang sama** dengan pasien.

**Contoh Skenario:**
- Database memiliki 5 item "Microscope Slides" di berbagai company/plant:
  1. RS Sehat Sejahtera - Gedung Utama - Poliklinik
  2. **Klinik Medika Prima - Cabang Utama - Umum** ✅
  3. Klinik Medika Prima - Cabang VIP - Eksekutif  
  4. RS Sehat Sejahtera - Gedung B - Laboratorium
  5. RS Medicare Utama - Gedung A - Rawat Jalan

- Ketika konsultasi pasien dari "Klinik Medika Prima - Cabang Utama - Umum"
- Sistem hanya menampilkan item #2 (yang sesuai dengan lokasi pasien)
- Item lainnya difilter dan tidak muncul

**Verifikasi SQL Query:**
```sql
SELECT * FROM inventory_items 
WHERE is_active = true 
AND stock > 0 
AND name LIKE '%search_term%' 
AND company_id = 'patient_company_id'
AND plant_id = 'patient_plant_id'
```

### Validasi Form Konsultasi

#### Validasi Diagnosa
```php
// Minimal salah satu field harus diisi
if (empty($diag['diagnosas_id']) && empty($diag['diagnosa_text'])) {
    throw new \Exception('Setiap diagnosa harus memiliki minimal diagnosa tertulis atau pilihan diagnosa dari master data.');
}
```

#### Validasi Resep Obat
- `inventory_item_id`: Required, harus ada di inventory items
- `quantity`: Required, integer, minimal 1
- `medication_rules`: Optional, string
- `description`: Optional, string

### UI/UX Improvements

#### Diagnosa Section
- Setiap diagnosa ditampilkan dalam kotak terpisah dengan border
- Field diagnosa tertulis di bagian atas untuk kemudahan input
- Dropdown master data di bagian bawah
- Tombol hapus untuk menghapus seluruh diagnosa
- Placeholder text yang jelas untuk membedakan kedua field

#### Resep Obat Section
- Dropdown obat menampilkan nama obat dan stok tersedia
- Filtering otomatis berdasarkan company_id dan plant_id pasien
- Konteks keamanan yang memastikan data integrity

## Perubahan Database 

### Penghapusan Tabel GuarantorHistory
- **Tanggal:** 2025-01-04
- **Perubahan:** Menghapus tabel `guarantors_history` karena tidak digunakan
- **File yang terkait:**
  - Migration: `database/migrations/2025_07_04_043113_drop_guarantors_history_table.php`
  - Model: `app/Models/GuarantorHistory.php` (dihapus)
  - Relasi di `PatientToGuarantor.php` juga dibersihkan
- **Alasan:** Simplifikasi database dan menghilangkan complexity yang tidak diperlukan

### Modifikasi Tabel Medical Records
- **Tanggal:** 2025-01-04
- **Perubahan:** Mengubah kolom `guarantor_id` menjadi `guarantor` dengan relasi ke `patient_to_guarantors`
- **File yang terkait:**
  - Migration: `database/migrations/2025_06_27_070552_create_medical_records_table.php`
  - Model: `app/Models/MedicalRecord.php`
  - Controller: `app/Http/Controllers/Pelayanan/KonsultasiController.php`
  - Frontend: `resources/js/pages/Pelayanan/Konsultasi.tsx`
- **Logic Auto-load Guarantor:**
  - Konsultasi pertama: Load dari `patient_to_guarantors` berdasarkan `patient_records_id`
  - Konsultasi kedua dan seterusnya: Load guarantor terakhir dari `medical_records`
- **Endpoint baru:** `patient-guarantors/search` untuk mencari guarantor berdasarkan patient_id

### Kombinasi Layout pada Detail Pasien

#### Overview Tab - Card Grid Layout
```tsx
<TabsContent value="overview">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Info Cepat Card */}
    {/* Perusahaan Card */}
    {/* Status Medis Card */}
  </div>
</TabsContent>
```

**Fitur:**
- **3 Card Grid** untuk informasi ringkas
- **Responsive Design** (1 kolom mobile, 2 kolom tablet, 3 kolom desktop)
- **Color-coded Icons** untuk setiap section
- **Quick Stats** seperti usia otomatis

#### Data Pribadi Tab - Accordion Layout
```tsx
<TabsContent value="personal">
  <Collapsible>
    {/* Informasi Dasar Accordion */}
    {/* Kontak Darurat Accordion */}
  </Collapsible>
</TabsContent>
```

**Fitur:**
- **Collapsible Sections** untuk menghemat ruang
- **Independent Toggle** untuk setiap section
- **Card Content** dalam accordion untuk konsistensi
- **Grid Layout** untuk data yang terstruktur

#### Perusahaan Tab - Simple Card Layout
```tsx
<TabsContent value="company">
  <Card>
    {/* Data Perusahaan dalam satu card */}
  </Card>
</TabsContent>
```

**Fitur:**
- **Single Card** untuk data yang sederhana
- **Grid Layout** untuk field yang berpasangan
- **Clean Design** tanpa accordion

#### Medis Tab - Accordion + Table Layout
```tsx
<TabsContent value="medical">
  <Collapsible>
    {/* Riwayat Medis Accordion */}
    {/* Data Penjamin Accordion dengan Table */}
  </Collapsible>
</TabsContent>
```

**Fitur:**
- **Accordion** untuk riwayat medis yang panjang
- **Table Layout** untuk data penjamin yang terstruktur
- **Scrollable Content** untuk text yang panjang
- **Badge System** untuk status khusus

### Keunggulan Kombinasi Layout

#### 1. **User Experience (UX)**
- **Progressive Disclosure**: Informasi ditampilkan sesuai kebutuhan
- **Reduced Cognitive Load**: Tidak semua informasi ditampilkan sekaligus
- **Intuitive Navigation**: Tab untuk kategori utama, accordion untuk detail

#### 2. **Responsive Design**
- **Mobile-First**: Layout menyesuaikan ukuran layar
- **Touch-Friendly**: Accordion dan tab mudah digunakan di mobile
- **Flexible Grid**: Card grid menyesuaikan jumlah kolom

#### 3. **Performance**
- **Lazy Loading**: Content accordion hanya load saat dibuka
- **Efficient Rendering**: Tab content hanya render saat aktif
- **Optimized Layout**: Tidak ada overflow atau scroll yang tidak perlu

#### 4. **Maintainability**
- **Modular Components**: Setiap layout dapat diubah independen
- **Reusable Patterns**: Card, accordion, dan table dapat digunakan di tempat lain
- **Consistent Styling**: Menggunakan design system yang konsisten

### Implementasi Teknis

#### State Management
```tsx
const [activeTab, setActiveTab] = useState('overview');
const [openSections, setOpenSections] = useState({
    personal: true,
    company: true,
    medical: true,
    guarantor: true
});
```

#### Component Structure
```tsx
<Tabs>
  <TabsList> {/* Navigation */}
  <TabsContent value="overview"> {/* Card Grid */}
  <TabsContent value="personal"> {/* Accordion */}
  <TabsContent value="company"> {/* Simple Card */}
  <TabsContent value="medical"> {/* Accordion + Table */}
</Tabs>
```

#### Styling System
- **Tailwind CSS** untuk utility classes
- **Shadcn/ui** untuk component library
- **Consistent Spacing** dengan `space-y-6`, `gap-6`
- **Color Coding** untuk setiap section (blue, green, purple, indigo)

### Best Practices yang Diterapkan

1. **Accessibility**: Proper ARIA labels dan keyboard navigation
2. **Performance**: Conditional rendering dan lazy loading
3. **Responsive**: Mobile-first approach dengan breakpoints
4. **Consistency**: Design system yang konsisten
5. **Usability**: Intuitive navigation dan clear visual hierarchy

### Future Enhancements

1. **Search & Filter**: Pencarian dalam tab content
2. **Export Data**: Export data per tab
3. **Print Layout**: Print-friendly version
4. **Dark Mode**: Toggle dark/light theme
5. **Customization**: User dapat mengatur layout preference

## Fitur Print Resume Medis Rawat Jalan

### Ringkasan
Fitur ini memungkinkan user mencetak resume medis pasien rawat jalan dalam format print-friendly, lengkap dengan identitas pasien, data kunjungan, anamnesa, diagnosa, obat, dan hasil laboratorium.

### Alur Utama
1. User klik tombol "Print Resume Medis" pada halaman rawat jalan (status selesai).
2. Sistem mengarahkan ke route khusus yang menampilkan halaman print resume medis.
3. Data diambil dari berbagai relasi model (OutpatientQueue, MedicalRecord, Prescription, LabRequest, dsb).
4. Halaman otomatis memanggil print browser.

### Struktur Data Resume Medis
- **Header:** Nama RS, plant, alamat, kontak.
- **Identitas Pasien & Kunjungan:**
  - NIK, Nama, Tanggal Lahir (format d-m-Y), Jenis Kelamin, Alamat
  - No. RM, Waktu Kunjungan, Waktu Cetak, Penjamin, No. Penjamin
- **Anamnesa, Riwayat Penyakit, Pemeriksaan Fisik:**
  - Ditampilkan dengan kapitalisasi awal.
- **Diagnosa:**
  - Kode diagnosa & nama, bullet, tanpa penomoran.
- **Obat:**
  - Tabel 4 kolom: Nama Obat, Jumlah, Satuan, Instruksi
  - Satuan diambil dari relasi unit->name pada inventory item.
- **Hasil Laboratorium:**
  - Tabel: Pemeriksaan, Hasil, Nilai Referensi, Satuan, Status
  - Nilai referensi diambil dari relasi references pada LabMaster, dipilih sesuai gender pasien atau universal.

### Catatan Implementasi Penting
- Format tanggal lahir: d-m-Y (tanpa jam)
- Semua field menggunakan fallback '-' jika data kosong
- Nilai referensi lab dan satuan obat harus diambil dari relasi yang benar (references, unit)
- Tampilan print-friendly, proporsional, dan profesional

### Contoh Hasil Print
Lihat file hasil print atau screenshot pada dokumentasi user.

---
