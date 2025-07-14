<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class TestAuthorization extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:test {email} {permission?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test authorization system for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $permission = $this->argument('permission');

        $user = User::where('email', $email)->with(['role.permissions'])->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return 1;
        }

        $this->info("=== Authorization Test for User: {$user->name} ===");
        $this->line("Email: {$user->email}");
        $this->line("Role: " . ($user->role ? $user->role->display_name : 'No Role'));
        $this->line("Is Super Admin: " . ($user->isSuperAdmin() ? 'Yes' : 'No'));
        
        $this->line("\n=== Permissions ===");
        $permissions = $user->getAllPermissions();
        if ($permissions->count() > 0) {
            foreach ($permissions as $perm) {
                $this->line("- {$perm->name} ({$perm->module})");
            }
        } else {
            $this->line("No permissions assigned");
        }

        $this->line("\n=== Accessible Modules ===");
        $modules = $user->getAccessibleModules();
        if ($modules->count() > 0) {
            foreach ($modules as $module) {
                $this->line("- {$module}");
            }
        } else {
            $this->line("No modules accessible");
        }

        if ($permission) {
            $this->line("\n=== Testing Specific Permission ===");
            $hasPermission = $user->hasPermission($permission);
            $this->line("Permission '{$permission}': " . ($hasPermission ? 'GRANTED' : 'DENIED'));
        }

        return 0;
    }
} 