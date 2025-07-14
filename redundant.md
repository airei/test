# REDUNDANT FILES ANALYSIS

## File-File Redundant yang Ditemukan

### 1. File Debug/Test yang Tidak Perlu
- `test_diagnosa_penjamin.php` - File test manual yang tidak terintegrasi dengan testing framework
- `debug_diagnosis_data.php` - File debug manual yang tidak terintegrasi dengan testing framework
- `test_export.php` - File test manual yang tidak terintegrasi dengan testing framework
- `check_data.php` - File debug manual yang tidak terintegrasi dengan testing framework

### 2. File Helper yang Redundant
- `app/helpers.php` - Berisi helper functions yang duplikat dengan `app/Helpers/CurrencyHelper.php`
- Fungsi `format_currency()` di `helpers.php` duplikat dengan `CurrencyHelper::format()`
- Fungsi `format_currency_without_symbol()` duplikat dengan `CurrencyHelper::formatWithoutSymbol()`
- Fungsi `parse_currency()` duplikat dengan `CurrencyHelper::parse()`

### 3. File Konfigurasi yang Redundant
- `components.json` - Konfigurasi shadcn/ui yang mungkin tidak digunakan secara optimal
- `.prettierrc` dan `.prettierignore` - Konfigurasi formatting yang mungkin konflik dengan ESLint

### 4. File Frontend yang Redundant
- `resources/js/pages/welcome.tsx` (74KB, 792 lines) - File yang sangat besar dan mungkin berisi kode yang tidak digunakan
- Beberapa komponen UI yang mungkin duplikat di `resources/js/components/ui/`

### 5. File Migration yang Redundant
- Beberapa migration file yang mungkin membuat perubahan yang sama atau bertentangan
- `2025_07_04_043113_drop_guarantors_history_table.php` - Migration untuk drop table yang mungkin tidak diperlukan

### 6. File Seeder yang Redundant
- `database/seeders/MedicareSeeder.php` (1293 lines) - File yang sangat besar dan berisi banyak data dummy
- Beberapa data dummy yang mungkin tidak diperlukan untuk production

### 7. File Controller yang Redundant
- `app/Http/Controllers/DashboardController.php` (1015 lines) - Controller yang terlalu besar dan berisi banyak method
- Beberapa method di DashboardController bisa dipisah menjadi service classes

### 8. File Model yang Redundant
- Beberapa model yang mungkin memiliki relationship yang sama atau bertentangan
- Model `DiagnosisDetail` dan `Diagnosa` yang mungkin bisa digabung

### 9. File Route yang Redundant
- Beberapa route yang mungkin tidak digunakan atau duplikat
- Route debug yang tidak diperlukan untuk production

### 10. File Middleware yang Redundant
- `app/Http/Middleware/CheckModule.php` dan `app/Http/Middleware/CheckPermission.php` yang mungkin memiliki logika yang tumpang tindih

## Rekomendasi Penghapusan

### Prioritas Tinggi
1. Hapus file debug/test manual (`test_*.php`, `debug_*.php`, `check_*.php`)
2. Gabungkan helper functions yang duplikat
3. Pisahkan DashboardController menjadi beberapa service classes
4. Optimalkan MedicareSeeder dengan menghapus data dummy yang tidak diperlukan

### Prioritas Menengah
1. Review dan hapus komponen UI yang tidak digunakan
2. Optimalkan file migration yang redundant
3. Review dan hapus route yang tidak digunakan
4. Optimalkan file konfigurasi yang redundant

### Prioritas Rendah
1. Review dan optimalkan file frontend yang besar
2. Review dan optimalkan model relationships
3. Review dan optimalkan middleware yang redundant

## Dampak Penghapusan
- Mengurangi ukuran proyek
- Meningkatkan maintainability
- Mengurangi kompleksitas
- Meningkatkan performa
- Memudahkan debugging 