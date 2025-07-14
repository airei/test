<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AddInventoryPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:add-inventory';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add inventory export and import permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Adding inventory permissions...');

        // Get super admin role
        $superAdminRole = DB::table('roles')->where('name', 'super_admin')->first();
        if (!$superAdminRole) {
            $this->error('Super admin role not found!');
            return 1;
        }

        // Get super admin user
        $superAdminUser = DB::table('users')->where('role_id', $superAdminRole->id)->first();
        if (!$superAdminUser) {
            $this->error('Super admin user not found!');
            return 1;
        }

        // Check if permissions already exist
        $existingPermissions = DB::table('permissions')
            ->whereIn('name', ['export inventory', 'import inventory'])
            ->get();

        if ($existingPermissions->count() > 0) {
            $this->warn('Inventory permissions already exist!');
            return 0;
        }

        // Create inventory permissions
        $inventoryPermissions = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'export inventory',
                'display_name' => 'Export Data Inventory',
                'description' => 'Akses untuk export data inventory',
                'module' => 'inventory',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'import inventory',
                'display_name' => 'Import Data Inventory',
                'description' => 'Akses untuk import data inventory',
                'module' => 'inventory',
            ],
        ];

        foreach ($inventoryPermissions as $permission) {
            DB::table('permissions')->insert([
                'id' => $permission['id'],
                'name' => $permission['name'],
                'display_name' => $permission['display_name'],
                'description' => $permission['description'],
                'module' => $permission['module'],
                'created_by' => $superAdminUser->id,
                'updated_by' => $superAdminUser->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign permission to super admin
            DB::table('role_permissions')->insert([
                'role_id' => $superAdminRole->id,
                'permission_id' => $permission['id'],
                'created_by' => $superAdminUser->id,
                'updated_by' => $superAdminUser->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info("Added permission: {$permission['name']}");
        }

        $this->info('Inventory permissions added successfully!');
        return 0;
    }
} 