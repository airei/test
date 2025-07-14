# Fitur Detail Pasien dengan Data Penjamin

## Deskripsi
Halaman detail pasien telah diperbarui untuk menampilkan informasi lengkap pasien termasuk data penjamin (guarantor).

## Fitur yang Ditambahkan

### 1. Data Penjamin
- **Nama Penjamin**: Menampilkan nama penjamin dari tabel `guarantors`
- **Nomor Penjamin**: Menampilkan nomor penjamin dari tabel `patient_to_guarantors`
- **Deskripsi Penjamin**: Menampilkan deskripsi penjamin (opsional)

### 2. Relasi Database
- Model `PatientRecord` memiliki relasi `guarantor()` yang menghubungkan ke `PatientToGuarantor`
- `PatientToGuarantor` memiliki relasi `guarantor()` yang menghubungkan ke `Guarantor`

### 3. Controller Updates
- Method `show()` di `RegistrasiRekamMedisController` ditambahkan eager loading `guarantor.guarantor`
- Data penjamin ter-load otomatis saat mengakses halaman detail

### 4. Frontend Updates
- Interface TypeScript ditambahkan untuk `Guarantor` dan `PatientToGuarantor`
- Card "Data Penjamin" ditambahkan di halaman detail dengan styling yang konsisten
- Icon User dengan warna indigo untuk membedakan dengan card lainnya

## Struktur Data

### Backend (Laravel)
```php
// Model PatientRecord
public function guarantor(): HasOne
{
    return $this->hasOne(PatientToGuarantor::class, 'patient_records_id');
}

// Controller
$patient = PatientRecord::with([
    'company',
    'plant', 
    'department',
    'employeeStatus',
    'guarantor.guarantor', // Eager loading untuk data penjamin
    // ... relasi lainnya
])->findOrFail($id);
```

### Frontend (React/TypeScript)
```typescript
interface Guarantor {
    id: string;
    name: string;
    description?: string;
}

interface PatientToGuarantor {
    id: string;
    guarantor_number: string;
    guarantor: Guarantor;
}

interface PatientRecord {
    // ... field lainnya
    guarantor?: PatientToGuarantor;
}
```

## Tampilan UI
- Card "Data Penjamin" ditampilkan setelah "Data Perusahaan"
- Menggunakan icon User dengan warna indigo
- Layout responsive dengan grid system
- Menampilkan "-" jika data tidak tersedia

## Testing
Command artisan `test:patient-detail` tersedia untuk testing:
```bash
php artisan test:patient-detail [patient_id]
```

## URL Akses
```
/pelayanan/registrasi-rekam-medis/{patient_id}
```

## Catatan
- Data penjamin bersifat opsional, jika tidak ada akan menampilkan "-"
- Relasi menggunakan foreign key `patient_records_id` dan `guarantors_id`
- Deskripsi penjamin hanya ditampilkan jika ada data 