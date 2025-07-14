# Fitur Multiple Guarantors (Penjamin)

## Deskripsi
Fitur multiple guarantors memungkinkan satu pasien memiliki lebih dari satu penjamin dengan validasi bahwa penjamin yang sama tidak boleh dipilih lebih dari sekali.

## Fitur yang Ditambahkan

### 1. Frontend (React/TypeScript)
- **Halaman Create**: Tombol "Tambah Penjamin" untuk menambah multiple penjamin
- **Halaman Edit**: Tombol "Tambah Penjamin" untuk menambah/edit multiple penjamin
- **Halaman Show**: Menampilkan semua penjamin dalam card terpisah
- **Validasi**: Penjamin yang sama tidak bisa dipilih lebih dari sekali
- **UI/UX**: 
  - Empty state saat belum ada penjamin
  - Card terpisah untuk setiap penjamin
  - Tombol hapus untuk setiap penjamin
  - Indikator "Sudah dipilih" pada dropdown

### 2. Backend (Laravel)
- **Controller**: Method `store()` dan `update()` diubah untuk handle array guarantors
- **Validation**: Validasi array guarantors dengan nested validation
- **Database**: Multiple records di tabel `patient_to_guarantors`
- **Relasi**: Eager loading `guarantor.guarantor` untuk data lengkap

### 3. Database Structure
```sql
-- Tabel patient_to_guarantors (sudah ada)
patient_records_id -> patient_records.id
guarantors_id -> guarantors.id
guarantor_number -> string
```

## Struktur Data

### Frontend Interface
```typescript
interface GuarantorForm {
    id: string;
    guarantor_id: string;
    guarantor_number: string;
    [key: string]: string;
}

interface PatientRecord {
    // ... field lainnya
    guarantors?: GuarantorForm[];
}
```

### Backend Validation
```php
$request->validate([
    // ... field lainnya
    'guarantors' => 'nullable|array',
    'guarantors.*.guarantor_id' => 'nullable|exists:guarantors,id',
    'guarantors.*.guarantor_number' => 'nullable|string|max:100',
]);
```

## Alur Kerja

### 1. Create Pasien
1. User klik "Tambah Penjamin"
2. Form penjamin baru muncul
3. User pilih penjamin dan isi nomor
4. User bisa tambah penjamin lagi atau hapus
5. Saat submit, array guarantors dikirim ke backend
6. Backend create multiple records di `patient_to_guarantors`

### 2. Edit Pasien
1. Data guarantors yang ada di-load dari database
2. User bisa edit, tambah, atau hapus penjamin
3. Saat submit, semua data guarantors lama dihapus
4. Data guarantors baru di-create

### 3. Show Pasien
1. Data guarantors di-load dengan eager loading
2. Ditampilkan dalam card terpisah untuk setiap penjamin
3. Jika tidak ada penjamin, tampilkan empty state

## Validasi

### Frontend
- Penjamin yang sama tidak bisa dipilih lebih dari sekali
- Dropdown menampilkan "(Sudah dipilih)" untuk penjamin yang sudah dipilih
- Validasi required field sebelum submit

### Backend
- Validasi array guarantors
- Validasi setiap guarantor_id harus exists di tabel guarantors
- Validasi guarantor_number max 100 karakter

## Testing

### Command Artisan
```bash
php artisan test:multiple-guarantors [patient_id]
```

### Manual Testing
1. Buka halaman create/edit pasien
2. Klik "Tambah Penjamin"
3. Pilih penjamin dan isi nomor
4. Tambah penjamin kedua
5. Pastikan penjamin pertama tidak bisa dipilih lagi
6. Submit form
7. Cek halaman detail pasien

## URL Testing
- Create: `/pelayanan/registrasi-rekam-medis/create`
- Edit: `/pelayanan/registrasi-rekam-medis/{id}/edit`
- Show: `/pelayanan/registrasi-rekam-medis/{id}`

## Catatan Penting
- Data guarantors lama akan dihapus saat update (replace strategy)
- Penjamin yang sama tidak boleh dipilih lebih dari sekali
- Empty state ditampilkan saat belum ada penjamin
- Relasi menggunakan foreign key `patient_records_id` dan `guarantors_id`
- Eager loading digunakan untuk optimasi query