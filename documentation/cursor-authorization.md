# Sistem Authorization Medicare

## **Overview**
Sistem authorization Medicare menggunakan pendekatan Role-Based Access Control (RBAC) dengan granular permissions dan module-based access control.

## **Struktur Database**

### **Tabel Users**
- `id` - UUID primary key
- `company_id` - Foreign key ke companies
- `plant_id` - Foreign key ke plants  
- `role_id` - Foreign key ke roles
- `name`, `email`, `password`
- `is_active` - Status aktif user

### **Tabel Roles**
- `id` - UUID primary key
- `name` - Nama role (super_admin, admin, staff, dll)
- `display_name` - Nama yang ditampilkan
- `description` - Deskripsi role
- `is_active` - Status aktif role

### **Tabel Permissions**
- `id` - UUID primary key
- `name` - Nama permission (dashboard.view, manajemen.create, dll)
- `display_name` - Nama yang ditampilkan
- `description` - Deskripsi permission
- `module` - Module yang terkait (dashboard, manajemen, pelayanan, dll)
- `created_by`, `updated_by`

### **Tabel Role_Permissions (Pivot)**
- `role_id` - Foreign key ke roles
- `permission_id` - Foreign key ke permissions
- `created_by`, `updated_by`
- `created_at`, `updated_at`

## **Hierarchy Authorization**

### **1. Super Admin**
- Akses penuh ke semua fitur
- Bypass semua permission checks
- Dapat mengelola role dan permission

### **2. Admin (Perusahaan)**
- Akses terbatas sesuai permission yang diberikan
- Hanya bisa akses data perusahaan/plant sendiri
- Dapat mengelola user di perusahaan/plant sendiri

### **3. Staff/User Biasa**
- Akses sangat terbatas sesuai permission
- Hanya bisa akses data yang diizinkan
- Tidak bisa mengelola user atau role

## **Module-Based Access Control**

### **Modules yang Tersedia:**
1. **dashboard** - Dashboard utama
2. **manajemen** - Manajemen data (departemen, shift, laboratorium, dll)
3. **pelayanan** - Pelayanan pasien
4. **laporan** - Laporan dan analytics
5. **admin** - Admin panel (user, role, company, plant)

### **Permission Naming Convention:**
```
{module}.{action}
```
Contoh:
- `dashboard.view`
- `manajemen.create`
- `manajemen.edit`
- `manajemen.delete`
- `pelayanan.view`
- `laporan.view`

## **Implementation**

### **1. Middleware**
- `CheckPermission` - Cek permission spesifik
- `CheckModule` - Cek akses module

### **2. Model Methods (User)**
```php
// Cek permission
$user->hasPermission('manajemen.create')

// Cek module access
$user->hasModuleAccess('manajemen')

// Cek super admin
$user->isSuperAdmin()

// Get all permissions
$user->getAllPermissions()

// Get accessible modules
$user->getAccessibleModules()
```

### **3. Helper Functions**
```php
// Cek permission
user_can('manajemen.create')

// Cek module access
user_has_module('manajemen')

// Cek super admin
is_super_admin()

// Get user permissions
get_user_permissions()

// Get user modules
get_user_modules()
```

### **4. Route Protection**
```php
// Protect by module
Route::middleware(['auth', 'verified', 'module:manajemen'])->group(function () {
    // Routes here
});

// Protect by permission
Route::middleware(['auth', 'verified', 'permission:manajemen.create'])->group(function () {
    // Routes here
});
```

## **Frontend Integration**

### **Data yang Di-share ke Inertia:**
```javascript
{
  auth: {
    user: {
      id: "uuid",
      name: "User Name",
      email: "user@example.com",
      role: {
        id: "uuid",
        name: "admin",
        display_name: "Administrator"
      },
      company: { id: "uuid", name: "Company Name" },
      plant: { id: "uuid", name: "Plant Name" }
    },
    permissions: ["dashboard.view", "manajemen.create"],
    modules: ["dashboard", "manajemen"],
    isSuperAdmin: false
  }
}
```

### **Frontend Usage:**
```javascript
// Cek permission
if (auth.permissions.includes('manajemen.create')) {
  // Show create button
}

// Cek module access
if (auth.modules.includes('manajemen')) {
  // Show manajemen menu
}

// Cek super admin
if (auth.isSuperAdmin) {
  // Show admin features
}
```

## **Testing**

### **Command Testing:**
```bash
# Test user authorization
php artisan auth:test user@example.com

# Test specific permission
php artisan auth:test user@example.com manajemen.create
```

## **Best Practices**

### **1. Permission Granularity**
- Gunakan permission yang spesifik
- Contoh: `manajemen.laboratorium.create` bukan hanya `manajemen.create`

### **2. Module Organization**
- Kelompokkan permission berdasarkan module
- Gunakan naming convention yang konsisten

### **3. Security**
- Selalu cek permission di backend
- Jangan hanya mengandalkan frontend validation
- Log semua access attempts untuk audit

### **4. Performance**
- Cache permission data jika diperlukan
- Gunakan eager loading untuk relasi role dan permission

## **Troubleshooting**

### **Common Issues:**

1. **User masih bisa akses semua fitur**
   - Pastikan middleware sudah diterapkan di routes
   - Cek apakah role dan permission sudah ter-assign dengan benar
   - Pastikan helper functions sudah di-load

2. **Permission tidak terdeteksi**
   - Cek relasi antara user, role, dan permission
   - Pastikan permission name sesuai dengan yang di-check
   - Cek apakah role masih aktif

3. **Module access tidak berfungsi**
   - Pastikan permission memiliki field `module` yang benar
   - Cek apakah middleware `CheckModule` sudah ter-register

### **Debug Commands:**
```bash
# Cek user permissions
php artisan auth:test user@example.com

# Cek database
php artisan tinker
>>> $user = User::with('role.permissions')->find('user-id')
>>> $user->getAllPermissions()
>>> $user->getAccessibleModules()
``` 