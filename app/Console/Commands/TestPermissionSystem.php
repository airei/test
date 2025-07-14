<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TestPermissionSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:test {--user= : Test specific user} {--role= : Test specific role} {--module= : Test specific module}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Comprehensive test of the permission system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $specificUser = $this->option('user');
        $specificRole = $this->option('role');
        $specificModule = $this->option('module');

        $this->info("=== COMPREHENSIVE PERMISSION SYSTEM TEST ===");

        // Test 1: Database Structure
        $this->testDatabaseStructure();

        // Test 2: Permission Generation
        $this->testPermissionGeneration();

        // Test 3: Role Management
        $this->testRoleManagement($specificRole);

        // Test 4: User Permissions
        $this->testUserPermissions($specificUser);

        // Test 5: Module Access
        $this->testModuleAccess($specificModule);

        // Test 6: Permission Validation
        $this->testPermissionValidation();

        // Test 7: Performance Test
        $this->testPerformance();

        $this->info("\n=== TEST COMPLETED ===");
        return 0;
    }

    /**
     * Test database structure
     */
    private function testDatabaseStructure()
    {
        $this->line("\n--- Test 1: Database Structure ---");

        // Check tables exist
        $tables = ['permissions', 'roles', 'role_permissions', 'users'];
        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $this->line("✓ Table '{$table}' exists");
            } else {
                $this->error("✗ Table '{$table}' missing");
            }
        }

        // Check foreign keys
        $foreignKeys = [
            'role_permissions.role_id' => 'roles.id',
            'role_permissions.permission_id' => 'permissions.id',
            'users.role_id' => 'roles.id',
        ];

        foreach ($foreignKeys as $fk => $pk) {
            try {
                DB::select("SELECT 1 FROM {$fk} LIMIT 1");
                $this->line("✓ Foreign key '{$fk}' valid");
            } catch (\Exception $e) {
                $this->error("✗ Foreign key '{$fk}' invalid");
            }
        }

        // Check indexes
        $indexes = [
            'permissions.name' => 'permissions',
            'permissions.module' => 'permissions',
            'roles.name' => 'roles',
        ];

        foreach ($indexes as $index => $table) {
            try {
                DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$index}'");
                $this->line("✓ Index '{$index}' exists");
            } catch (\Exception $e) {
                $this->warn("~ Index '{$index}' may not exist");
            }
        }
    }

    /**
     * Test permission generation
     */
    private function testPermissionGeneration()
    {
        $this->line("\n--- Test 2: Permission Generation ---");

        $totalPermissions = Permission::count();
        $this->line("Total permissions: {$totalPermissions}");

        if ($totalPermissions === 0) {
            $this->warn("~ No permissions found. Run 'php artisan permission:generate-all' first.");
            return;
        }

        // Check permission structure
        $samplePermission = Permission::first();
        $requiredFields = ['name', 'display_name', 'description', 'module'];
        
        foreach ($requiredFields as $field) {
            if (isset($samplePermission->$field)) {
                $this->line("✓ Permission field '{$field}' exists");
            } else {
                $this->error("✗ Permission field '{$field}' missing");
            }
        }

        // Check permission naming convention
        $invalidPermissions = Permission::whereRaw("name NOT LIKE '%.%'")->get();
        if ($invalidPermissions->count() > 0) {
            $this->warn("~ Found {$invalidPermissions->count()} permissions with invalid naming convention");
            foreach ($invalidPermissions as $perm) {
                $this->line("  - {$perm->name}");
            }
        } else {
            $this->line("✓ All permissions follow naming convention");
        }

        // Check modules
        $modules = Permission::distinct()->pluck('module')->sort();
        $this->line("Available modules: " . $modules->implode(', '));
    }

    /**
     * Test role management
     */
    private function testRoleManagement($specificRole)
    {
        $this->line("\n--- Test 3: Role Management ---");

        $roles = $specificRole ? Role::where('name', $specificRole)->get() : Role::all();
        
        if ($roles->isEmpty()) {
            $this->error("✗ No roles found");
            return;
        }

        $this->line("Total roles: {$roles->count()}");

        foreach ($roles as $role) {
            $this->line("\nRole: {$role->name} ({$role->display_name})");
            $this->line("  - Active: " . ($role->is_active ? 'Yes' : 'No'));
            $this->line("  - Permissions: {$role->permissions->count()}");
            
            if ($role->permissions->count() > 0) {
                $modules = $role->permissions->pluck('module')->unique();
                $this->line("  - Modules: " . $modules->implode(', '));
            }

            // Test super admin
            if ($role->name === 'super_admin') {
                $allPermissions = Permission::count();
                if ($role->permissions->count() === $allPermissions) {
                    $this->line("  ✓ Super admin has all permissions");
                } else {
                    $this->warn("  ~ Super admin missing " . ($allPermissions - $role->permissions->count()) . " permissions");
                }
            }
        }
    }

    /**
     * Test user permissions
     */
    private function testUserPermissions($specificUser)
    {
        $this->line("\n--- Test 4: User Permissions ---");

        $users = $specificUser ? User::where('email', $specificUser)->get() : User::all();
        
        if ($users->isEmpty()) {
            $this->error("✗ No users found");
            return;
        }

        $this->line("Total users: {$users->count()}");

        foreach ($users as $user) {
            $this->line("\nUser: {$user->name} ({$user->email})");
            
            if ($user->role) {
                $this->line("  - Role: {$user->role->name} ({$user->role->display_name})");
                $this->line("  - Is Super Admin: " . ($user->isSuperAdmin() ? 'Yes' : 'No'));
                $this->line("  - Permissions: " . $user->getAllPermissions()->count());
                $this->line("  - Modules: " . $user->getAccessibleModules()->implode(', '));
                
                // Test specific permissions
                $testPermissions = ['laboratorium.view', 'admin.manage_users', 'pelayanan.create'];
                foreach ($testPermissions as $permission) {
                    $hasPermission = $user->hasPermission($permission);
                    $status = $hasPermission ? '✓' : '✗';
                    $this->line("  - {$status} {$permission}");
                }
            } else {
                $this->warn("  ~ No role assigned");
            }
        }
    }

    /**
     * Test module access
     */
    private function testModuleAccess($specificModule)
    {
        $this->line("\n--- Test 5: Module Access ---");

        $modules = $specificModule ? [$specificModule] : Permission::distinct()->pluck('module')->toArray();
        
        foreach ($modules as $module) {
            $this->line("\nModule: {$module}");
            
            $permissions = Permission::where('module', $module)->get();
            $this->line("  - Permissions: {$permissions->count()}");
            
            // Check default permissions
            $defaultPermissions = ['view', 'create', 'edit', 'delete'];
            foreach ($defaultPermissions as $perm) {
                $exists = $permissions->where('name', "{$module}.{$perm}")->count() > 0;
                $status = $exists ? '✓' : '✗';
                $this->line("  - {$status} {$module}.{$perm}");
            }

            // Check users with access
            $usersWithAccess = User::whereHas('role.permissions', function($query) use ($module) {
                $query->where('module', $module);
            })->orWhereHas('role', function($query) {
                $query->where('name', 'super_admin');
            })->count();
            
            $this->line("  - Users with access: {$usersWithAccess}");
        }
    }

    /**
     * Test permission validation
     */
    private function testPermissionValidation()
    {
        $this->line("\n--- Test 6: Permission Validation ---");

        // Test helper functions
        $user = auth()->user();
        if ($user) {
            $this->line("Current user: {$user->name}");
            $this->line("  - Is super admin: " . (is_super_admin() ? 'Yes' : 'No'));
            $this->line("  - User permissions: " . get_user_permissions()->count());
            $this->line("  - User modules: " . get_user_modules()->implode(', '));
        } else {
            $this->warn("~ No authenticated user");
        }

        // Test permission checks
        $testCases = [
            ['user' => 'admin@example.com', 'permission' => 'laboratorium.view', 'expected' => true],
            ['user' => 'user@example.com', 'permission' => 'admin.manage_users', 'expected' => false],
        ];

        foreach ($testCases as $testCase) {
            $user = User::where('email', $testCase['user'])->first();
            if ($user) {
                $hasPermission = $user->hasPermission($testCase['permission']);
                $status = ($hasPermission === $testCase['expected']) ? '✓' : '✗';
                $this->line("  - {$status} {$testCase['user']} -> {$testCase['permission']} (expected: " . ($testCase['expected'] ? 'true' : 'false') . ", got: " . ($hasPermission ? 'true' : 'false') . ")");
            }
        }
    }

    /**
     * Test performance
     */
    private function testPerformance()
    {
        $this->line("\n--- Test 7: Performance Test ---");

        $startTime = microtime(true);
        
        // Test permission loading
        $users = User::with(['role.permissions'])->get();
        $permissionLoadTime = microtime(true) - $startTime;
        
        $this->line("Permission loading time: " . number_format($permissionLoadTime * 1000, 2) . "ms");

        // Test permission checking
        $startTime = microtime(true);
        $checkCount = 0;
        
        foreach ($users as $user) {
            for ($i = 0; $i < 10; $i++) {
                $user->hasPermission('laboratorium.view');
                $checkCount++;
            }
        }
        
        $checkTime = microtime(true) - $startTime;
        $this->line("Permission check time: " . number_format($checkTime * 1000, 2) . "ms for {$checkCount} checks");
        $this->line("Average check time: " . number_format(($checkTime / $checkCount) * 1000, 4) . "ms per check");

        // Test database queries
        $queryCount = DB::getQueryLog() ? count(DB::getQueryLog()) : 0;
        $this->line("Total database queries: {$queryCount}");
    }
} 