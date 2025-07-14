# Medicare - Aplikasi Rekam Medis Elektronik

## 📋 Deskripsi

Medicare adalah aplikasi Analisa & Rekam Medis Elektronik yang dikembangkan untuk memenuhi kebutuhan InHouse Clinic di perusahaan. Aplikasi ini menyediakan solusi komprehensif untuk manajemen data kesehatan karyawan, pelayanan medis, dan pelaporan statistik kesehatan.

## 🛠️ Tech Stack

### Backend 
- **Framework:** Laravel 12.x
- **PHP Version:** PHP 8.2+

### Frontend 
- **Framework:** React 19
- **Language:** TypeScript
- **State Management:** Inertia.js

### Styling & UI 
- **CSS Framework:** Tailwind CSS
- **UI Components:** shadcn/ui based on Radix UI

### Build Tool 
- **Bundler:** Vite

### Database 
- **RDBMS:** MySQL 8.0+

### Authentication 
- **Auth System:** Laravel Breeze

## 🔧 Installation & Setup

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- NPM/Yarn

### Installation Steps
```bash
# Clone repository
git clone https://github.com/airei/medicare.git
cd medicare

# nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh
npm install 22

#

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup (choose one method)

# Method 1: Quick setup using script (Linux/Mac)
chmod +x setup-database.sh
./setup-database.sh

# Method 2: Quick setup using script (Windows PowerShell)
.\setup-database.ps1

# Method 3: Manual setup
php artisan migrate:fresh
php artisan db:seed

# Build assets
npm run build

# Start servers
php artisan serve
npm run dev
```

### Environment Configuration
```env
APP_NAME="Medicare"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medicare
DB_USERNAME=root
DB_PASSWORD=
```

### 🆕 Database Seeding
```bash
# Run all seeders (includes updated data)
php artisan db:seed

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

## 👥 User Roles & Permissions


## dashboard

terdapat 5 keymetric berupa aktifitas dan statistik berupa x dan grafik dengan 3 tab dengan keterangan overview, demografi, dan operasional.

untuk tab overview berupa kombinasi chart area dan line berupa kunjungan pasien laki-laki dan perempuan dalam satu tahun dengan filter jenis pelayanan, penjamin, shift, status karyawan, dan departemen.

untuk tab demografi berisi data perbulan
- 10 diagnosa terbanyak (donut chart)
- jenis kelamin (stack chart)
- kelompok usia <40 dan >=40 (pie chart)
- shift (car chart)
- departemen (column chart)
- status karyawan (bar chart)

untuk tab operasional
- 20 pengeluaran obat terbanyak (bar/column chart)
- pemeriksaan lab terbanyak