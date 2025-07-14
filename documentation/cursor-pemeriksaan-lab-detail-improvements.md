# Perbaikan Halaman Detail Pemeriksaan Lab

## Ringkasan Perubahan

Implementasi fitur tambahan pada halaman detail pemeriksaan lab untuk menambahkan:
1. **Pemeriksa** di main section
2. **Dropdown Shift** di sidebar
3. **Dropdown Penjamin** di sidebar
4. **Penyimpanan data** ke tabel `lab_exam_details`

## Perubahan Backend

### 1. Controller (`PemeriksaanLabController.php`)

#### Method `show()`
- Menambahkan relasi `labExamDetail.examiner`, `labExamDetail.shift`, `labExamDetail.guarantor`
- Menambahkan data examiner, shift, dan guarantor ke response frontend

#### Method `store()`
- Menambahkan validasi untuk `examiner_id`, `shift_id`, `guarantor_id`
- Menambahkan logika untuk menyimpan/update data ke tabel `lab_exam_details`
- Data disimpan sebelum menyimpan hasil pemeriksaan lab

### 2. Model (`LabExamDetail.php`)
- Model sudah ada dengan relasi ke:
  - `LabQueue` (belongsTo)
  - `User` sebagai examiner (belongsTo)
  - `Shift` (belongsTo)
  - `Guarantor` (belongsTo)

### 3. Migration (`2025_07_06_075200_create_lab_exam_details_table.php`)
- Tabel sudah ada dengan struktur:
  - `id` (uuid, primary key)
  - `lab_queue_id` (foreign key ke lab_queue)
  - `examiner_id` (foreign key ke users)
  - `guarantor_id` (foreign key ke guarantors)
  - `shift_id` (foreign key ke shifts)
  - `created_by`, `updated_by` (foreign key ke users)
  - `created_at`, `updated_at`

## Perubahan Frontend

### 1. Halaman Detail (`PemeriksaanLabDetail.tsx`)

#### Import Tambahan
- `useForm` dari `@inertiajs/react`
- `AsyncSelect`, `SelectOption` dari `@/components/ui/async-select`
- `InputError` dari `@/components/input-error`
- `route` dari `ziggy-js`

#### Interface Props
- Menambahkan `labExamDetail` dengan struktur data examiner, shift, dan guarantor

#### State Management
- Menambahkan form state untuk examiner, shift, dan guarantor
- Menambahkan fungsi debounce dan loadOptions untuk async select
- Menambahkan fungsi fetch untuk users, shifts, dan guarantors

#### UI Components

##### Sidebar
- **Dropdown Shift**: AsyncSelect dengan validasi required
- **Dropdown Penjamin**: AsyncSelect dengan validasi required
- Kedua dropdown ditempatkan di sidebar setelah informasi pemeriksaan

##### Main Section
- **Pemeriksa**: AsyncSelect dengan validasi required
- Ditempatkan di main section sebelum form pemeriksaan lab

#### Validasi
- Menambahkan validasi client-side untuk examiner, shift, dan guarantor
- Menampilkan error message jika field required tidak diisi

#### Form Submission
- Menambahkan data examiner, shift, dan guarantor ke payload saat submit
- Data akan disimpan ke tabel `lab_exam_details`

## Fitur yang Ditambahkan

### 1. Pemeriksa (Examiner)
- Dropdown untuk memilih pemeriksa dari daftar users
- Validasi required
- Data disimpan ke kolom `examiner_id`

### 2. Shift
- Dropdown untuk memilih shift
- Validasi required
- Data disimpan ke kolom `shift_id`

### 3. Penjamin (Guarantor)
- Dropdown untuk memilih penjamin
- Validasi required
- Data disimpan ke kolom `guarantor_id`

## Konsistensi dengan Halaman Konsultasi

Implementasi mengikuti pola yang sama dengan halaman konsultasi:
- Struktur sidebar dan main section
- Penggunaan AsyncSelect untuk dropdown
- Validasi dan error handling
- Penyimpanan data ke database

## Database Schema

```sql
CREATE TABLE lab_exam_details (
    id UUID PRIMARY KEY,
    lab_queue_id UUID NOT NULL,
    examiner_id UUID NOT NULL,
    guarantor_id UUID NOT NULL,
    shift_id UUID NOT NULL,
    created_by UUID NOT NULL,
    updated_by UUID NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (lab_queue_id) REFERENCES lab_queue(id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (guarantor_id) REFERENCES guarantors(id) ON DELETE RESTRICT,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

## Testing

Untuk testing fitur ini:
1. Akses halaman detail pemeriksaan lab
2. Pilih examiner, shift, dan guarantor
3. Isi data pemeriksaan lab
4. Submit form
5. Verifikasi data tersimpan di tabel `lab_exam_details`

## Catatan

- Semua field (examiner, shift, guarantor) bersifat required
- Data akan disimpan/update setiap kali form disubmit
- Relasi dengan tabel lain menggunakan foreign key constraints
- Audit trail diimplementasikan dengan `created_by` dan `updated_by` 