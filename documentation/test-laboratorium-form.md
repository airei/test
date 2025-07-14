# Test Form Laboratorium - Langkah Debug

## Status Saat Ini ✅

### Yang Sudah Diperbaiki:
1. **Form menggunakan Inertia.js yang benar** (bukan fetch API)
2. **Controller sudah disederhanakan** untuk Inertia
3. **Route sudah terdaftar** dengan benar
4. **Data company dan plant** sudah ada di database
5. **Debug info** ditampilkan di form

## Langkah Test

### 1. Akses Form
- URL: `http://localhost:8000/manajemen/laboratorium/create`
- Pastikan sudah login

### 2. Isi Form
- **Nama Pemeriksaan**: `Test Hemoglobin`
- **Unit**: `g/dL`
- **Harga**: `50000`

### 3. Cek Debug Info
Di bagian bawah form, lihat:
- **Processing**: No (sebelum submit)
- **Errors**: None
- **Route**: `/manajemen/laboratorium`
- **CSRF Token**: `[token]...` (harus ada)

### 4. Submit Form
- Klik tombol "Simpan"
- Lihat console browser (F12 → Console)

### 5. Cek Console Browser
Harus muncul log:
```
Form submitted!
Form data: {name: "Test Hemoglobin", unit: "g/dL", price: "50000", references: [...]}
Sending data to: /manajemen/laboratorium
Data to send: {...}
```

### 6. Cek Laravel Log
Buka file: `storage/logs/laravel.log`
Cari log dengan keyword: `LABORATORIUM STORE`

## Kemungkinan Error & Solusi

### Error 1: "Route not found"
**Gejala**: 404 error
**Solusi**: 
```bash
php artisan route:clear
php artisan config:clear
```

### Error 2: "CSRF token mismatch"
**Gejala**: 419 error
**Solusi**: 
- Pastikan meta tag CSRF ada di `app.blade.php`
- Refresh halaman

### Error 3: "Company atau Plant tidak ditemukan"
**Gejala**: Error di log Laravel
**Solusi**: 
```bash
php artisan db:seed --class=MedicareSeeder
```

### Error 4: "Database error"
**Gejala**: Error di log Laravel
**Solusi**: 
```bash
php artisan migrate:fresh --seed
```

## Expected Success Flow

1. **Form submit** → Console log muncul
2. **Controller receive** → Laravel log: "LABORATORIUM STORE START"
3. **Validation pass** → Laravel log: "Validation passed"
4. **Data saved** → Laravel log: "LabMaster berhasil dibuat"
5. **Redirect** → Ke halaman index dengan pesan sukses

## Debug Commands

### Cek Route
```bash
php artisan route:list --name=laboratorium
```

### Cek Database
```bash
php artisan tinker --execute="echo 'Companies: ' . \App\Models\Company::count() . PHP_EOL; echo 'Plants: ' . \App\Models\Plant::count() . PHP_EOL;"
```

### Cek Log
```bash
tail -f storage/logs/laravel.log
```

## File yang Terlibat

1. **Frontend**: `resources/js/pages/Manajemen/Laboratorium/Create.tsx`
2. **Backend**: `app/Http/Controllers/Manajemen/LaboratoriumController.php`
3. **Route**: `routes/web.php`
4. **Model**: `app/Models/LabMaster.php`, `app/Models/LabReference.php`
5. **View**: `resources/views/app.blade.php`

## Next Steps

Jika form masih error:
1. Berikan screenshot console browser
2. Berikan screenshot debug info di form
3. Berikan log Laravel yang relevan
4. Berikan error message yang muncul 