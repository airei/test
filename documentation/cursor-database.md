# Dokumentasi Database Medicare

## Ringkasan
Dokumentasi ini menjelaskan struktur database sistem Medicare yang menggunakan MySQL dengan UUID sebagai primary key untuk semua tabel.

## Struktur Tabel

### 1. Tabel Authentication & Authorization

#### users
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

#### roles
```sql
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### permissions
```sql
CREATE TABLE permissions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    module VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2. Tabel Master Data

#### companies
```sql
CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### plants
```sql
CREATE TABLE plants (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### diagnosas
```sql
CREATE TABLE diagnosas (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. Tabel Manajemen

#### departments
```sql
CREATE TABLE departments (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### shifts
```sql
CREATE TABLE shifts (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### employee_statuses
```sql
CREATE TABLE employee_statuses (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### guarantors
Tabel untuk menyimpan data penjamin asuransi dengan dukungan multi-tenant.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | - | Primary key |
| company_id | uuid | true | null | Foreign key ke companies.id |
| plant_id | uuid | true | null | Foreign key ke plants.id |
| name | string | false | - | Nama penjamin |
| description | text | true | null | Deskripsi penjamin |
| is_active | boolean | false | true | Status aktif penjamin |
| created_by | uuid | true | null | Foreign key ke users.id (creator) |
| updated_by | uuid | true | null | Foreign key ke users.id (updater) |
| created_at | timestamp | true | null | Timestamp pembuatan |
| updated_at | timestamp | true | null | Timestamp update |

#### Relationships
- `company_id` → `companies.id`
- `plant_id` → `plants.id`
- `created_by` → `users.id`
- `updated_by` → `users.id`

#### Multi-Tenant Support
- ✅ Mendukung multi-tenant berdasarkan company dan plant
- ✅ Super admin dapat mengakses semua data
- ✅ User biasa hanya dapat mengakses data dari company/plant mereka

#### Catatan Migrasi
- Kolom `company_id` dan `plant_id` telah digabungkan ke dalam tabel utama `guarantors`
- File migrasi `2025_06_26_103633_add_company_plant_guarantors.php` telah dihapus
- Struktur tabel sekarang sudah lengkap dengan dukungan multi-tenant

### 4. Tabel Audit Trail

#### audit_trails
```sql
CREATE TABLE audit_trails (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NULL,
    event VARCHAR(50) NOT NULL,
    auditable_type VARCHAR(255) NOT NULL,
    auditable_id CHAR(36) NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    url VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 5. Tabel Sistem

#### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);
```

#### sessions
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    INDEX sessions_user_id_index (user_id),
    INDEX sessions_last_activity_index (last_activity)
);
```

#### cache
```sql
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value LONGTEXT NOT NULL,
    expiration INT NOT NULL,
    INDEX cache_expiration_index (expiration)
);
```

#### cache_locks
```sql
CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL,
    INDEX cache_locks_expiration_index (expiration)
);
```

#### jobs
```sql
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    INDEX jobs_queue_index (queue)
);
```

#### job_batches
```sql
CREATE TABLE job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options MEDIUMTEXT NULL,
    cancelled_at INT NULL,
    created_at INT NOT NULL,
    finished_at INT NULL
);
```

#### failed_jobs
```sql
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel medical_records

Tabel untuk menyimpan data rekam medis pasien saat konsultasi.

#### Struktur Tabel
```sql
CREATE TABLE medical_records (
    id UUID PRIMARY KEY,
    outpatient_visit_id UUID NOT NULL,
    examiner_id UUID NOT NULL,
    shift_id UUID NULL,
    guarantor_id UUID NULL,
    chief_complaint TEXT NULL,
    systolic_bp INTEGER NULL,
    diastolic_bp INTEGER NULL,
    pulse_rate INTEGER NULL,
    resp_rate INTEGER NULL,
    temperature DECIMAL(5,2) NULL,
    oxygen_saturation INTEGER NULL,
    weight DECIMAL(5,2) NULL,
    height DECIMAL(5,2) NULL,
    bmi DECIMAL(5,2) NULL,
    phys_exam TEXT NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Relasi
- `outpatient_visit_id` → `outpatient_queue.id` (Foreign Key, CASCADE DELETE)
- `examiner_id` → `users.id` (Foreign Key, CASCADE DELETE)
- `shift_id` → `shifts.id` (Foreign Key, SET NULL)
- `guarantor_id` → `guarantors.id` (Foreign Key, SET NULL)
- `created_by` → `users.id` (Foreign Key, SET NULL)
- `updated_by` → `users.id` (Foreign Key, SET NULL)

#### Index
- `outpatient_visit_id` (Index)
- `examiner_id` (Index)
- `shift_id` (Index)
- `guarantor_id` (Index)

#### Deskripsi Field
- `id`: Primary key UUID
- `outpatient_visit_id`: ID kunjungan rawat jalan
- `examiner_id`: ID pemeriksa/dokter yang melakukan konsultasi
- `shift_id`: ID shift pemeriksaan
- `guarantor_id`: ID penjamin asuransi
- `chief_complaint`: Keluhan utama pasien
- `systolic_bp`: Tekanan darah sistolik (mmHg)
- `diastolic_bp`: Tekanan darah diastolik (mmHg)
- `pulse_rate`: Denyut nadi (bpm)
- `resp_rate`: Laju respirasi (x/menit)
- `temperature`: Suhu tubuh (°C)
- `oxygen_saturation`: Saturasi oksigen (%)
- `weight`: Berat badan (kg)
- `height`: Tinggi badan (cm)
- `bmi`: Body Mass Index (auto-calculated)
- `phys_exam`: Hasil pemeriksaan fisik
- `created_by`: User yang membuat record
- `updated_by`: User yang terakhir update record

### Tabel outpatient_queue

### Tabel patient_records

Tabel untuk menyimpan data rekam medis pasien dengan dukungan multi-tenant.

#### Struktur Tabel
```sql
CREATE TABLE patient_records (
    id UUID PRIMARY KEY,
    medical_record_number VARCHAR(255) UNIQUE NOT NULL,
    company_id UUID NULL,
    plant_id UUID NULL,
    employee_status_id UUID NULL,
    department_id UUID NULL,
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(16) NULL,
    nip VARCHAR(20) NULL,
    gender ENUM('L', 'P') NOT NULL,
    birth_date DATE NOT NULL,
    blood_type ENUM('A', 'B', 'AB', 'O') NULL,
    blood_rhesus ENUM('+', '-') NULL,
    phone_number VARCHAR(20) NULL,
    address TEXT NULL,
    illness_history TEXT NULL,
    allergy TEXT NULL,
    prolanis_status BOOLEAN DEFAULT FALSE,
    prb_status BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_relations VARCHAR(50) NULL,
    emergency_contact_number VARCHAR(20) NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

#### Relasi
- `company_id` → `companies.id` (Foreign Key, SET NULL)
- `plant_id` → `plants.id` (Foreign Key, SET NULL)
- `employee_status_id` → `employee_statuses.id` (Foreign Key, SET NULL)
- `department_id` → `departments.id` (Foreign Key, SET NULL)
- `created_by` → `users.id` (Foreign Key, SET NULL)
- `updated_by` → `users.id` (Foreign Key, SET NULL)

#### Index
- `company_id, plant_id` (Composite Index)
- `medical_record_number` (Unique Index)
- `nik` (Index)
- `nip` (Index)
- `name` (Index)

#### Deskripsi Field
- `id`: Primary key UUID
- `medical_record_number`: Nomor rekam medis unik (format: RM-XXXXXX)
- `company_id`: ID perusahaan (multi-tenant)
- `plant_id`: ID plant (multi-tenant)
- `employee_status_id`: ID status karyawan
- `department_id`: ID departemen
- `name`: Nama lengkap pasien
- `nik`: Nomor Induk Kependudukan (16 digit)
- `nip`: Nomor Induk Pegawai (20 digit)
- `gender`: Jenis kelamin (L: Laki-laki, P: Perempuan)
- `birth_date`: Tanggal lahir
- `blood_type`: Golongan darah (A, B, AB, O)
- `blood_rhesus`: Rhesus darah (+, -)
- `phone_number`: Nomor telepon
- `address`: Alamat lengkap
- `illness_history`: Riwayat penyakit
- `allergy`: Riwayat alergi
- `prolanis_status`: Status program lanjut usia
- `prb_status`: Status program rujukan berjenjang
- `emergency_contact_name`: Nama kontak darurat
- `emergency_contact_relations`: Hubungan dengan kontak darurat
- `emergency_contact_number`: Nomor kontak darurat
- `created_by`: User yang membuat record
- `updated_by`: User yang terakhir update record

#### Business Rules
- Nomor rekam medis harus unik dan otomatis generate
- NIK dan NIP harus unik jika diisi
- Data pasien dapat diakses berdasarkan company/plant (multi-tenant)
- Semua data pasien harus dapat dilacak (audit trail)

### Tabel inventory_stock_movements

Tabel untuk mencatat semua pergerakan stok inventory (masuk, keluar, penyesuaian, pembuangan).

#### Struktur Tabel
```sql
CREATE TABLE inventory_stock_movements (
    id CHAR(36) PRIMARY KEY,
    item_id CHAR(36) NOT NULL,
    type ENUM('in', 'out', 'adj', 'waste') NOT NULL COMMENT 'in: stock masuk, out: stock keluar, adj: penyesuaian, waste: pembuangan',
    quantity INTEGER NOT NULL,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    notes TEXT NULL,
    reference_type VARCHAR(255) NULL,
    reference_id CHAR(36) NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

#### Relasi
- `item_id` → `inventory_items.id` (Foreign Key, CASCADE DELETE)
- `created_by` → `users.id` (Foreign Key, SET NULL)
- `updated_by` → `users.id` (Foreign Key, SET NULL)

#### Index
- `item_id` (Index)
- `type` (Index)
- `reference_type`, `reference_id` (Composite Index)

#### Deskripsi Field
- `id`: Primary key UUID
- `item_id`: ID item inventory yang dipindahkan
- `type`: Jenis pergerakan stok
  - `in`: Stock masuk (pembelian, retur, dll)
  - `out`: Stock keluar (penjualan, penggunaan, dll)
  - `adj`: Penyesuaian stok (stock opname, koreksi)
  - `waste`: Pembuangan stok (kadaluarsa, rusak)
- `quantity`: Jumlah yang dipindahkan (positif untuk masuk, negatif untuk keluar)
- `stock_before`: Stok sebelum pergerakan
- `stock_after`: Stok setelah pergerakan
- `notes`: Catatan tambahan tentang pergerakan
- `reference_type`: Tipe referensi (misal: 'purchase', 'sale', 'adjustment')
- `reference_id`: ID referensi (misal: ID purchase order, sale order)
- `created_by`: User yang membuat record
- `updated_by`: User yang terakhir update record

#### Business Rules
- Setiap pergerakan stok harus mencatat stok sebelum dan sesudah
- Stok setelah = Stok sebelum + Quantity (untuk masuk) atau - Quantity (untuk keluar)
- Semua pergerakan stok harus dapat dilacak (audit trail)
- Reference_type dan reference_id untuk menghubungkan dengan dokumen sumber

## Relasi Antar Tabel

### Relasi Many-to-Many
- **roles** ↔ **permissions** (melalui role_permissions)
- **users** ↔ **roles** (melalui user_roles - jika ada)

### Relasi One-to-Many
- **companies** → **plants**
- **users** → **audit_trails** (created_by, updated_by)
- **users** → **roles** (created_by, updated_by)
- **users** → **permissions** (created_by, updated_by)
- **users** → **companies** (created_by, updated_by)
- **users** → **plants** (created_by, updated_by)
- **users** → **diagnosas** (created_by, updated_by)
- **users** → **departments** (created_by, updated_by)
- **users** → **shifts** (created_by, updated_by)
- **users** → **employee_statuses** (created_by, updated_by)
- **users** → **guarantors** (created_by, updated_by)
- **inventory_items** → **inventory_stock_movements** (item_id)
- **users** → **inventory_stock_movements** (created_by, updated_by)
- **companies** → **patient_records** (company_id)
- **plants** → **patient_records** (plant_id)
- **employee_statuses** → **patient_records** (employee_status_id)
- **departments** → **patient_records** (department_id)
- **users** → **patient_records** (created_by, updated_by)
- **patient_records** → **outpatient_queue** (patient_record_id)
- **outpatient_queue** → **medical_records** (outpatient_visit_id)
- **users** → **medical_records** (examiner_id, created_by, updated_by)
- **shifts** → **medical_records** (shift_id)
- **guarantors** → **medical_records** (guarantor_id)

## Indexing Strategy

### Primary Keys
- Semua tabel menggunakan UUID (CHAR(36)) sebagai primary key
- Composite primary key untuk role_permissions (role_id, permission_id)

### Unique Indexes
- users.email
- roles.name
- permissions.name
- companies.code
- plants.code
- diagnosas.code
- departments.code
- shifts.name
- employee_statuses.name
- guarantors.code

### Foreign Key Indexes
- Semua foreign key otomatis ter-index
- created_by, updated_by di semua tabel

### Performance Indexes
- audit_trails.user_id
- audit_trails.auditable_type, auditable_id
- sessions.user_id, last_activity
- jobs.queue, available_at
- cache.expiration
- cache_locks.expiration

## Data Integrity

### Constraints
- **NOT NULL**: Semua field wajib diisi kecuali yang nullable
- **UNIQUE**: Email, kode, nama yang harus unik
- **FOREIGN KEY**: Semua relasi dilindungi dengan foreign key constraint
- **CHECK**: Validasi data di level application

### Triggers
- UUID generation otomatis saat insert
- Timestamp otomatis (created_at, updated_at)
- Audit trail otomatis untuk perubahan data

## Backup & Recovery

### Backup Strategy
- Full backup harian
- Incremental backup setiap jam
- Backup sebelum migration
- Backup sebelum deployment

### Recovery Procedures
- Restore dari full backup
- Apply incremental backup
- Verify data integrity
- Test aplikasi

## Monitoring

### Performance Monitoring
- Query execution time
- Index usage statistics
- Table size monitoring
- Connection pool monitoring

### Health Checks
- Database connectivity
- Foreign key integrity
- Index fragmentation
- Disk space usage

## Maintenance

### Regular Maintenance
- Index optimization
- Table optimization
- Statistics update
- Log cleanup

### Migration Management
- Version control untuk schema
- Rollback capability
- Data migration scripts
- Testing di staging environment

## Perubahan Database Terbaru

### 1. Perubahan Tabel `diagnosis_details`
- **Changed**: `diagnosa_code` (string) → `diagnosas_id` (UUID FK)
- **Removed**: `diagnosa_name` field
- **Added**: Foreign key constraint ke tabel `diagnosas`

### 2. Tabel Baru `patient_to_guarantors`
- **Purpose**: Menghubungkan pasien dengan penjamin
- **Fields**:
  - `id` (UUID, Primary Key)
  - `patient_records_id` (UUID, FK ke `patient_records`)
  - `guarantors_id` (UUID, FK ke `guarantors`)
  - `guarantor_number` (string, nullable)
  - `created_by` (UUID, FK ke `users`)
  - `updated_by` (UUID, FK ke `users`)
  - `timestamps`

### 3. Perubahan UI: Halaman Create & Edit Patient Record
- **Added**: Field "Penjamin" (dropdown)
- **Added**: Field "Nomor Penjamin" (text input)
- **Location**: Card "Data Penjamin" dengan icon Shield
- **Functionality**: 
  - Dropdown memuat semua penjamin yang aktif
  - Input nomor penjamin untuk menyimpan nomor kartu/ID penjamin
  - Data disimpan ke tabel `patient_to_guarantors`

### 4. Perubahan Controller `RegistrasiRekamMedisController`
- **Added**: Import model `Guarantor` dan `PatientToGuarantor`
- **Modified**: Method `create()` - tambah data guarantors
- **Modified**: Method `edit()` - tambah data guarantors dan existing guarantor
- **Modified**: Method `store()` - tambah logic create guarantor relation
- **Modified**: Method `update()` - tambah logic update/delete guarantor relation
- **Added**: Validation untuk `guarantor_id` dan `guarantor_number`

### 5. Implementasi Multi-Tenant untuk Halaman Create & Edit Patient

#### **Multi-Tenant Dropdown Behavior**:

**User Biasa**:
- Dropdown departemen, status karyawan, dan penjamin **otomatis ter-filter** berdasarkan `company_id` dan `plant_id` user yang login
- User tidak perlu memilih company/plant karena sudah ditentukan dari profil user
- Data langsung tersedia saat halaman dimuat

**Super Admin**:
- **Wajib mengisi field company dan plant terlebih dahulu**
- Dropdown departemen, status karyawan, dan penjamin akan **disabled** sampai company & plant dipilih
- Setelah company & plant dipilih, sistem akan **fetch data dinamis** melalui API
- Dropdown akan menampilkan loading state saat fetch data
- Field dependent akan di-reset ketika company/plant berubah

#### **API Endpoint untuk Dynamic Loading**:
```php
GET /pelayanan/registrasi-rekam-medis/dropdown-data
Parameters: company_id, plant_id
Response: {
    departments: [...],
    employeeStatuses: [...], 
    guarantors: [...]
}
```

#### **Frontend Implementation**:
- **Dynamic State Management**: `dynamicDepartments`, `dynamicEmployeeStatuses`, `dynamicGuarantors`
- **Loading State**: `isLoadingDropdowns` untuk menunjukkan loading
- **Conditional Disabled**: Dropdown disabled berdasarkan kondisi super admin
- **Auto Reset**: Field dependent di-reset ketika company/plant berubah
- **Fetch on Change**: `useEffect` untuk fetch data ketika company/plant berubah

#### **Controller Logic**:
```php
// Create Method
if ($isSuperAdmin) {
    // Super Admin: Semua data companies dan plants tersedia
    $plants = Plant::where('is_active', true)->get();
    $departments = collect();
    $employeeStatuses = collect();  
    $guarantors = collect();
} else {
    // User Biasa: Data ter-filter berdasarkan company_id dan plant_id user
    $plants = Plant::where('company_id', $user->company_id)->get();
    $departments = Department::where('company_id', $user->company_id)
        ->where('plant_id', $user->plant_id)->get();
    $employeeStatuses = EmployeeStatus::where('company_id', $user->company_id)
        ->where('plant_id', $user->plant_id)->get();
    $guarantors = Guarantor::where('company_id', $user->company_id)
        ->where('plant_id', $user->plant_id)->get();
}
```

#### **Plant Filtering Enhancement**:
- **Fixed**: Plant dropdown sekarang menampilkan hanya plants yang berafiliasi dengan company yang dipilih
- **Added**: API endpoint `GET /pelayanan/registrasi-rekam-medis/plants-by-company` untuk dynamic plant loading
- **Enhanced**: Frontend memiliki logic untuk fetch plants berdasarkan company selection
- **Security**: Plant filtering diterapkan untuk user biasa berdasarkan company mereka

#### **Security Features**:
- API endpoint hanya bisa diakses super admin
- Validation company_id dan plant_id di server
- Multi-tenant filtering tetap diterapkan
- Audit trail untuk semua operasi

## Perubahan Model

### DiagnosisDetail Model
- **Updated**: Fillable fields menggunakan `diagnosas_id` alih-alih `diagnosa_id`
- **Updated**: Relasi `diagnosa()` menggunakan foreign key `diagnosas_id`

### Model Baru: PatientToGuarantor
- **Relasi**: belongsTo PatientRecord, belongsTo Guarantor

## Perubahan Controller

### KonsultasiController
- **Updated**: Validation menggunakan `diagnosas_id` field
- **Updated**: DiagnosisDetail creation menggunakan `diagnosas_id`

## Perubahan Frontend

### Konsultasi Page
- **Updated**: Form state menggunakan `diagnosas_id` field
- **Updated**: Diagnosis handling functions menggunakan `diagnosas_id`

### Tabel Laboratorium

#### lab_exam_details
Tabel untuk menyimpan detail pemeriksaan laboratorium termasuk informasi pemeriksa, penjamin, dan shift.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | false | - | Primary key |
| lab_queue_id | uuid | false | - | Foreign key ke lab_queue.id |
| examiner_id | uuid | false | - | Foreign key ke users.id (pemeriksa) |
| guarantor_id | uuid | false | - | Foreign key ke guarantors.id |
| shift_id | uuid | false | - | Foreign key ke shifts.id |
| created_by | uuid | false | - | Foreign key ke users.id (creator) |
| updated_by | uuid | true | null | Foreign key ke users.id (updater) |
| created_at | timestamp | true | null | Timestamp pembuatan |
| updated_at | timestamp | true | null | Timestamp update |

**Foreign Key Constraints:**
- `lab_queue_id` → `lab_queue.id` (CASCADE DELETE)
- `examiner_id` → `users.id` (RESTRICT DELETE)
- `guarantor_id` → `guarantors.id` (RESTRICT DELETE)
- `shift_id` → `shifts.id` (RESTRICT DELETE)
- `created_by` → `users.id` (RESTRICT DELETE)
- `updated_by` → `users.id` (RESTRICT DELETE)

**Indexes:**
- Primary key: `id`
- Foreign key indexes: `lab_queue_id`, `examiner_id`, `guarantor_id`, `shift_id`, `created_by`, `updated_by`

**Relasi:**
- `LabExamDetail` belongsTo `LabQueue`
- `LabExamDetail` belongsTo `User` (examiner)
- `LabExamDetail` belongsTo `Guarantor`
- `LabExamDetail` belongsTo `Shift`
- `LabExamDetail` belongsTo `User` (createdBy)
- `LabExamDetail` belongsTo `User` (updatedBy)
- `LabQueue` hasOne `LabExamDetail`

---

**Dokumentasi ini akan diperbarui sesuai dengan perubahan struktur database.**
