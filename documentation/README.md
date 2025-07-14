# Medicare - Aplikasi Rekam Medis Elektronik

## 📋 Deskripsi

Medicare adalah aplikasi Analisa & Rekam Medis Elektronik yang dikembangkan untuk memenuhi kebutuhan InHouse Clinic di perusahaan. Aplikasi ini menyediakan solusi komprehensif untuk manajemen data kesehatan karyawan, pelayanan medis, dan pelaporan statistik kesehatan.

## 🛠️ Tech Stack

### Backend 
- **Framework:** Laravel 11.x
- **PHP Version:** PHP 8.2+
- **Excel Processing:** Maatwebsite Excel (MaatExcel)

### Frontend 
- **Framework:** React 19
- **Language:** TypeScript
- **State Management:** Inertia.js

### Styling & UI 
- **CSS Framework:** Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Charting:** Recharts
- **Notification/Toast:** Sonner

### Build Tool 
- **Bundler:** Vite

### Database 
- **RDBMS:** MySQL 8.0+

### Authentication 
- **Auth System:** Laravel Breeze

## Color picker

- (Pastel Color 1)[https://www.color-hex.com/color-palette/6006]
- (Pastel Color 2)[https://www.color-hex.com/color-palette/28564]

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
