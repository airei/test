# Dokumentasi Database Medicare

Berikut adalah daftar tabel beserta field, tipe data, kunci utama (PK), kunci asing (FK), dan deskripsi singkatnya.

## Daftar Isi
1.  **Tabel Fondasi (Tanpa Dependensi)**
    * `roles`
    * `companies`
    * `password_reset_tokens`
    * `cache` & Tabel Sistem Lainnya

2.  **Tabel Pengguna dan Izin Akses**
    * `users`
    * `permissions`
    * `role_permissions`
    * `sessions`
    * `audit_trails`

3.  **Tabel Master Lainnya (Tergantung Pengguna)**
    * `plants`, `departments`, `shifts`, `employee_statuses`
    * `diagnosa`, `guarantors`
    * `inventory_categories`, `inventory_units`, `lab_masters`

4.  **Tabel Detail Inventaris & Laboratorium**
    * `lab_references`, `inventory_items`, `inventory_stock_movements`

5.  **Tabel Rekam Medis Pasien (Alur Utama)**
    * `patient_records`, `outpatient_visits`, `medical_records`, dan detailnya.

---

## 1. Tabel Fondasi (Tanpa Dependensi)

Tabel-tabel ini adalah fondasi dari sistem, tidak memiliki ketergantungan pada tabel aplikasi lain, dan harus ada terlebih dahulu.

### 1.1. `roles`
Menyimpan peran pengguna. Tabel ini sekarang independen.

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| name | VARCHAR | | | Nama unik peran |
| display_name| VARCHAR | | | Nama tampilan |
| description | TEXT | | | Deskripsi |
| is_active | BOOLEAN | | | Status aktif (default: true) |
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

### 1.2. `companies`
Menyimpan data perusahaan.

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| name | VARCHAR | | | Nama perusahaan |
| address | TEXT | | | Alamat |
| phone | VARCHAR | | | Nomor telepon |
| email | VARCHAR | | | Email |
| is_active | BOOLEAN | | | Status aktif (default: true) |
| created_by | BIGINT | | `users.id` | User pembuat |
| updated_by | BIGINT | | `users.id` | User pengubah|
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

### 1.3. `password_reset_tokens`
Menyimpan token untuk proses reset password.

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| email | VARCHAR PK Email pengguna, sebagai primary key |
| token | VARCHAR | | | Token reset password |
| created_at | TIMESTAMP | | | Waktu pembuatan token (nullable) |

### 1.4. Tabel Sistem (`cache`, `jobs`, dll.)
Tabel-tabel ini digunakan oleh framework untuk fungsionalitas internal seperti caching dan antrian.

* `cache`
* `cache_locks`
* `jobs`
* `job_batches`
* `failed_jobs`

---

## 2. Tabel Pengguna dan Izin Akses

Setelah tabel fondasi ada, kita bisa mendefinisikan pengguna dan hak aksesnya.

### 2.1. `users`
Menyimpan data pengguna sistem.
*Dependensi: `companies`, `roles`, `plants`*

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| company_id| BIGINT | | `companies.id`| Perusahaan |
| plant_id | BIGINT | | `plants.id` | Plant |
| role_id | BIGINT | | `roles.id` | Role |
| name | VARCHAR(30) | | | Nama user |
| email | VARCHAR(30) | | | Email unik |
| email_verified_at| TIMESTAMP | | | Email terverifikasi |
| password | VARCHAR | | | Password |
| is_active | BOOLEAN | | | Status aktif |
| remember_token | VARCHAR | | | Token remember |
| created_by | BIGINT | | `users.id` | User pembuat (self-reference) |
| updated_by | BIGINT | | `users.id` | User pengubah (self-reference) |
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

### 2.2. `permissions`
Menyimpan daftar izin/hak akses dalam sistem.
*Dependensi: `users`*

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| name | VARCHAR | | | Nama unik permission |
| display_name| VARCHAR | | | Nama tampilan |
| description | TEXT | | | Deskripsi |
| module | VARCHAR | | | Modul terkait |
| created_by | BIGINT | | `users.id` | User pembuat |
| updated_by | BIGINT | | `users.id` | User pengubah|
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

### 2.3. `role_permissions`
Tabel pivot untuk relasi antara `roles` dan `permissions`.
*Dependensi: `roles`, `permissions`, `users`*

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| role_id | BIGINT | | `roles.id` | Role |
| permission_id| BIGINT | | `permissions.id`| Permission |
| created_by | BIGINT | | `users.id` | User pembuat |
| updated_by | BIGINT | | `users.id` | User pengubah|
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

### 2.4. `sessions`
Menyimpan data sesi login pengguna.
*Dependensi: `users`*

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | VARCHAR PK ID session (primary key) |
| user_id | BIGINT | | `users.id` | Relasi ke `users` (nullable) |
| ip_address | VARCHAR(45)| | | Alamat IP (nullable) |
| user_agent| TEXT | | | User agent browser (nullable) |
| payload | LONGTEXT | | | Data payload session |
| last_activity| INTEGER | | | Timestamp aktivitas terakhir |

### 2.5. `audit_trails`
Mencatat semua perubahan data pada tabel-tabel penting.
*Dependensi: `users`*

| Field | Tipe Data | PK | FK | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT PK Primary key |
| user_id | BIGINT | | `users.id` | User terkait |
| table_name | VARCHAR | | | Nama tabel yang diaudit |
| record_id | BIGINT | | | ID record terkait |
| action | VARCHAR | | | Aksi (create/update/delete) |
| old_values | JSON | | | Data lama (sebelum diubah) |
| new_values | JSON | | | Data baru (setelah diubah) |
| ip_address | VARCHAR | | | IP user |
| user_agent | VARCHAR | | | User agent |
| created_at | TIMESTAMP | | | Tanggal dibuat |
| updated_at | TIMESTAMP | | | Tanggal diubah |

---

## 3. Tabel Master Lainnya (Tergantung Pengguna)

* `plants`
* `departments`
* `shifts`
* `employee_statuses`
* `diagnosa`
* `guarantors`
* `inventory_categories`
* `inventory_units`
* `lab_masters`

---

## 4. Tabel Detail Inventaris & Laboratorium

* `lab_references`
* `inventory_items`
* `inventory_stock_movements`

---

## 5. Tabel Rekam Medis Pasien (Alur Utama)

* `patient_records`
* `outpatient_visits`
* `medical_records`
* `diagnosis_details`
* `prescriptions`
* `prescription_details`