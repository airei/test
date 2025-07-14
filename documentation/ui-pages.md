# UI Pages Documentation - Medicare System

## Menu Structure

### Main Navigation
Sistem Medicare memiliki struktur menu yang terorganisir dengan baik:

#### 1. Dashboard
- **Path**: `/dashboard`
- **Icon**: LayoutGrid
- **Description**: Halaman utama dashboard

#### 2. Pelayanan
- **Registrasi & Rekam Medis** (`/pelayanan/registrasi-rekam-medis`) - FileText icon
- **Rawat Jalan** (`/pelayanan/rawat-jalan`) - Stethoscope icon
- **Pemeriksaan Lab** (`/pelayanan/pemeriksaan-lab`) - Microscope icon
- **Konsultasi** (`/pelayanan/konsultasi`) - Users icon
- **Konsultasi Lab** (`/pelayanan/konsultasi-lab`) - Microscope icon

#### 3. Manajemen
- **Departemen** (`/manajemen/departemen`) - Building2 icon
- **Status Karyawan** (`/manajemen/status-karyawan`) - UserCheck icon
- **Shift** (`/manajemen/shift`) - Clock icon
- **Penjamin** (`/manajemen/penjamin`) - Shield icon
- **Laboratorium** (`/manajemen/laboratorium`) - Microscope icon
- **Inventory** (`/manajemen/inventory`) - Package icon

#### 4. Laporan
- **Kunjungan Rawat Jalan** (`/laporan/kunjungan-rawat-jalan`) - BarChart3 icon
- **Kunjungan Pemeriksaan Lab** (`/laporan/kunjungan-pemeriksaan-lab`) - Calendar icon
- **Obat Keluar** (`/laporan/obat-keluar`) - Pill icon
- **Tagihan** (`/laporan/tagihan`) - Receipt icon

#### 5. Admin Panel
- **Company dan Plant** (`/admin/company-plant`) - Building2 icon
- **Role dan Hak Akses** (`/admin/role-hak-akses`) - Key icon
- **User** (`/admin/user`) - User icon
- **Diagnosa** (`/admin/diagnosa`) - Activity icon

## Layout Components

### AppHeaderLayout
- **File**: `resources/js/layouts/app/app-header-layout.tsx`
- **Description**: Layout dengan header dan content area
- **Features**:
  - Responsive header dengan navigation menu
  - Breadcrumbs support
  - User menu dropdown
  - Search functionality
  - Mobile-friendly hamburger menu

### AppSidebarLayout
- **File**: `resources/js/layouts/app/app-sidebar-layout.tsx`
- **Description**: Layout dengan sidebar navigation
- **Features**:
  - Collapsible sidebar
  - Grouped menu items
  - Icon support
  - Active state indicators

## Navigation Components

### AppHeader
- **File**: `resources/js/components/app-header.tsx`
- **Features**:
  - Desktop navigation menu
  - Mobile hamburger menu
  - User avatar and dropdown
  - Search button
  - Breadcrumbs display

### AppSidebar
- **File**: `resources/js/components/app-sidebar.tsx`
- **Features**:
  - Grouped menu structure
  - Icon support for each menu item
  - Collapsible functionality
  - Active state highlighting

### NavMain
- **File**: `resources/js/components/nav-main.tsx`
- **Features**:
  - Support for individual menu items
  - Support for grouped menu items
  - Active state detection
  - Tooltip support

## Menu Implementation

### Data Structure
```typescript
interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}
```

### Icon Usage
Sistem menggunakan Lucide React icons untuk konsistensi visual:
- **Medical**: Stethoscope, Microscope, Pill, Activity
- **Management**: Building2, UserCheck, Clock, Shield, Package
- **Reports**: BarChart3, Calendar, Receipt
- **Admin**: Key, User, FileText

## Responsive Design

### Desktop
- Full navigation menu di header
- Sidebar dengan grouped menu
- Tooltips untuk compact view

### Mobile
- Hamburger menu untuk navigation
- Sheet component untuk mobile menu
- Touch-friendly interface

## Future Enhancements

### Planned Features
1. **Role-based Menu Access**: Menampilkan menu berdasarkan role user
2. **Menu Permissions**: Kontrol akses per menu item
3. **Menu Favorites**: User dapat menandai menu favorit
4. **Menu Search**: Pencarian menu untuk navigasi cepat
5. **Menu History**: Riwayat menu yang sering diakses

### Technical Improvements
1. **Menu Caching**: Cache menu structure untuk performa
2. **Dynamic Menu Loading**: Load menu berdasarkan permissions
3. **Menu Analytics**: Track menu usage untuk UX improvement
4. **Menu Customization**: User dapat customize menu layout

# Dokumentasi UI dan Struktur Halaman Medicare

## Struktur Susunan Halaman (Site Map)

```
medicare/
├── dashboard.tsx                    # Dashboard utama
├── welcome.tsx                      # Landing page
├── auth/                           # Autentikasi
│   ├── login.tsx                   # Halaman login
│   ├── register.tsx                # Halaman registrasi
│   ├── forgot-password.tsx         # Lupa password
│   ├── reset-password.tsx          # Reset password
│   ├── confirm-password.tsx        # Konfirmasi password
│   └── verify-email.tsx            # Verifikasi email
├── settings/                       # Pengaturan
│   ├── profile.tsx                 # Edit profil
│   └── password.tsx                # Ganti password
├── Management/                     # Manajemen data master
│   ├── Companies/                  # Manajemen perusahaan
│   ├── Plants/                     # Manajemen plant/cabang
│   ├── Departments/                # Manajemen departemen
│   ├── Users/                      # Manajemen user
│   ├── Shifts/                     # Manajemen shift
│   ├── EmployeeStatus/             # Manajemen status karyawan
│   ├── Guarantors/                 # Manajemen penjamin
│   ├── Diagnosa/                   # Manajemen diagnosa
│   ├── LabMaster/                  # Manajemen master lab
│   └── Inventory/                  # Manajemen inventori
└── Service/                        # Layanan medis
    ├── Outpatient/                 # Rawat jalan
    ├── Consultation/               # Konsultasi
    ├── MedicalRecords/             # Rekam medis
    ├── Lab/                        # Laboratorium
    └── LabExamination/             # Pemeriksaan lab
```

---

## Dokumentasi Menu

### Dashboard


---

## Dokumentasi UI Setiap Halaman

### 1. Dashboard (`dashboard.tsx`)
**Tujuan:** Halaman utama yang menampilkan ringkasan data dan statistik aplikasi

**Komponen UI:**
- **Statistik Cards:** Metrik utama (kunjungan rawat jalan, pemeriksaan lab, total pasien)
- **Filter:** Dropdown tahun dan bulan
- **Tabs:** Navigasi antar jenis chart/grafik
- **Charts:** Bar chart, pie chart, line chart, doughnut chart

**Navigasi:**
- Filter tahun/bulan untuk mengubah data
- Tab navigation untuk beralih antar visualisasi

---

### 2. Welcome (`welcome.tsx`)
**Tujuan:** Landing page untuk pengguna yang belum login

**Komponen UI:**
- **Header:** Navigation bar dengan link login/register
- **Hero Section:** Logo Laravel dan tagline
- **Content Area:** Daftar link dokumentasi Laravel
- **Illustration:** SVG artwork Laravel

**Navigasi:**
- Link ke Dashboard (jika sudah login)
- Link Login/Register (jika belum login)

---

### 3. Authentication Pages

#### 3.1 Login (`auth/login.tsx`)
**Tujuan:** Halaman untuk login user

**Komponen UI:**
- **Form Login:** Email dan password
- **Remember Me:** Checkbox
- **Links:** Forgot password, register

**Navigasi:**
- Submit form untuk login
- Link ke forgot password dan register

#### 3.2 Register (`auth/register.tsx`)
**Tujuan:** Halaman untuk registrasi user baru

**Komponen UI:**
- **Form Register:** Name, email, password, password confirmation
- **Terms:** Checkbox persetujuan

**Navigasi:**
- Submit form untuk register
- Link ke login

#### 3.3 Forgot Password (`auth/forgot-password.tsx`)
**Tujuan:** Halaman untuk reset password

**Komponen UI:**
- **Form:** Email input
- **Links:** Back to login

**Navigasi:**
- Submit email untuk reset password
- Link kembali ke login

#### 3.4 Reset Password (`auth/reset-password.tsx`)
**Tujuan:** Halaman untuk set password baru

**Komponen UI:**
- **Form:** Email, password, password confirmation, token

**Navigasi:**
- Submit form untuk set password baru

#### 3.5 Confirm Password (`auth/confirm-password.tsx`)
**Tujuan:** Konfirmasi password sebelum aksi tertentu

**Komponen UI:**
- **Form:** Password input

**Navigasi:**
- Submit password untuk konfirmasi

#### 3.6 Verify Email (`auth/verify-email.tsx`)
**Tujuan:** Verifikasi email user

**Komponen UI:**
- **Message:** Instruksi verifikasi
- **Resend Button:** Kirim ulang email verifikasi

**Navigasi:**
- Resend verification email
- Logout

---

### 4. Settings Pages

#### 4.1 Profile (`settings/profile.tsx`)
**Tujuan:** Edit profil user

**Komponen UI:**
- **Form Profile:** Name, email
- **Avatar:** Upload foto profil

**Navigasi:**
- Submit form untuk update profil
- Upload avatar

#### 4.2 Password (`settings/password.tsx`)
**Tujuan:** Ganti password user

**Komponen UI:**
- **Form Password:** Current password, new password, confirm password

**Navigasi:**
- Submit form untuk ganti password

---

### 5. Management Pages

#### 5.1 Companies

##### 5.1.1 Index (`Management/Companies/Index.tsx`)
**Tujuan:** Daftar semua perusahaan

**Komponen UI:**
- **Search Bar:** Pencarian perusahaan
- **Filter:** Filter berdasarkan status
- **Table:** Daftar perusahaan (name, address, phone, email, status)
- **Actions:** Edit, delete, view
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah perusahaan baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit/Show per item

##### 5.1.2 Create (`Management/Companies/Create.tsx`)
**Tujuan:** Tambah perusahaan baru

**Komponen UI:**
- **Form:** Name, address, phone, email, is_active
- **Validation:** Error messages

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.1.3 Edit (`Management/Companies/Edit.tsx`)
**Tujuan:** Edit data perusahaan

**Komponen UI:**
- **Form:** Pre-filled dengan data existing
- **Validation:** Error messages

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

#### 5.2 Plants

##### 5.2.1 Index (`Management/Plants/Index.tsx`)
**Tujuan:** Daftar semua plant/cabang

**Komponen UI:**
- **Search Bar:** Pencarian plant
- **Filter:** Filter berdasarkan company dan status
- **Table:** Daftar plant (company, name, address, phone, email, status)
- **Actions:** Edit, delete, view
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah plant baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit/Show per item

##### 5.2.2 Create (`Management/Plants/Create.tsx`)
**Tujuan:** Tambah plant baru

**Komponen UI:**
- **Form:** Company (dropdown), name, address, phone, email, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.2.3 Edit (`Management/Plants/Edit.tsx`)
**Tujuan:** Edit data plant

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.2.4 Show (`Management/Plants/Show.tsx`)
**Tujuan:** Detail plant

**Komponen UI:**
- **Info Cards:** Detail plant (name, address, phone, email, company)
- **Actions:** Edit, back to index
- **Related Data:** Departments, shifts, employee statuses

**Navigasi:**
- Link ke Edit
- Link kembali ke Index

#### 5.3 Departments

##### 5.3.1 Index (`Management/Departments/Index.tsx`)
**Tujuan:** Daftar semua departemen

**Komponen UI:**
- **Search Bar:** Pencarian departemen
- **Filter:** Filter berdasarkan company, plant, status
- **Table:** Daftar departemen (company, plant, name, description, status)
- **Actions:** Edit, delete, import
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah departemen baru
- **Import Button:** Import data

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item
- Link ke Import

##### 5.3.2 Create (`Management/Departments/Create.tsx`)
**Tujuan:** Tambah departemen baru

**Komponen UI:**
- **Form:** Company (dropdown), plant (dropdown), name, description, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.3.3 Edit (`Management/Departments/Edit.tsx`)
**Tujuan:** Edit data departemen

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.3.4 Import (`Management/Departments/Import.tsx`)
**Tujuan:** Import data departemen dari file Excel

**Komponen UI:**
- **File Upload:** Upload file Excel
- **Template Download:** Download template Excel
- **Preview:** Preview data yang akan diimport

**Navigasi:**
- Upload file
- Download template
- Preview data
- Submit import
- Cancel untuk kembali

#### 5.4 Users

##### 5.4.1 Index (`Management/Users/Index.tsx`)
**Tujuan:** Daftar semua user

**Komponen UI:**
- **Search Bar:** Pencarian user
- **Filter:** Filter berdasarkan company, plant, role, status
- **Table:** Daftar user (name, email, company, plant, role, status)
- **Actions:** Edit, delete
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah user baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item

##### 5.4.2 Create (`Management/Users/Create.tsx`)
**Tujuan:** Tambah user baru

**Komponen UI:**
- **Form:** Name, email, password, company (dropdown), plant (dropdown), role (dropdown), is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.4.3 Edit (`Management/Users/Edit.tsx`)
**Tujuan:** Edit data user

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

#### 5.5 Shifts

##### 5.5.1 Index (`Management/Shifts/Index.tsx`)
**Tujuan:** Daftar semua shift

**Komponen UI:**
- **Search Bar:** Pencarian shift
- **Filter:** Filter berdasarkan company, plant, status
- **Table:** Daftar shift (company, plant, name, start_time, end_time, status)
- **Actions:** Edit, delete
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah shift baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item

##### 5.5.2 Create (`Management/Shifts/Create.tsx`)
**Tujuan:** Tambah shift baru

**Komponen UI:**
- **Form:** Company (dropdown), plant (dropdown), name, start_time, end_time, description, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.5.3 Edit (`Management/Shifts/Edit.tsx`)
**Tujuan:** Edit data shift

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

#### 5.6 Employee Status

##### 5.6.1 Index (`Management/EmployeeStatus/Index.tsx`)
**Tujuan:** Daftar semua status karyawan

**Komponen UI:**
- **Search Bar:** Pencarian status karyawan
- **Filter:** Filter berdasarkan company, plant, status
- **Table:** Daftar status karyawan (company, plant, name, description, status)
- **Actions:** Edit, delete, view
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah status karyawan baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit/Show per item

##### 5.6.2 Create (`Management/EmployeeStatus/Create.tsx`)
**Tujuan:** Tambah status karyawan baru

**Komponen UI:**
- **Form:** Company (dropdown), plant (dropdown), name, description, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.6.3 Edit (`Management/EmployeeStatus/Edit.tsx`)
**Tujuan:** Edit data status karyawan

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.6.4 Show (`Management/EmployeeStatus/Show.tsx`)
**Tujuan:** Detail status karyawan

**Komponen UI:**
- **Info Cards:** Detail status karyawan (name, description, company, plant)
- **Actions:** Edit, back to index
- **Related Data:** Patient records dengan status ini

**Navigasi:**
- Link ke Edit
- Link kembali ke Index

#### 5.7 Guarantors

##### 5.7.1 Index (`Management/Guarantors/Index.tsx`)
**Tujuan:** Daftar semua penjamin

**Komponen UI:**
- **Search Bar:** Pencarian penjamin
- **Filter:** Filter berdasarkan status
- **Table:** Daftar penjamin (name, description, status)
- **Actions:** Edit, delete
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah penjamin baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item

##### 5.7.2 Create (`Management/Guarantors/Create.tsx`)
**Tujuan:** Tambah penjamin baru

**Komponen UI:**
- **Form:** Name, description, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.7.3 Edit (`Management/Guarantors/Edit.tsx`)
**Tujuan:** Edit data penjamin

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

#### 5.8 Diagnosa

##### 5.8.1 Index (`Management/Diagnosa/Index.tsx`)
**Tujuan:** Daftar semua diagnosa

**Komponen UI:**
- **Search Bar:** Pencarian diagnosa
- **Filter:** Filter berdasarkan status
- **Table:** Daftar diagnosa (code, name, status)
- **Actions:** Edit, delete, import
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah diagnosa baru
- **Import Button:** Import data

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item
- Link ke Import

##### 5.8.2 Create (`Management/Diagnosa/Create.tsx`)
**Tujuan:** Tambah diagnosa baru

**Komponen UI:**
- **Form:** Code, name, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.8.3 Edit (`Management/Diagnosa/Edit.tsx`)
**Tujuan:** Edit data diagnosa

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.8.4 Import (`Management/Diagnosa/Import.tsx`)
**Tujuan:** Import data diagnosa dari file Excel

**Komponen UI:**
- **File Upload:** Upload file Excel
- **Template Download:** Download template Excel
- **Preview:** Preview data yang akan diimport

**Navigasi:**
- Upload file
- Download template
- Preview data
- Submit import
- Cancel untuk kembali

#### 5.9 Lab Master

##### 5.9.1 Index (`Management/LabMaster/Index.tsx`)
**Tujuan:** Daftar semua master pemeriksaan lab

**Komponen UI:**
- **Search Bar:** Pencarian pemeriksaan lab
- **Filter:** Filter berdasarkan status
- **Table:** Daftar pemeriksaan lab (name, unit, price, status)
- **Actions:** Edit, delete, import
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah pemeriksaan lab baru
- **Import Button:** Import data

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item
- Link ke Import

##### 5.9.2 Create (`Management/LabMaster/Create.tsx`)
**Tujuan:** Tambah pemeriksaan lab baru

**Komponen UI:**
- **Form:** Name, unit, price, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.9.3 Edit (`Management/LabMaster/Edit.tsx`)
**Tujuan:** Edit data pemeriksaan lab

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.9.4 Import (`Management/LabMaster/Import.tsx`)
**Tujuan:** Import data pemeriksaan lab dari file Excel

**Komponen UI:**
- **File Upload:** Upload file Excel
- **Template Download:** Download template Excel
- **Preview:** Preview data yang akan diimport

**Navigasi:**
- Upload file
- Download template
- Preview data
- Submit import
- Cancel untuk kembali

#### 5.10 Inventory

##### 5.10.1 Index (`Management/Inventory/Index.tsx`)
**Tujuan:** Daftar semua barang inventori

**Komponen UI:**
- **Search Bar:** Pencarian barang
- **Filter:** Filter berdasarkan company, plant, category, status
- **Table:** Daftar barang (name, category, unit, price, stock, min_stock, status)
- **Actions:** Edit, delete, view, import, stock management
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah barang baru
- **Import Button:** Import data
- **Stock Management Buttons:** Add, Remove, Adjust, Waste

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit/Show per item
- Link ke Import
- Link ke stock management pages

##### 5.10.2 Create (`Management/Inventory/Create.tsx`)
**Tujuan:** Tambah barang baru

**Komponen UI:**
- **Form:** Company (dropdown), plant (dropdown), category (dropdown), unit (dropdown), name, description, price, stock, min_stock, is_active

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 5.10.3 Edit (`Management/Inventory/Edit.tsx`)
**Tujuan:** Edit data barang

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 5.10.4 Show (`Management/Inventory/Show.tsx`)
**Tujuan:** Detail barang

**Komponen UI:**
- **Info Cards:** Detail barang (name, description, category, unit, price, stock, min_stock)
- **Actions:** Edit, back to index, stock management
- **Stock History:** Riwayat pergerakan stok
- **Stock Management Buttons:** Add, Remove, Adjust, Waste

**Navigasi:**
- Link ke Edit
- Link kembali ke Index
- Link ke stock management pages

##### 5.10.5 Import (`Management/Inventory/Import.tsx`)
**Tujuan:** Import data barang dari file Excel

**Komponen UI:**
- **File Upload:** Upload file Excel
- **Template Download:** Download template Excel
- **Preview:** Preview data yang akan diimport

**Navigasi:**
- Upload file
- Download template
- Preview data
- Submit import
- Cancel untuk kembali

##### 5.10.6 Stock Management Pages
**Tujuan:** Manajemen stok barang

**Halaman:**
- **AddStock.tsx:** Tambah stok
- **RemoveStock.tsx:** Kurangi stok
- **AdjustStock.tsx:** Penyesuaian stok
- **WasteStock.tsx:** Stok rusak/hilang
- **StockHistory.tsx:** Riwayat stok per item
- **AllStockHistory.tsx:** Riwayat stok semua item

**Komponen UI:**
- **Form:** Item (dropdown), quantity, notes
- **Table:** Riwayat pergerakan stok
- **Filter:** Filter berdasarkan tipe pergerakan, tanggal, item

**Navigasi:**
- Submit form untuk operasi stok
- Filter dan search
- Pagination
- Link kembali ke Index

##### 5.10.7 Categories (`Management/Inventory/Categories.tsx`)
**Tujuan:** Manajemen kategori barang

**Komponen UI:**
- **Search Bar:** Pencarian kategori
- **Filter:** Filter berdasarkan company, plant, status
- **Table:** Daftar kategori (company, plant, name, description, status)
- **Actions:** Edit, delete
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah kategori baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item

##### 5.10.8 Units (`Management/Inventory/Units.tsx`)
**Tujuan:** Manajemen satuan barang

**Komponen UI:**
- **Search Bar:** Pencarian satuan
- **Filter:** Filter berdasarkan company, plant, status
- **Table:** Daftar satuan (company, plant, name, description, status)
- **Actions:** Edit, delete
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah satuan baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Edit per item

---

### 6. Service Pages

#### 6.1 Outpatient

##### 6.1.1 Index (`Service/Outpatient/Index.tsx`)
**Tujuan:** Daftar semua kunjungan rawat jalan

**Komponen UI:**
- **Search Bar:** Pencarian kunjungan
- **Filter:** Filter berdasarkan status, tanggal, patient
- **Table:** Daftar kunjungan (visit_number, patient_name, date, status)
- **Actions:** View, print
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah kunjungan baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Show/Print per item

##### 6.1.2 Create (`Service/Outpatient/Create.tsx`)
**Tujuan:** Tambah kunjungan rawat jalan baru

**Komponen UI:**
- **Form:** Patient (dropdown), visit_number (auto-generated)

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 6.1.3 Show (`Service/Outpatient/Show.tsx`)
**Tujuan:** Detail kunjungan rawat jalan

**Komponen UI:**
- **Info Cards:** Detail kunjungan (visit_number, patient, date, status)
- **Actions:** Edit, print, back to index
- **Related Data:** Medical records, prescriptions

**Navigasi:**
- Link ke Edit/Print
- Link kembali ke Index

##### 6.1.4 Print (`Service/Outpatient/Print.tsx`)
**Tujuan:** Cetak kunjungan rawat jalan

**Komponen UI:**
- **Print Layout:** Format cetak kunjungan
- **Print Button:** Cetak dokumen

**Navigasi:**
- Print dokumen
- Link kembali ke Show

#### 6.2 Consultation

##### 6.2.1 Index (`Service/Consultation/Index.tsx`)
**Tujuan:** Daftar semua konsultasi

**Komponen UI:**
- **Search Bar:** Pencarian konsultasi
- **Filter:** Filter berdasarkan status, doctor, patient, date
- **Table:** Daftar konsultasi (consultation_number, patient, doctor, date, status)
- **Actions:** View, edit
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah konsultasi baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Show/Edit per item

#### 6.3 Medical Records

##### 6.3.1 Index (`Service/MedicalRecords/Index.tsx`)
**Tujuan:** Daftar semua rekam medis

**Komponen UI:**
- **Search Bar:** Pencarian rekam medis
- **Filter:** Filter berdasarkan patient, doctor, date
- **Table:** Daftar rekam medis (patient, doctor, date, chief_complaint)
- **Actions:** View, edit
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah rekam medis baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Show/Edit per item

##### 6.3.2 Create (`Service/MedicalRecords/Create.tsx`)
**Tujuan:** Tambah rekam medis baru

**Komponen UI:**
- **Form:** Outpatient visit (dropdown), doctor (dropdown), chief_complaint, vital signs, physical examination

**Navigasi:**
- Submit form untuk create
- Cancel untuk kembali

##### 6.3.3 Edit (`Service/MedicalRecords/Edit.tsx`)
**Tujuan:** Edit rekam medis

**Komponen UI:**
- **Form:** Pre-filled dengan data existing

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 6.3.4 Edit New (`Service/MedicalRecords/EditNew.tsx`)
**Tujuan:** Edit rekam medis (versi baru dengan fitur lebih lengkap)

**Komponen UI:**
- **Form:** Pre-filled dengan data existing, lebih lengkap dari Edit.tsx

**Navigasi:**
- Submit form untuk update
- Cancel untuk kembali

##### 6.3.5 Show (`Service/MedicalRecords/Show.tsx`)
**Tujuan:** Detail rekam medis

**Komponen UI:**
- **Info Cards:** Detail rekam medis (patient, doctor, date, chief_complaint, vital signs)
- **Actions:** Edit, back to index
- **Related Data:** Diagnosis details, prescriptions

**Navigasi:**
- Link ke Edit
- Link kembali ke Index

#### 6.4 Lab

##### 6.4.1 Index (`Service/Lab/Index.tsx`)
**Tujuan:** Daftar semua pemeriksaan lab

**Komponen UI:**
- **Search Bar:** Pencarian pemeriksaan lab
- **Filter:** Filter berdasarkan status, patient, date
- **Table:** Daftar pemeriksaan lab (examination_number, patient, date, status)
- **Actions:** View, edit
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah pemeriksaan lab baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Show/Edit per item

#### 6.5 Lab Examination

##### 6.5.1 Index (`Service/LabExamination/Index.tsx`)
**Tujuan:** Daftar semua pemeriksaan lab (versi detail)

**Komponen UI:**
- **Search Bar:** Pencarian pemeriksaan lab
- **Filter:** Filter berdasarkan status, patient, date, ordered_by
- **Table:** Daftar pemeriksaan lab (examination_number, patient, department, ordered_by, date, status)
- **Actions:** View, edit
- **Pagination:** Navigasi halaman
- **Create Button:** Tambah pemeriksaan lab baru

**Navigasi:**
- Search dan filter
- Pagination
- Link ke Create/Show/Edit per item

---

## Kesimpulan

Aplikasi Medicare memiliki struktur halaman yang terorganisir dengan baik, terdiri dari:

1. **Dashboard** - Halaman utama dengan statistik dan grafik
2. **Authentication** - Sistem login/register yang lengkap
3. **Settings** - Pengaturan profil dan password
4. **Management** - Manajemen data master (companies, plants, users, dll)
5. **Service** - Layanan medis (outpatient, consultation, medical records, lab)
6. **Inventory** - Manajemen inventori yang komprehensif

Setiap halaman memiliki komponen UI yang konsisten dengan fitur search, filter, pagination, dan actions yang sesuai dengan fungsinya. 