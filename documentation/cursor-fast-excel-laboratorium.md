# Fast Excel Implementation untuk Laboratorium

## Perubahan yang Dilakukan

### 1. Export Laboratorium (`app/Exports/LaboratoriumExport.php`)

**Implementasi Fast Excel:**
- Class sederhana tanpa interface
- Method `export()` yang langsung mengembalikan response download
- Mapping data dengan referensi berdasarkan tipe (universal, male, female)
- Format harga dengan pemisah ribuan

**Kolom Export:**
- No
- Nama Pemeriksaan
- Satuan
- Harga (diformat dengan pemisah ribuan)
- Perusahaan
- Plant
- Referensi Universal
- Referensi Pria
- Referensi Wanita
- Status
- Dibuat Oleh
- Tanggal Dibuat

### 2. Import Laboratorium (`app/Imports/LaboratoriumImport.php`)

**Implementasi Fast Excel:**
- Class sederhana tanpa interface
- Method `import()` yang memproses file baris per baris
- Validasi menggunakan Laravel Validator
- Pembuatan referensi berdasarkan tipe yang diisi

**Validasi Import:**
- `nama_pemeriksaan`: required, string, max 255 karakter
- `satuan`: required, string, max 50 karakter
- `harga`: required, numeric, min 0
- `referensi_universal`: nullable, string, max 255 karakter
- `referensi_pria`: nullable, string, max 255 karakter
- `referensi_wanita`: nullable, string, max 255 karakter

**Logika Import:**
- Skip baris kosong
- Validasi data per baris
- Cek duplikasi nama pemeriksaan
- Set company_id dan plant_id berdasarkan user (multi-tenant)
- Buat LabMaster dan LabReference dalam satu transaksi

### 3. Controller (`app/Http/Controllers/Manajemen/LaboratoriumController.php`)

**Method Export:**
```php
public function export()
{
    try {
        $export = new LaboratoriumExport();
        return $export->export();
    } catch (\Exception $e) {
        return redirect()->route('laboratorium.index')
            ->with('error', 'Gagal mengexport data: ' . $e->getMessage());
    }
}
```

**Method Import:**
```php
public function import(Request $request)
{
    try {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:2048',
        ]);

        $import = new LaboratoriumImport();
        $result = $import->import($request->file('file'));

        $imported = $result['imported'];
        $errors = $result['errors'];

        $message = "Berhasil mengimpor {$imported} pemeriksaan laboratorium.";
        if (!empty($errors)) {
            $message .= " Terdapat " . count($errors) . " error.";
        }

        return redirect()->route('laboratorium.index')
            ->with('success', $message)
            ->with('import_errors', $errors);

    } catch (\Exception $e) {
        return redirect()->route('laboratorium.index')
            ->with('error', 'Gagal mengimpor file: ' . $e->getMessage());
    }
}
```

### 4. Routes

**Route yang Ditambahkan:**
```php
Route::get('laboratorium/export', [LaboratoriumController::class, 'export'])->name('laboratorium.export');
Route::get('laboratorium/import', [LaboratoriumController::class, 'showImport'])->name('laboratorium.import');
Route::post('laboratorium/import', [LaboratoriumController::class, 'import'])->name('laboratorium.import.store');
```

### 5. Frontend

**Halaman Import (`resources/js/pages/Manajemen/Laboratorium/Import.tsx`):**
- Form upload file Excel
- Informasi format file dan ketentuan
- Tombol download template
- Error handling dan display

**Halaman Index (Update):**
- Tombol Export Excel (hijau)
- Tombol Import Excel (biru)
- Permission-based visibility

## Format File Excel

### Export
File yang dihasilkan memiliki kolom:
- No
- Nama Pemeriksaan
- Satuan
- Harga (diformat)
- Perusahaan
- Plant
- Referensi Universal
- Referensi Pria
- Referensi Wanita
- Status
- Dibuat Oleh
- Tanggal Dibuat

### Import
File yang diimport harus memiliki kolom:
- nama_pemeriksaan (wajib)
- satuan (wajib)
- harga (wajib)
- referensi_universal (opsional)
- referensi_pria (opsional)
- referensi_wanita (opsional)

## Multi-Tenant Support

**Export:**
- Super admin: melihat semua data
- User biasa: hanya data company dan plant mereka

**Import:**
- Super admin: company_id dan plant_id null (bisa diisi manual)
- User biasa: otomatis set ke company_id dan plant_id user

## Validasi dan Error Handling

**Validasi Import:**
- Nama pemeriksaan wajib dan unik
- Satuan wajib (max 50 karakter)
- Harga wajib dan harus angka positif
- Minimal satu referensi harus diisi
- Baris kosong dilewati

**Error Handling:**
- Detail error per baris
- Log error untuk debugging
- User-friendly error messages
- Graceful handling untuk file corrupt

## Testing

Untuk test implementasi:

1. **Export**: 
   - Klik tombol "Export Excel" di halaman Index Laboratorium
   - File akan didownload dengan format yang sesuai

2. **Import**: 
   - Download template dari halaman Import
   - Isi data sesuai format (nama_pemeriksaan, satuan, harga wajib)
   - Upload file di halaman Import
   - Cek hasil import dan error jika ada

## Dependencies

Fast Excel sudah terinstall di `composer.json`:
```json
"rap2hpoutre/fast-excel": "^5.6"
```

## Catatan

- Implementasi ini mendukung multi-tenant (company/plant)
- Referensi laboratorium dibuat otomatis berdasarkan data Excel
- Error handling yang detail untuk memudahkan debugging
- Format harga otomatis dengan pemisah ribuan
- Permission-based access untuk export dan import 