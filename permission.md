# PERMISSION SYSTEM DOCUMENTATION

## Overview
Sistem permission Medicare menggunakan Role-Based Access Control (RBAC) dengan granular permissions dan module-based access control. Setiap permission mengikuti format `{module}.{action}`.

## Permission Structure

### Default Permissions (Setiap Module)
Setiap module memiliki permission default berikut:

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `{module}.view` | View {Module} | Akses untuk melihat data |
| `{module}.create` | Create {Module} | Akses untuk membuat data baru |
| `{module}.edit` | Edit {Module} | Akses untuk mengedit data |
| `{module}.delete` | Delete {Module} | Akses untuk menghapus data |
| `{module}.export` | Export {Module} | Akses untuk export data |
| `{module}.import` | Import {Module} | Akses untuk import data |
| `{module}.toggle_status` | Toggle Status {Module} | Akses untuk mengubah status data |

## Module-Specific Permissions

### 1. LABORATORIUM Module
**Base Permissions:** `laboratorium.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `laboratorium.view` | View Laboratorium | Akses untuk melihat data laboratorium |
| `laboratorium.create` | Create Laboratorium | Akses untuk membuat data laboratorium baru |
| `laboratorium.edit` | Edit Laboratorium | Akses untuk mengedit data laboratorium |
| `laboratorium.delete` | Delete Laboratorium | Akses untuk menghapus data laboratorium |
| `laboratorium.export` | Export Laboratorium | Akses untuk export data laboratorium |
| `laboratorium.import` | Import Laboratorium | Akses untuk import data laboratorium |
| `laboratorium.toggle_status` | Toggle Status Laboratorium | Akses untuk mengubah status data laboratorium |
| `laboratorium.add_stock` | Add Stock | Akses untuk menambah stok |
| `laboratorium.reduce_stock` | Reduce Stock | Akses untuk mengurangi stok |
| `laboratorium.adjust_stock` | Adjust Stock | Akses untuk menyesuaikan stok |
| `laboratorium.view_stock_history` | View Stock History | Akses untuk melihat riwayat stok |

### 2. INVENTORY Module
**Base Permissions:** `inventory.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `inventory.view` | View Inventory | Akses untuk melihat data inventory |
| `inventory.create` | Create Inventory | Akses untuk membuat data inventory baru |
| `inventory.edit` | Edit Inventory | Akses untuk mengedit data inventory |
| `inventory.delete` | Delete Inventory | Akses untuk menghapus data inventory |
| `inventory.export` | Export Inventory | Akses untuk export data inventory |
| `inventory.import` | Import Inventory | Akses untuk import data inventory |
| `inventory.toggle_status` | Toggle Status Inventory | Akses untuk mengubah status data inventory |
| `inventory.add_stock` | Add Stock | Akses untuk menambah stok |
| `inventory.reduce_stock` | Reduce Stock | Akses untuk mengurangi stok |
| `inventory.adjust_stock` | Adjust Stock | Akses untuk menyesuaikan stok |
| `inventory.view_stock_history` | View Stock History | Akses untuk melihat riwayat stok |

### 3. PELAYANAN Module
**Base Permissions:** `pelayanan.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `pelayanan.view` | View Pelayanan | Akses untuk melihat data pelayanan |
| `pelayanan.create` | Create Pelayanan | Akses untuk membuat data pelayanan baru |
| `pelayanan.edit` | Edit Pelayanan | Akses untuk mengedit data pelayanan |
| `pelayanan.delete` | Delete Pelayanan | Akses untuk menghapus data pelayanan |
| `pelayanan.export` | Export Pelayanan | Akses untuk export data pelayanan |
| `pelayanan.import` | Import Pelayanan | Akses untuk import data pelayanan |
| `pelayanan.toggle_status` | Toggle Status Pelayanan | Akses untuk mengubah status data pelayanan |
| `pelayanan.registrasi` | Registrasi | Akses untuk registrasi pasien |
| `pelayanan.konsultasi` | Konsultasi | Akses untuk konsultasi |
| `pelayanan.pemeriksaan_lab` | Pemeriksaan Lab | Akses untuk pemeriksaan laboratorium |
| `pelayanan.rawat_jalan` | Rawat Jalan | Akses untuk rawat jalan |

### 4. LAPORAN Module
**Base Permissions:** `laporan.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `laporan.view` | View Laporan | Akses untuk melihat data laporan |
| `laporan.create` | Create Laporan | Akses untuk membuat data laporan baru |
| `laporan.edit` | Edit Laporan | Akses untuk mengedit data laporan |
| `laporan.delete` | Delete Laporan | Akses untuk menghapus data laporan |
| `laporan.export` | Export Laporan | Akses untuk export data laporan |
| `laporan.import` | Import Laporan | Akses untuk import data laporan |
| `laporan.toggle_status` | Toggle Status Laporan | Akses untuk mengubah status data laporan |
| `laporan.kunjungan_rawat_jalan` | Laporan Kunjungan Rawat Jalan | Akses untuk laporan kunjungan rawat jalan |
| `laporan.kunjungan_pemeriksaan_lab` | Laporan Kunjungan Pemeriksaan Lab | Akses untuk laporan kunjungan pemeriksaan lab |
| `laporan.obat_keluar` | Laporan Obat Keluar | Akses untuk laporan obat keluar |
| `laporan.tagihan` | Laporan Tagihan | Akses untuk laporan tagihan |

### 5. ADMIN Module
**Base Permissions:** `admin.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `admin.view` | View Admin | Akses untuk melihat data admin |
| `admin.create` | Create Admin | Akses untuk membuat data admin baru |
| `admin.edit` | Edit Admin | Akses untuk mengedit data admin |
| `admin.delete` | Delete Admin | Akses untuk menghapus data admin |
| `admin.export` | Export Admin | Akses untuk export data admin |
| `admin.import` | Import Admin | Akses untuk import data admin |
| `admin.toggle_status` | Toggle Status Admin | Akses untuk mengubah status data admin |
| `admin.manage_users` | Manage Users | Akses untuk mengelola user |
| `admin.manage_roles` | Manage Roles | Akses untuk mengelola role |
| `admin.manage_companies` | Manage Companies | Akses untuk mengelola perusahaan |
| `admin.manage_plants` | Manage Plants | Akses untuk mengelola plant |
| `admin.manage_diagnosa` | Manage Diagnosa | Akses untuk mengelola diagnosa |

### 6. MANAJEMEN Module
**Base Permissions:** `manajemen.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `manajemen.view` | View Manajemen | Akses untuk melihat data manajemen |
| `manajemen.create` | Create Manajemen | Akses untuk membuat data manajemen baru |
| `manajemen.edit` | Edit Manajemen | Akses untuk mengedit data manajemen |
| `manajemen.delete` | Delete Manajemen | Akses untuk menghapus data manajemen |
| `manajemen.export` | Export Manajemen | Akses untuk export data manajemen |
| `manajemen.import` | Import Manajemen | Akses untuk import data manajemen |
| `manajemen.toggle_status` | Toggle Status Manajemen | Akses untuk mengubah status data manajemen |
| `manajemen.manage_departemen` | Manage Departemen | Akses untuk mengelola departemen |
| `manajemen.manage_shift` | Manage Shift | Akses untuk mengelola shift |
| `manajemen.manage_status_karyawan` | Manage Status Karyawan | Akses untuk mengelola status karyawan |
| `manajemen.manage_penjamin` | Manage Penjamin | Akses untuk mengelola penjamin |
| `manajemen.manage_laboratorium` | Manage Laboratorium | Akses untuk mengelola laboratorium |
| `manajemen.manage_inventory` | Manage Inventory | Akses untuk mengelola inventory |

### 7. DASHBOARD Module
**Base Permissions:** `dashboard.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `dashboard.view` | View Dashboard | Akses untuk melihat dashboard |
| `dashboard.create` | Create Dashboard | Akses untuk membuat dashboard baru |
| `dashboard.edit` | Edit Dashboard | Akses untuk mengedit dashboard |
| `dashboard.delete` | Delete Dashboard | Akses untuk menghapus dashboard |
| `dashboard.export` | Export Dashboard | Akses untuk export dashboard |
| `dashboard.import` | Import Dashboard | Akses untuk import dashboard |
| `dashboard.toggle_status` | Toggle Status Dashboard | Akses untuk mengubah status dashboard |

### 8. ALL Module (Special)
**Base Permissions:** `all.{action}`

| Permission Name | Display Name | Description |
|----------------|--------------|-------------|
| `all.view` | Lihat Semua Halaman | Akses untuk melihat semua halaman |

## Special Roles

### Super Admin
- **Role Name:** `super_admin`
- **Display Name:** Super Administrator
- **Description:** Super administrator dengan akses penuh
- **Permissions:** Semua permission otomatis diberikan
- **Bypass:** Semua permission checks

### Default User
- **Role Name:** `user`
- **Display Name:** User
- **Description:** User biasa dengan akses terbatas
- **Permissions:** Sesuai yang diberikan oleh admin

## Permission Usage

### Backend Usage
```php
// Cek permission
if ($user->hasPermission('inventory.create')) {
    // User dapat membuat inventory
}

// Cek module access
if ($user->hasModuleAccess('inventory')) {
    // User dapat akses module inventory
}

// Cek super admin
if ($user->isSuperAdmin()) {
    // User adalah super admin
}

// Helper functions
if (user_can('inventory.create')) {
    // User dapat membuat inventory
}

if (user_has_module('inventory')) {
    // User dapat akses module inventory
}

if (is_super_admin()) {
    // User adalah super admin
}
```

### Frontend Usage
```javascript
// Cek permission
if (auth.permissions.includes('inventory.create')) {
    // Show create button
}

// Cek module access
if (auth.modules.includes('inventory')) {
    // Show inventory menu
}

// Cek super admin
if (auth.isSuperAdmin) {
    // Show admin features
}
```

### Route Protection
```php
// Protect by module
Route::middleware(['auth', 'verified', 'module:inventory'])->group(function () {
    // Routes here
});

// Protect by permission
Route::middleware(['auth', 'verified', 'permission:inventory.create'])->group(function () {
    // Routes here
});
```

## Permission Management Commands

### Generate Permissions
```bash
# Generate permission untuk module tertentu
php artisan permission:generate inventory

# Generate semua permission
php artisan permission:generate-all

# Force regenerate permission
php artisan permission:generate inventory --force
```

### Debug Permissions
```bash
# Debug role dan permission
php artisan debug:role-permission

# Test authorization
php artisan auth:test user@example.com
```

## Database Structure

### Permissions Table
```sql
CREATE TABLE permissions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    module VARCHAR(255),
    created_by CHAR(36),
    updated_by CHAR(36),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Role_Permissions Table
```sql
CREATE TABLE role_permissions (
    role_id CHAR(36),
    permission_id CHAR(36),
    created_by CHAR(36),
    updated_by CHAR(36),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);
```

## Best Practices

1. **Granular Permissions:** Gunakan permission yang spesifik dan granular
2. **Module Organization:** Kelompokkan permission berdasarkan module
3. **Naming Convention:** Konsisten dalam penamaan permission
4. **Super Admin Bypass:** Super admin selalu memiliki akses penuh
5. **Permission Inheritance:** Role dapat memiliki multiple permissions
6. **Audit Trail:** Semua permission changes dicatat dengan created_by/updated_by

## Security Considerations

1. **Always Check Permissions:** Jangan mengandalkan UI hiding saja
2. **Server-Side Validation:** Validasi permission di backend
3. **Role Hierarchy:** Implementasi role hierarchy jika diperlukan
4. **Permission Caching:** Cache permission untuk performa
5. **Regular Audit:** Audit permission secara berkala
6. **Least Privilege:** Berikan permission minimal yang diperlukan 