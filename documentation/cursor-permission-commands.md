# Permission Management Commands

Dokumentasi untuk command-command pengelolaan permission yang telah dibuat sesuai dengan struktur sistem yang ada.

## **Command Overview**

### **1. GeneratePermissionModule**
Command untuk generate permission untuk module tertentu.

**Signature:**
```bash
php artisan permission:generate {module} {--force}
```

**Parameters:**
- `module`: Nama module (laboratorium, inventory, pelayanan, laporan, admin, manajemen)
- `--force`: Force regenerate existing permissions

**Contoh Penggunaan:**
```bash
# Generate permission untuk module laboratorium
php artisan permission:generate laboratorium

# Force regenerate permission untuk module inventory
php artisan permission:generate inventory --force
```

**Fitur:**
- Generate default permissions (view, create, edit, delete, export, import, toggle_status)
- Generate module-specific permissions
- Auto-assign ke super admin role
- Validasi module yang tersedia
- Konfirmasi sebelum overwrite existing permissions

### **2. GenerateAllPermissions**
Command untuk generate semua permission untuk semua module sekaligus.

**Signature:**
```bash
php artisan permission:generate-all {--force} {--module=}
```

**Options:**
- `--force`: Force regenerate existing permissions
- `--module`: Generate untuk module tertentu saja

**Contoh Penggunaan:**
```bash
# Generate semua permission untuk semua module
php artisan permission:generate-all

# Generate permission untuk module tertentu
php artisan permission:generate-all --module=laboratorium

# Force regenerate semua permission
php artisan permission:generate-all --force
```

**Fitur:**
- Generate permission untuk semua module sekaligus
- Support untuk generate module tertentu
- Summary report setelah selesai
- Integrasi dengan GeneratePermissionModule command

### **3. SyncRolePermissions**
Command untuk sync permission dengan role yang sudah ada.

**Signature:**
```bash
php artisan permission:sync-roles {--role=} {--force}
```

**Options:**
- `--role`: Sync untuk role tertentu saja
- `--force`: Force sync dengan mode interactive

**Contoh Penggunaan:**
```bash
# Sync semua role
php artisan permission:sync-roles

# Sync role tertentu
php artisan permission:sync-roles --role=admin

# Force sync dengan mode interactive
php artisan permission:sync-roles --force
```

**Fitur:**
- Interactive permission management
- Auto-assign semua permission ke super admin
- Module-based permission assignment
- Support untuk add/remove module permissions
- Real-time permission preview

## **Module-Specific Permissions**

### **Laboratorium Module**
- Default: view, create, edit, delete, export, import, toggle_status
- Specific: add_stock, reduce_stock, adjust_stock, view_stock_history

### **Inventory Module**
- Default: view, create, edit, delete, export, import, toggle_status
- Specific: add_stock, reduce_stock, adjust_stock, view_stock_history

### **Pelayanan Module**
- Default: view, create, edit, delete, export, import, toggle_status
- Specific: registrasi, konsultasi, pemeriksaan_lab, rawat_jalan

### **Laporan Module**
- Default: view, create, edit, delete, export, import, toggle_status
- Specific: kunjungan_rawat_jalan, kunjungan_pemeriksaan_lab, obat_keluar, tagihan

### **Admin Module**
- Default: view, create, edit, delete, export, import, toggle_status
- Specific: manage_users, manage_roles, manage_companies, manage_plants, manage_diagnosa

### **Manajemen Module**
- Default: view, create, edit, delete, export, import, toggle_status

## **Workflow Penggunaan**

### **1. Setup Awal Permission System**
```bash
# Generate semua permission untuk semua module
php artisan permission:generate-all

# Sync dengan role yang sudah ada
php artisan permission:sync-roles
```

### **2. Menambah Module Baru**
```bash
# Generate permission untuk module baru
php artisan permission:generate new_module

# Sync dengan role yang ada
php artisan permission:sync-roles
```

### **3. Update Permission Existing**
```bash
# Force regenerate permission untuk module tertentu
php artisan permission:generate laboratorium --force

# Sync ulang dengan role
php artisan permission:sync-roles --role=admin
```

### **4. Debug Permission System**
```bash
# Debug role dan permission
php artisan debug:role-permission

# Test authorization untuk user tertentu
php artisan auth:test user@example.com
```

## **Permission Naming Convention**

### **Format:**
```
{module}.{action}
```

### **Contoh:**
- `laboratorium.view` - Akses untuk melihat data laboratorium
- `laboratorium.create` - Akses untuk membuat data laboratorium baru
- `laboratorium.add_stock` - Akses untuk menambah stok laboratorium
- `admin.manage_users` - Akses untuk mengelola user

## **Database Structure**

### **Permissions Table:**
- `id` (UUID) - Primary key
- `name` (string) - Permission name (format: module.action)
- `display_name` (string) - Human readable name
- `description` (text) - Permission description
- `module` (string) - Module name
- `created_by` (UUID) - User who created
- `updated_by` (UUID) - User who last updated
- `created_at` (timestamp)
- `updated_at` (timestamp)

### **Role_Permissions Table:**
- `role_id` (UUID) - Foreign key to roles
- `permission_id` (UUID) - Foreign key to permissions
- `created_by` (UUID) - User who assigned
- `updated_by` (UUID) - User who last updated
- `created_at` (timestamp)
- `updated_at` (timestamp)

## **Best Practices**

### **1. Permission Granularity**
- Gunakan permission yang spesifik dan granular
- Hindari permission yang terlalu umum
- Kelompokkan berdasarkan module

### **2. Naming Convention**
- Konsisten dalam penamaan permission
- Gunakan format `module.action`
- Gunakan snake_case untuk action

### **3. Module Organization**
- Kelompokkan permission berdasarkan module
- Buat module-specific permission jika diperlukan
- Maintain consistency across modules

### **4. Security**
- Selalu cek permission di backend
- Jangan hanya mengandalkan frontend validation
- Log semua permission changes untuk audit

### **5. Performance**
- Gunakan eager loading untuk relasi role dan permission
- Cache permission data jika diperlukan
- Optimize database queries

## **Troubleshooting**

### **Common Issues:**

1. **Permission tidak ter-generate**
   - Cek apakah module name valid
   - Pastikan database connection berfungsi
   - Cek error log Laravel

2. **Role tidak ter-sync**
   - Pastikan role sudah ada di database
   - Cek foreign key constraints
   - Pastikan super admin role ada

3. **Permission tidak ter-assign**
   - Cek relasi antara role dan permission
   - Pastikan permission ID valid
   - Cek pivot table role_permissions

### **Debug Commands:**
```bash
# Cek permission yang ada
php artisan tinker
>>> App\Models\Permission::all()

# Cek role permissions
>>> App\Models\Role::with('permissions')->get()

# Cek user permissions
>>> App\Models\User::with('role.permissions')->first()->getAllPermissions()
```

## **Integration dengan Existing System**

### **Middleware Integration:**
- `CheckPermission` - Cek permission granular
- `CheckModule` - Cek module access

### **Helper Functions:**
- `is_super_admin()` - Cek apakah user super admin
- `get_user_permissions()` - Ambil semua permission user
- `get_user_modules()` - Ambil semua module yang bisa diakses user

### **Frontend Integration:**
- Gunakan `auth.permissions` untuk cek permission di frontend
- Gunakan `auth.modules` untuk cek module access
- Gunakan `auth.isSuperAdmin` untuk cek super admin status

## **Future Enhancements**

### **Planned Features:**
1. **Permission Templates** - Template untuk permission pattern tertentu
2. **Bulk Permission Management** - Manage multiple permissions sekaligus
3. **Permission Analytics** - Track permission usage
4. **Permission Inheritance** - Role inheritance system
5. **Permission Groups** - Group permissions untuk easier management

### **API Endpoints:**
1. **Permission CRUD** - REST API untuk manage permissions
2. **Role Permission Assignment** - API untuk assign/unassign permissions
3. **Permission Validation** - API untuk validate user permissions
4. **Permission Audit** - API untuk audit trail

## **Maintenance**

### **Regular Tasks:**
1. **Permission Audit** - Review permission usage secara berkala
2. **Cleanup Unused Permissions** - Hapus permission yang tidak digunakan
3. **Update Permission Documentation** - Update dokumentasi sesuai perubahan
4. **Backup Permission Data** - Backup permission dan role data

### **Monitoring:**
1. **Permission Usage Logs** - Monitor permission usage
2. **Access Denied Logs** - Monitor access denied attempts
3. **Performance Metrics** - Monitor permission check performance
4. **Security Alerts** - Alert untuk suspicious permission changes 