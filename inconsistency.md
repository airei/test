# INCONSISTENCY ANALYSIS

## Ketidak-Konsistenan yang Ditemukan

### 1. Inconsistency dalam Naming Convention

#### Database Tables
- `diagnosis_details` vs `diagnosas` - Inconsistent naming pattern
- `patient_to_guarantors` vs `patient_records` - Inconsistent naming pattern
- `lab_queue` vs `outpatient_queue` - Inconsistent naming pattern
- `lab_masters` vs `lab_details` - Inconsistent naming pattern

#### Model Names
- `DiagnosisDetail` vs `Diagnosa` - Inconsistent naming pattern
- `PatientToGuarantor` vs `PatientRecord` - Inconsistent naming pattern
- `LabQueue` vs `OutpatientQueue` - Inconsistent naming pattern

#### Controller Names
- `DiagnosaController` vs `DiagnosisDetail` - Inconsistent naming pattern
- `RoleHakAksesController` vs `UserController` - Inconsistent naming pattern

### 2. Inconsistency dalam Database Schema

#### Foreign Key Naming
- `patient_record_id` vs `patient_records_id` - Inconsistent naming
- `guarantor_id` vs `guarantors_id` - Inconsistent naming
- `diagnosas_id` vs `diagnosa_id` - Inconsistent naming

#### Column Naming
- `outpatient_visit_id` vs `outpatient_queue_id` - Inconsistent naming
- `lab_queue_id` vs `lab_request_id` - Inconsistent naming

#### Data Types
- Some tables use `string` for IDs (UUID), others might use `integer`
- Inconsistent use of `nullable` columns

### 3. Inconsistency dalam Code Structure

#### Controller Methods
- Some controllers use `index()`, `create()`, `store()`, `edit()`, `update()`, `destroy()`
- Others use custom method names like `toggleStatus()`, `showImport()`, `export()`
- Inconsistent method naming patterns

#### Route Naming
- Some routes use kebab-case: `registrasi-rekam-medis`
- Others use snake_case: `role_hak_akses`
- Inconsistent route naming convention

#### Model Relationships
- Some models use `belongsTo()`, others use `hasMany()`
- Inconsistent relationship naming patterns

### 4. Inconsistency dalam Frontend

#### Component Naming
- Some components use PascalCase: `DashboardController`
- Others use kebab-case: `registrasi-rekam-medis`
- Inconsistent component naming convention

#### File Structure
- Some pages are in subdirectories: `AdminPanel/User/`
- Others are flat: `dashboard.tsx`
- Inconsistent file organization

### 5. Inconsistency dalam Permission System

#### Permission Naming
- Some permissions use dot notation: `inventory.view`
- Others use space: `export inventory`
- Inconsistent permission naming convention

#### Module Naming
- Some modules use singular: `admin`
- Others use plural: `laporan`
- Inconsistent module naming convention

### 6. Inconsistency dalam Error Handling

#### Exception Handling
- Some controllers use try-catch blocks
- Others don't handle exceptions
- Inconsistent error handling patterns

#### Response Format
- Some endpoints return JSON
- Others return Inertia responses
- Inconsistent response format

### 7. Inconsistency dalam Validation

#### Validation Rules
- Some controllers use `$request->validate()`
- Others use Form Request classes
- Inconsistent validation approach

#### Error Messages
- Some error messages are in Indonesian
- Others are in English
- Inconsistent language usage

### 8. Inconsistency dalam Logging

#### Log Levels
- Some code uses `\Log::info()`
- Others use `\Log::error()`
- Inconsistent log level usage

#### Log Messages
- Some log messages are in Indonesian
- Others are in English
- Inconsistent language usage

### 9. Inconsistency dalam Configuration

#### Environment Variables
- Some configs use `APP_` prefix
- Others don't have consistent prefix
- Inconsistent environment variable naming

#### Configuration Files
- Some configs are in `config/` directory
- Others are in `.env` file
- Inconsistent configuration management

### 10. Inconsistency dalam Testing

#### Test Naming
- Some tests use `Test` suffix
- Others don't follow consistent naming
- Inconsistent test naming convention

#### Test Structure
- Some tests are in `Feature/` directory
- Others are in `Unit/` directory
- Inconsistent test organization

## Rekomendasi Perbaikan

### Prioritas Tinggi
1. Standardize database table and column naming
2. Standardize model and controller naming
3. Standardize route naming convention
4. Standardize permission naming convention

### Prioritas Menengah
1. Standardize error handling patterns
2. Standardize validation approach
3. Standardize response format
4. Standardize logging patterns

### Prioritas Rendah
1. Standardize frontend component naming
2. Standardize configuration management
3. Standardize testing structure
4. Standardize language usage

## Dampak Perbaikan
- Meningkatkan code readability
- Memudahkan maintenance
- Mengurangi confusion
- Meningkatkan developer experience
- Memudahkan onboarding developer baru 