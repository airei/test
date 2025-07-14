<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncRolePermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:sync-roles {--role= : Sync specific role only} {--force : Force sync all permissions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync permissions with existing roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $specificRole = $this->option('role');
        $force = $this->option('force');

        $this->info("=== SYNC ROLE PERMISSIONS ===");

        // Get roles to process
        if ($specificRole) {
            $roles = Role::where('name', $specificRole)->get();
            if ($roles->isEmpty()) {
                $this->error("Role '{$specificRole}' tidak ditemukan!");
                return 1;
            }
        } else {
            $roles = Role::all();
        }

        $totalAssigned = 0;
        $totalRemoved = 0;

        foreach ($roles as $role) {
            $this->line("\n--- Processing Role: {$role->name} ({$role->display_name}) ---");
            
            $assignedCount = 0;
            $removedCount = 0;

            // Get all permissions
            $allPermissions = Permission::all();
            
            if ($role->name === 'super_admin') {
                // Super admin gets all permissions
                foreach ($allPermissions as $permission) {
                    if (!$role->permissions->contains($permission->id)) {
                        $role->permissions()->attach($permission->id, [
                            'created_by' => null,
                            'updated_by' => null
                        ]);
                        $assignedCount++;
                        $this->line("✓ Assigned: {$permission->name}");
                    }
                }
            } else {
                // For other roles, ask user what to do
                if ($force) {
                    // Remove all existing permissions
                    $existingPermissions = $role->permissions;
                    foreach ($existingPermissions as $permission) {
                        $role->permissions()->detach($permission->id);
                        $removedCount++;
                        $this->line("- Removed: {$permission->name}");
                    }
                    
                    // Ask which modules to assign
                    $this->line("\nAvailable modules:");
                    $modules = $allPermissions->pluck('module')->unique()->values();
                    foreach ($modules as $index => $module) {
                        $this->line("  {$index}: {$module}");
                    }
                    
                    $selectedModules = $this->ask("Enter module numbers to assign (comma-separated, or 'all'):");
                    
                    if ($selectedModules === 'all') {
                        $selectedModules = $modules->toArray();
                    } else {
                        $selectedModules = array_map('trim', explode(',', $selectedModules));
                        $selectedModules = array_map(function($index) use ($modules) {
                            return $modules[$index] ?? null;
                        }, $selectedModules);
                        $selectedModules = array_filter($selectedModules);
                    }
                    
                    // Assign permissions for selected modules
                    foreach ($selectedModules as $module) {
                        $modulePermissions = $allPermissions->where('module', $module);
                        foreach ($modulePermissions as $permission) {
                            $role->permissions()->attach($permission->id, [
                                'created_by' => null,
                                'updated_by' => null
                            ]);
                            $assignedCount++;
                            $this->line("✓ Assigned: {$permission->name}");
                        }
                    }
                } else {
                    // Show current permissions and ask for changes
                    $this->line("Current permissions:");
                    if ($role->permissions->count() > 0) {
                        foreach ($role->permissions as $permission) {
                            $this->line("  - {$permission->name} ({$permission->module})");
                        }
                    } else {
                        $this->line("  No permissions assigned");
                    }
                    
                    if ($this->confirm("Do you want to modify permissions for role '{$role->name}'?")) {
                        // Interactive permission management
                        $this->manageRolePermissions($role, $allPermissions);
                    }
                }
            }

            $totalAssigned += $assignedCount;
            $totalRemoved += $removedCount;
            
            $this->line("Role '{$role->name}': {$assignedCount} assigned, {$removedCount} removed");
        }

        // Summary
        $this->info("\n=== SYNC SUMMARY ===");
        $this->line("Total permissions assigned: {$totalAssigned}");
        $this->line("Total permissions removed: {$totalRemoved}");
        $this->line("Total roles processed: " . $roles->count());

        // Show role permissions summary
        $this->line("\nRole permissions summary:");
        foreach ($roles as $role) {
            $this->line("  - {$role->name}: {$role->permissions->count()} permissions");
        }

        $this->info("\nRole permission sync completed!");

        return 0;
    }

    /**
     * Interactive permission management for a role
     */
    private function manageRolePermissions($role, $allPermissions)
    {
        $modules = $allPermissions->pluck('module')->unique()->values();
        
        while (true) {
            $this->line("\nOptions:");
            $this->line("  1. Add module permissions");
            $this->line("  2. Remove module permissions");
            $this->line("  3. Show current permissions");
            $this->line("  4. Done");
            
            $choice = $this->ask("Choose option (1-4):");
            
            switch ($choice) {
                case '1':
                    $this->addModulePermissions($role, $allPermissions, $modules);
                    break;
                case '2':
                    $this->removeModulePermissions($role, $modules);
                    break;
                case '3':
                    $this->showRolePermissions($role);
                    break;
                case '4':
                    return;
                default:
                    $this->error("Invalid choice!");
            }
        }
    }

    /**
     * Add module permissions to role
     */
    private function addModulePermissions($role, $allPermissions, $modules)
    {
        $this->line("\nAvailable modules:");
        foreach ($modules as $index => $module) {
            $this->line("  {$index}: {$module}");
        }
        
        $selectedModules = $this->ask("Enter module numbers to add (comma-separated):");
        $selectedModules = array_map('trim', explode(',', $selectedModules));
        
        foreach ($selectedModules as $index) {
            if (isset($modules[$index])) {
                $module = $modules[$index];
                $modulePermissions = $allPermissions->where('module', $module);
                
                foreach ($modulePermissions as $permission) {
                    if (!$role->permissions->contains($permission->id)) {
                        $role->permissions()->attach($permission->id, [
                            'created_by' => null,
                            'updated_by' => null
                        ]);
                        $this->line("✓ Added: {$permission->name}");
                    }
                }
            }
        }
    }

    /**
     * Remove module permissions from role
     */
    private function removeModulePermissions($role, $modules)
    {
        $currentModules = $role->permissions->pluck('module')->unique()->values();
        
        if ($currentModules->isEmpty()) {
            $this->line("No permissions to remove");
            return;
        }
        
        $this->line("\nCurrent modules:");
        foreach ($currentModules as $index => $module) {
            $this->line("  {$index}: {$module}");
        }
        
        $selectedModules = $this->ask("Enter module numbers to remove (comma-separated):");
        $selectedModules = array_map('trim', explode(',', $selectedModules));
        
        foreach ($selectedModules as $index) {
            if (isset($currentModules[$index])) {
                $module = $currentModules[$index];
                $modulePermissions = $role->permissions->where('module', $module);
                
                foreach ($modulePermissions as $permission) {
                    $role->permissions()->detach($permission->id);
                    $this->line("- Removed: {$permission->name}");
                }
            }
        }
    }

    /**
     * Show current role permissions
     */
    private function showRolePermissions($role)
    {
        $this->line("\nCurrent permissions for role '{$role->name}':");
        if ($role->permissions->count() > 0) {
            $permissionsByModule = $role->permissions->groupBy('module');
            foreach ($permissionsByModule as $module => $permissions) {
                $this->line("  {$module}:");
                foreach ($permissions as $permission) {
                    $this->line("    - {$permission->name}");
                }
            }
        } else {
            $this->line("  No permissions assigned");
        }
    }
} 