<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class GenerateAllPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:generate-all {--force : Force regenerate existing permissions} {--module= : Generate for specific module only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate all permissions for all modules';

    /**
     * Available modules
     */
    protected $availableModules = [
        'laboratorium',
        'inventory', 
        'pelayanan',
        'laporan',
        'admin',
        'manajemen'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        $specificModule = $this->option('module');

        $this->info("=== GENERATE ALL PERMISSIONS ===");

        // Jika ada module spesifik
        if ($specificModule) {
            if (!in_array($specificModule, $this->availableModules)) {
                $this->error("Module '{$specificModule}' tidak dikenali!");
                $this->line("Module yang tersedia: " . implode(', ', $this->availableModules));
                return 1;
            }
            $modules = [$specificModule];
        } else {
            $modules = $this->availableModules;
        }

        $totalCreated = 0;
        $totalUpdated = 0;

        // Deteksi jika dijalankan dari web (tidak ada STDIN)
        $isWeb = !defined('STDIN');
        
        foreach ($modules as $module) {
            $this->line("\n--- Processing Module: {$module} ---");
            
            // Panggil command GeneratePermissionModule
            $command = $this->getApplication()->find('permission:generate');
            $arguments = [
                'module' => $module,
                '--force' => $force
            ];
            // Jika dari web, selalu force agar tidak interaktif
            if ($isWeb) {
                $arguments['--force'] = true;
            }
            
            $returnCode = $command->run(new \Symfony\Component\Console\Input\ArrayInput($arguments), $this->getOutput());
            
            if ($returnCode === 0) {
                $this->line("✓ Module {$module} processed successfully");
            } else {
                $this->error("✗ Error processing module {$module}");
            }
        }

        // Summary
        $this->info("\n=== FINAL SUMMARY ===");
        $this->line("Total permissions in database: " . Permission::count());
        $this->line("Total roles: " . Role::count());
        
        // Show permissions by module
        $permissionsByModule = Permission::select('module', DB::raw('count(*) as total'))
            ->groupBy('module')
            ->orderBy('module')
            ->get();
            
        $this->line("\nPermissions by module:");
        foreach ($permissionsByModule as $module) {
            $this->line("  - {$module->module}: {$module->total} permissions");
        }

        // Show super admin permissions
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $this->line("\nSuper Admin permissions: " . $superAdminRole->permissions->count());
        }

        $this->info("\nPermission generation completed!");

        return 0;
    }
} 