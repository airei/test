<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MedicareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Role super_admin
        $roleId = (string) Str::uuid();
        DB::table('roles')->insert([
            'id' => $roleId,
            'name' => 'super_admin',
            'display_name' => 'Super Administrator',
            'description' => 'Super administrator dengan akses penuh',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. User super admin (company_id dan plant_id harus null)
        $userId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'company_id' => null,
            'plant_id' => null,
            'role_id' => $roleId,
            'name' => 'Super Administrator',
            'email' => 'admin@medicare.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'is_active' => true,
            'remember_token' => null,
            'created_by' => null,
            'updated_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Permission module untuk melihat semua halaman
        $permissionId = (string) Str::uuid();
        DB::table('permissions')->insert([
            'id' => $permissionId,
            'name' => 'all.view',
            'display_name' => 'Lihat Semua Halaman',
            'description' => 'Akses untuk melihat semua halaman',
            'module' => 'all',
            'created_by' => $userId,
            'updated_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Role permission
        DB::table('role_permissions')->insert([
            'role_id' => $roleId,
            'permission_id' => $permissionId,
            'created_by' => $userId,
            'updated_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Seeder MedicareSeeder selesai. Super Admin: admin@medicare.com / admin123');
    }
}
