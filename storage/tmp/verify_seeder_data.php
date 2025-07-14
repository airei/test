<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Database\Schema\Blueprint;

// Setup database connection
$capsule = new DB;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'medicare',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== VERIFIKASI DATA SEEDER ===\n\n";

// 1. Verifikasi Role
echo "1. ROLE:\n";
$roles = DB::table('roles')->get();
foreach ($roles as $role) {
    echo "   - {$role->display_name} ({$role->name}): {$role->description}\n";
}
echo "   Total: " . count($roles) . " role\n\n";

// 2. Verifikasi Company
echo "2. COMPANY:\n";
$companies = DB::table('companies')->get();
foreach ($companies as $company) {
    echo "   - {$company->name}\n";
    
    // Plant untuk setiap company
    $plants = DB::table('plants')->where('company_id', $company->id)->get();
    foreach ($plants as $plant) {
        echo "     * {$plant->name}\n";
    }
}
echo "   Total: " . count($companies) . " company\n\n";

// 3. Verifikasi User
echo "3. USER:\n";
$users = DB::table('users')
    ->leftJoin('companies', 'users.company_id', '=', 'companies.id')
    ->leftJoin('plants', 'users.plant_id', '=', 'plants.id')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.*', 'companies.name as company_name', 'plants.name as plant_name', 'roles.display_name as role_name')
    ->get();

foreach ($users as $user) {
    $location = $user->company_name ? "{$user->company_name} - {$user->plant_name}" : "Super Admin (No Company/Plant)";
    echo "   - {$user->name} ({$user->email})\n";
    echo "     Role: {$user->role_name}\n";
    echo "     Location: {$location}\n";
    echo "     Company ID: " . ($user->company_id ?? 'null') . "\n";
    echo "     Plant ID: " . ($user->plant_id ?? 'null') . "\n\n";
}
echo "   Total: " . count($users) . " user\n\n";

// 4. Verifikasi Super Admin
echo "4. SUPER ADMIN VERIFICATION:\n";
$superAdmin = DB::table('users')
    ->join('roles', 'users.role_id', '=', 'roles.id')
    ->where('roles.name', 'super_admin')
    ->select('users.*', 'roles.display_name as role_name')
    ->first();

if ($superAdmin) {
    echo "   ✓ Super Admin ditemukan: {$superAdmin->name}\n";
    echo "   ✓ Email: {$superAdmin->email}\n";
    echo "   ✓ Company ID: " . ($superAdmin->company_id ?? 'null') . "\n";
    echo "   ✓ Plant ID: " . ($superAdmin->plant_id ?? 'null') . "\n";
    
    if ($superAdmin->company_id === null && $superAdmin->plant_id === null) {
        echo "   ✅ PASSED: Super Admin memiliki company_id dan plant_id = null\n";
    } else {
        echo "   ❌ FAILED: Super Admin harus memiliki company_id dan plant_id = null\n";
    }
} else {
    echo "   ❌ Super Admin tidak ditemukan\n";
}
echo "\n";

// 5. Verifikasi Diagnosa
echo "5. DIAGNOSA:\n";
$diagnoses = DB::table('diagnosas')->get();
foreach ($diagnoses as $diagnosis) {
    echo "   - {$diagnosis->code}: {$diagnosis->name}\n";
}
echo "   Total: " . count($diagnoses) . " diagnosa\n\n";

// 6. Summary
echo "=== SUMMARY ===\n";
echo "✓ Role: " . count($roles) . " (termasuk super_admin + 5 role baru)\n";
echo "✓ Company: " . count($companies) . " (3 perusahaan)\n";
echo "✓ Plant: " . DB::table('plants')->count() . " (total plant)\n";
echo "✓ User: " . count($users) . " (1 super admin + 6 user perusahaan)\n";
echo "✓ Diagnosa: " . count($diagnoses) . " (ICD-10)\n";
echo "✓ Super Admin: company_id dan plant_id = null\n\n";

echo "=== CREDENTIAL LIST ===\n";
echo "Super Admin:\n";
echo "  Email: admin@medicare.com\n";
echo "  Password: admin123\n\n";

echo "User Perusahaan:\n";
foreach ($users as $user) {
    if ($user->role_name !== 'Super Administrator') {
        echo "  {$user->name} ({$user->role_name}):\n";
        echo "    Email: {$user->email}\n";
        echo "    Password: " . ($user->role_name === 'Dokter' ? 'doctor123' : 
                                ($user->role_name === 'Admin' ? 'admin123' : 
                                ($user->role_name === 'Paramedics' ? 'paramedics123' : 'manager123'))) . "\n";
        echo "    Company: " . ($user->company_name ?? 'N/A') . "\n\n";
    }
}

echo "Seeder verification completed!\n"; 