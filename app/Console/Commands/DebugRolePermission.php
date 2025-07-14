<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class DebugRolePermission extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:role-permission';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug role and permission system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("=== DEBUG ROLE & PERMISSION SYSTEM ===");
        
        // Check Roles
        $this->line("\n=== ROLES ===");
        $roles = Role::with('permissions')->get();
        foreach ($roles as $role) {
            $this->line("Role: {$role->name} ({$role->display_name})");
            $this->line("  - Active: " . ($role->is_active ? 'Yes' : 'No'));
            $this->line("  - Permissions: {$role->permissions->count()}");
            if ($role->permissions->count() > 0) {
                foreach ($role->permissions as $perm) {
                    $this->line("    * {$perm->name} ({$perm->module})");
                }
            }
            $this->line("");
        }

        // Check Permissions
        $this->line("=== PERMISSIONS ===");
        $permissions = Permission::orderBy('module')->orderBy('name')->get();
        $modules = $permissions->groupBy('module');
        foreach ($modules as $module => $perms) {
            $this->line("Module: {$module}");
            foreach ($perms as $perm) {
                $this->line("  - {$perm->name} ({$perm->display_name})");
            }
            $this->line("");
        }

        // Check Users
        $this->line("=== USERS ===");
        $users = User::with(['role.permissions'])->get();
        foreach ($users as $user) {
            $this->line("User: {$user->name} ({$user->email})");
            if ($user->role) {
                $this->line("  - Role: {$user->role->name} ({$user->role->display_name})");
                $this->line("  - Permissions: {$user->role->permissions->count()}");
                $this->line("  - Modules: " . implode(', ', $user->getAccessibleModules()->toArray()));
            } else {
                $this->line("  - No role assigned");
            }
            $this->line("");
        }

        // Check Role_Permissions table
        $this->line("=== ROLE_PERMISSIONS TABLE ===");
        $rolePermissions = \DB::table('role_permissions')->get();
        $this->line("Total role_permissions records: {$rolePermissions->count()}");
        
        if ($rolePermissions->count() > 0) {
            foreach ($rolePermissions as $rp) {
                $role = Role::find($rp->role_id);
                $permission = Permission::find($rp->permission_id);
                $this->line("  - Role: " . ($role ? $role->name : 'Unknown') . 
                           " | Permission: " . ($permission ? $permission->name : 'Unknown'));
            }
        }

        return 0;
    }
} 