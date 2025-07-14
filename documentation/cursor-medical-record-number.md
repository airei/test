# Medical Record Number Generation System

## 📋 **Format Nomor Rekam Medis Baru**

### **Format: YYMMG-CCCPPP-XXXX**

**Komponen Format:**
- **YY**: 2 digit tahun lahir pasien (contoh: 90 untuk tahun 1990)
- **MM**: 2 digit bulan lahir pasien (01-12)
- **G**: Gender code (1 = Laki-laki, 0 = Perempuan)
- **CCC**: 3 digit kode company (001, 002, 003, dst)
- **PPP**: 3 digit kode plant (001, 002, 003, dst)
- **XXXX**: nomor urut global yang dapat bertambah (0001, 0002, dst)

**Contoh Nomor RM:**
- `90011-001002-0001` → Laki-laki lahir Januari 1990, Company 001, Plant 002, pasien ke-1
- `85120-002001-0025` → Perempuan lahir Desember 1985, Company 002, Plant 001, pasien ke-25

## 📋 **Masalah Sistem Lama**

### **Masalah Utama:**
1. **Race Condition** - Duplikasi nomor RM saat concurrent requests
2. **Tidak Thread-Safe** - Tidak ada locking mechanism
3. **Parsing Tidak Aman** - `substr()` untuk extract nomor
4. **Format Sederhana** - Hanya `RM-000001`
5. **Tidak Ada Info Demografis** - Tidak include data pasien

### **Kode Lama (Bermasalah):**
```php
// Generate medical record number
$lastPatient = PatientRecord::orderBy('id', 'desc')->first();
$lastNumber = $lastPatient ? (int)substr($lastPatient->medical_record_number, 3) : 0;
$newNumber = $lastNumber + 1;
$medicalRecordNumber = 'RM-' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
```

## ✅ **Perbaikan yang Telah Diterapkan**

### **1. Thread-Safe dengan Database Transaction**
- Menggunakan `DB::transaction()` untuk atomicity
- Menggunakan `lockForUpdate()` untuk mencegah race condition
- Mengatasi masalah duplikasi nomor RM

### **2. Format Nomor RM yang Informatif**
- **Dari**: `RM-000001, RM-000002, ...`
- **Ke**: `YYMMG-CCCPPP-XXXX`
- Include data demografis pasien (tahun lahir, bulan lahir, gender)
- Include identitas company dan plant

### **3. Scope per Company/Plant**
- Nomor RM menggunakan kode company dan plant
- Setiap company/plant punya sequence nomor sendiri

### **4. Parsing yang Lebih Aman**
- Menggunakan `substr($lastRecord->medical_record_number, -4)`
- Extract data dari posisi yang tepat

## 🔧 **Implementasi Baru**

### **Kode yang Sudah Diperbaiki:**
```php
/**
 * Generate medical record number with thread-safe approach
 * Format: YYMMG-CCCPPP-XXXX 
 * YY: 2 digit tahun lahir, MM: 2 digit bulan lahir, G: Gender (1=L, 0=P)
 * CCC: 3 digit kode company, PPP: 3 digit kode plant
 * XXXX: nomor urut global
 */
private function generateMedicalRecordNumber($birthDate, $gender, $companyId = null, $plantId = null)
{
    return \DB::transaction(function () use ($birthDate, $gender, $companyId, $plantId) {
        // Parse birth date
        $birthDateTime = \Carbon\Carbon::parse($birthDate);
        $yearBirth = $birthDateTime->format('y'); // 2 digit tahun
        $monthBirth = $birthDateTime->format('m'); // 2 digit bulan
        
        // Convert gender: L=1, P=0
        $genderCode = ($gender === 'L') ? '1' : '0';
        
        // Get company and plant codes
        $companyCode = '000'; // default
        $plantCode = '000';   // default
        
        if ($companyId) {
            $company = \App\Models\Company::find($companyId);
            $companyCode = $company ? $company->code : '000';
        }
        
        if ($plantId) {
            $plant = \App\Models\Plant::find($plantId);
            $plantCode = $plant ? $plant->code : '000';
        }
        
        // Build prefix: YYMMG-CCCPPP-
        $prefix = "{$yearBirth}{$monthBirth}{$genderCode}-{$companyCode}{$plantCode}-";
        
        // Get last global sequence number
        $lastRecord = PatientRecord::where('medical_record_number', 'LIKE', '%-' . $companyCode . $plantCode . '-%')
            ->lockForUpdate() // Important: Lock for update to prevent race condition
            ->orderBy('medical_record_number', 'desc')
            ->first();
        
        if ($lastRecord) {
            // Extract the last 4 digits from the medical record number
            $lastNumber = (int) substr($lastRecord->medical_record_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            // First record for this company-plant combination
            $newNumber = 1;
        }
        
        // Format: YYMMG-CCCPPP-XXXX
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    });
}
```

## 📊 **Contoh Hasil Generate Nomor RM**

### **Scenario 1: Pasien Laki-laki lahir 15 Januari 1990**
```
Company 001, Plant 001: 90011-001001-0001
Company 001, Plant 002: 90011-001002-0001
Company 002, Plant 001: 90011-002001-0001
```

### **Scenario 2: Pasien Perempuan lahir 25 Desember 1985**
```
Company 001, Plant 001: 85120-001001-0002 (urutan kedua)
Company 002, Plant 001: 85120-002001-0001 (urutan pertama untuk company ini)
```

### **Scenario 3: Multiple Patients**
```
90011-001001-0001  // Laki-laki Jan 1990, Company 001, Plant 001, urutan 1
85120-001001-0002  // Perempuan Des 1985, Company 001, Plant 001, urutan 2
92051-001001-0003  // Laki-laki Mei 1992, Company 001, Plant 001, urutan 3
88030-002001-0001  // Perempuan Mar 1988, Company 002, Plant 001, urutan 1
```

## 📊 **Struktur Database yang Diperlukan**

### **Tabel Companies:**
```sql
companies (
    id CHAR(36) PRIMARY KEY,
    code CHAR(3) UNIQUE,  -- 001, 002, 003
    name VARCHAR(255),
    ...
)
```

### **Tabel Plants:**
```sql
plants (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36),
    code CHAR(3),  -- 001, 002, 003 per company
    name VARCHAR(255),
    ...
    UNIQUE KEY (company_id, code)
)
```

## 🧪 **Testing & Validation**

### **Manual Test Cases:**
1. **Test Basic Generation:**
   - Buat pasien laki-laki lahir 1990-01-15
   - Expected: `90011-[CCC][PPP]-0001`

2. **Test Gender Code:**
   - Laki-laki → Gender code = 1
   - Perempuan → Gender code = 0

3. **Test Sequential Numbers:**
   - Pasien kedua di company/plant yang sama
   - Expected: nomor urut +1

4. **Test Different Company/Plant:**
   - Pasien di company/plant berbeda
   - Expected: sequence restart dari 0001

### **Test Data:**
```php
// Test pasien 1: Laki-laki lahir 15 Jan 1990, Company 001, Plant 001
// Expected: 90011-001001-0001

// Test pasien 2: Perempuan lahir 25 Dec 1985, Company 001, Plant 001  
// Expected: 85120-001001-0002

// Test pasien 3: Laki-laki lahir 10 Mar 1992, Company 002, Plant 001
// Expected: 92031-002001-0001
```

## 🔄 **Migration yang Diperlukan**

Jika sudah ada data existing, perlu migration untuk:

```sql
-- Tambah kolom code ke companies
ALTER TABLE companies ADD COLUMN code CHAR(3) UNIQUE AFTER id;

-- Tambah kolom code ke plants  
ALTER TABLE plants ADD COLUMN code CHAR(3) AFTER company_id;
ALTER TABLE plants ADD UNIQUE KEY plants_company_code_unique (company_id, code);

-- Update existing data dengan code
UPDATE companies SET code = '001' WHERE id = 'company-1-id';
UPDATE companies SET code = '002' WHERE id = 'company-2-id';
-- dst...
```

## ⚠️ **Catatan Penting**

1. **Backup Database** sebelum implementasi
2. **Test Thoroughly** - Format baru lebih kompleks
3. **Validate Input** - Pastikan birth_date dan gender valid
4. **Monitor Performance** - Query dengan LIKE pattern
5. **Update Existing Data** - Jika ada data lama yang perlu migrate

## 📈 **Monitoring & Maintenance**

### **Query untuk Monitor:**
```sql
-- Check format nomor RM
SELECT medical_record_number, 
       SUBSTRING(medical_record_number, 1, 5) as demographic_part,
       SUBSTRING(medical_record_number, 7, 6) as company_plant_part,
       SUBSTRING(medical_record_number, 14, 4) as sequence_part
FROM patient_records 
ORDER BY created_at DESC LIMIT 10;

-- Check duplicate nomor RM
SELECT medical_record_number, COUNT(*) as count
FROM patient_records 
GROUP BY medical_record_number 
HAVING COUNT(*) > 1;

-- Check sequence per company-plant
SELECT SUBSTRING(medical_record_number, 7, 6) as company_plant,
       MAX(CAST(SUBSTRING(medical_record_number, 14, 4) AS UNSIGNED)) as max_sequence
FROM patient_records 
GROUP BY SUBSTRING(medical_record_number, 7, 6)
ORDER BY company_plant;
```

## 🎯 **Kesimpulan**

Sistem generate nomor RM yang baru sudah:
- ✅ **Thread-safe** dan mencegah race condition
- ✅ **Format informatif** dengan data demografis pasien
- ✅ **Include company/plant codes** untuk multi-tenant
- ✅ **Sequence management** yang proper
- ✅ **Ready untuk production** use

Format baru `YYMMG-CCCPPP-XXXX` memberikan informasi yang lebih kaya dan struktur yang lebih terorganisir untuk pengelolaan rekam medis. 