# Troubleshooting Laboratorium Create Form

## Masalah: Form tidak tersubmit ke database

### 1. Debug Steps

#### A. Cek Browser Console
1. Buka Developer Tools (F12)
2. Buka tab Console
3. Isi form dan klik submit
4. Lihat log yang muncul:
   - "Form submitted!"
   - "Form data: {...}"
   - "Test data yang akan dikirim: {...}"
   - "Response status: ..."
   - "Response data: ..."

#### B. Cek Laravel Log
1. Buka file: `storage/logs/laravel.log`
2. Cari log dengan keyword: "LABORATORIUM STORE"
3. Lihat apakah ada error atau success message

#### C. Cek Route
1. Pastikan route sudah terdaftar:
   ```bash
   php artisan route:list | grep laboratorium
   ```

#### D. Cek Database
1. Pastikan tabel `lab_masters` dan `lab_references` sudah ada
2. Pastikan ada data company dan plant

### 2. Kemungkinan Penyebab

#### A. Route tidak terdaftar
- **Gejala**: 404 error saat submit
- **Solusi**: Pastikan route sudah didefinisikan di `routes/web.php`

#### B. CSRF Token tidak valid
- **Gejala**: 419 error saat submit
- **Solusi**: Pastikan meta tag CSRF ada di `app.blade.php`

#### C. Database error
- **Gejala**: Error di log Laravel
- **Solusi**: Cek struktur tabel dan foreign key

#### D. Validation error
- **Gejala**: Data tidak masuk ke database
- **Solusi**: Cek validasi di controller

### 3. Test Manual

#### A. Test dengan Postman/Insomnia
1. URL: `POST /manajemen/laboratorium`
2. Headers:
   ```
   Content-Type: application/json
   X-CSRF-TOKEN: [token dari meta tag]
   ```
3. Body:
   ```json
   {
     "name": "Test Lab",
     "unit": "mg/dL",
     "price": 50000,
     "references": [
       {
         "type": "universal",
         "reference": "10-50 mg/dL"
       }
     ]
   }
   ```

#### B. Test dengan Tinker
```php
php artisan tinker

// Test create lab master
$labMaster = \App\Models\LabMaster::create([
    'company_id' => \App\Models\Company::first()->id,
    'plant_id' => \App\Models\Plant::first()->id,
    'name' => 'Test Lab',
    'unit' => 'mg/dL',
    'price' => 50000,
    'is_active' => true,
    'created_by' => \Auth::id(),
]);

// Test create reference
\App\Models\LabReference::create([
    'lab_master_id' => $labMaster->id,
    'reference_type' => 'universal',
    'reference' => '10-50 mg/dL',
    'created_by' => \Auth::id(),
]);
```

### 4. Solusi Umum

#### A. Clear Cache
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

#### B. Restart Server
```bash
php artisan serve
```

#### C. Check Permissions
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

### 5. Debug Code

#### A. Tambah logging di controller
```php
\Log::info('Request data:', $request->all());
\Log::info('User:', Auth::user());
\Log::info('Company:', Company::first());
\Log::info('Plant:', Plant::first());
```

#### B. Tambah console.log di frontend
```javascript
console.log('Form data:', formData);
console.log('CSRF Token:', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'));
console.log('Route:', route('laboratorium.store'));
```

### 6. Checklist

- [ ] Route terdaftar di `routes/web.php`
- [ ] Controller ada dan benar
- [ ] Model fillable fields sudah benar
- [ ] Migration sudah dijalankan
- [ ] Ada data company dan plant
- [ ] CSRF token tersedia
- [ ] User sudah login
- [ ] Database connection normal
- [ ] Log Laravel bisa diakses

### 7. Next Steps

Jika semua checklist sudah benar tapi masih error:

1. Cek error di browser console
2. Cek error di Laravel log
3. Test dengan Postman
4. Test dengan Tinker
5. Restart server dan clear cache

### 8. Contact

Jika masih bermasalah, berikan informasi:
- Error message dari console browser
- Error message dari Laravel log
- Screenshot form yang diisi
- Versi Laravel dan PHP 