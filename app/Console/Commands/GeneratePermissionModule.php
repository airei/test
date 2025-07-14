<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class GeneratePermissionModule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:generate {module} {--force : Force regenerate existing permissions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate permissions for a specific module';

    /**
     * Default permissions for each module
     */
    protected $defaultPermissions = [
        'view' => [
            'name' => 'view',
            'display_name' => 'View',
            'description' => 'Akses untuk melihat data'
        ],
        'create' => [
            'name' => 'create',
            'display_name' => 'Create',
            'description' => 'Akses untuk membuat data baru'
        ],
        'edit' => [
            'name' => 'edit',
            'display_name' => 'Edit',
            'description' => 'Akses untuk mengedit data'
        ],
        'delete' => [
            'name' => 'delete',
            'display_name' => 'Delete',
            'description' => 'Akses untuk menghapus data'
        ],
        'export' => [
            'name' => 'export',
            'display_name' => 'Export',
            'description' => 'Akses untuk export data'
        ],
        'import' => [
            'name' => 'import',
            'display_name' => 'Import',
            'description' => 'Akses untuk import data'
        ],
        'toggle_status' => [
            'name' => 'toggle_status',
            'display_name' => 'Toggle Status',
            'description' => 'Akses untuk mengubah status data'
        ],
    ];

    /**
     * Module-specific permissions
     */
    protected $moduleSpecificPermissions = [
        'laboratorium' => [
            'add_stock' => [
                'name' => 'add_stock',
                'display_name' => 'Add Stock',
                'description' => 'Akses untuk menambah stok'
            ],
            'reduce_stock' => [
                'name' => 'reduce_stock',
                'display_name' => 'Reduce Stock',
                'description' => 'Akses untuk mengurangi stok'
            ],
            'adjust_stock' => [
                'name' => 'adjust_stock',
                'display_name' => 'Adjust Stock',
                'description' => 'Akses untuk menyesuaikan stok'
            ],
            'view_stock_history' => [
                'name' => 'view_stock_history',
                'display_name' => 'View Stock History',
                'description' => 'Akses untuk melihat riwayat stok'
            ],
        ],
        'inventory' => [
            'add_stock' => [
                'name' => 'add_stock',
                'display_name' => 'Add Stock',
                'description' => 'Akses untuk menambah stok'
            ],
            'reduce_stock' => [
                'name' => 'reduce_stock',
                'display_name' => 'Reduce Stock',
                'description' => 'Akses untuk mengurangi stok'
            ],
            'adjust_stock' => [
                'name' => 'adjust_stock',
                'display_name' => 'Adjust Stock',
                'description' => 'Akses untuk menyesuaikan stok'
            ],
            'view_stock_history' => [
                'name' => 'view_stock_history',
                'display_name' => 'View Stock History',
                'description' => 'Akses untuk melihat riwayat stok'
            ],
        ],
        'pelayanan' => [
            'registrasi' => [
                'name' => 'registrasi',
                'display_name' => 'Registrasi',
                'description' => 'Akses untuk registrasi pasien'
            ],
            'konsultasi' => [
                'name' => 'konsultasi',
                'display_name' => 'Konsultasi',
                'description' => 'Akses untuk konsultasi'
            ],
            'pemeriksaan_lab' => [
                'name' => 'pemeriksaan_lab',
                'display_name' => 'Pemeriksaan Lab',
                'description' => 'Akses untuk pemeriksaan laboratorium'
            ],
            'rawat_jalan' => [
                'name' => 'rawat_jalan',
                'display_name' => 'Rawat Jalan',
                'description' => 'Akses untuk rawat jalan'
            ],
        ],
        'laporan' => [
            'kunjungan_rawat_jalan' => [
                'name' => 'kunjungan_rawat_jalan',
                'display_name' => 'Laporan Kunjungan Rawat Jalan',
                'description' => 'Akses untuk laporan kunjungan rawat jalan'
            ],
            'kunjungan_pemeriksaan_lab' => [
                'name' => 'kunjungan_pemeriksaan_lab',
                'display_name' => 'Laporan Kunjungan Pemeriksaan Lab',
                'description' => 'Akses untuk laporan kunjungan pemeriksaan lab'
            ],
            'obat_keluar' => [
                'name' => 'obat_keluar',
                'display_name' => 'Laporan Obat Keluar',
                'description' => 'Akses untuk laporan obat keluar'
            ],
            'tagihan' => [
                'name' => 'tagihan',
                'display_name' => 'Laporan Tagihan',
                'description' => 'Akses untuk laporan tagihan'
            ],
        ],
        'admin' => [
            'manage_users' => [
                'name' => 'manage_users',
                'display_name' => 'Manage Users',
                'description' => 'Akses untuk mengelola user'
            ],
            'manage_roles' => [
                'name' => 'manage_roles',
                'display_name' => 'Manage Roles',
                'description' => 'Akses untuk mengelola role'
            ],
            'manage_companies' => [
                'name' => 'manage_companies',
                'display_name' => 'Manage Companies',
                'description' => 'Akses untuk mengelola perusahaan'
            ],
            'manage_plants' => [
                'name' => 'manage_plants',
                'display_name' => 'Manage Plants',
                'description' => 'Akses untuk mengelola plant'
            ],
            'manage_diagnosa' => [
                'name' => 'manage_diagnosa',
                'display_name' => 'Manage Diagnosa',
                'description' => 'Akses untuk mengelola diagnosa'
            ],
        ],
        'manajemen' => [
            'manage_departemen' => [
                'name' => 'manage_departemen',
                'display_name' => 'Manage Departemen',
                'description' => 'Akses untuk mengelola departemen'
            ],
            'manage_shift' => [
                'name' => 'manage_shift',
                'display_name' => 'Manage Shift',
                'description' => 'Akses untuk mengelola shift'
            ],
            'manage_status_karyawan' => [
                'name' => 'manage_status_karyawan',
                'display_name' => 'Manage Status Karyawan',
                'description' => 'Akses untuk mengelola status karyawan'
            ],
            'manage_penjamin' => [
                'name' => 'manage_penjamin',
                'display_name' => 'Manage Penjamin',
                'description' => 'Akses untuk mengelola penjamin'
            ],
            'manage_laboratorium' => [
                'name' => 'manage_laboratorium',
                'display_name' => 'Manage Laboratorium',
                'description' => 'Akses untuk mengelola laboratorium'
            ],
            'manage_inventory' => [
                'name' => 'manage_inventory',
                'display_name' => 'Manage Inventory',
                'description' => 'Akses untuk mengelola inventory'
            ],
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $module = $this->argument('module');
        $force = $this->option('force');

        $this->info("=== GENERATE PERMISSIONS FOR MODULE: {$module} ===");

        // Validasi module
        if (!array_key_exists($module, $this->moduleSpecificPermissions)) {
            $this->error("Module '{$module}' tidak dikenali!");
            $this->line("Module yang tersedia: " . implode(', ', array_keys($this->moduleSpecificPermissions)));
            return 1;
        }

        // Cek apakah permission sudah ada
        $existingPermissions = Permission::where('module', $module)->get();
        
        // Deteksi jika dijalankan dari web (tidak ada STDIN)
        $isWeb = !defined('STDIN');
        
        if ($existingPermissions->count() > 0 && !$force) {
            $this->warn("Module '{$module}' sudah memiliki {$existingPermissions->count()} permissions.");
            if ($isWeb || !$this->confirm('Apakah Anda yakin ingin menambahkan permission baru?')) {
                $this->info('Operasi dibatalkan.');
                return 0;
            }
        }

        if ($force && $existingPermissions->count() > 0) {
            $this->warn("Menghapus {$existingPermissions->count()} permissions yang sudah ada...");
            Permission::where('module', $module)->delete();
        }

        // Generate permissions
        $createdCount = 0;
        $updatedCount = 0;

        // Default permissions
        foreach ($this->defaultPermissions as $permKey => $permData) {
            $permissionName = "{$module}.{$permData['name']}";
            
            $permission = Permission::firstOrCreate(
                ['name' => $permissionName],
                [
                    'display_name' => $permData['display_name'] . ' ' . ucfirst($module),
                    'description' => $permData['description'] . ' ' . $module,
                    'module' => $module,
                    'created_by' => null, // System generated
                ]
            );

            if ($permission->wasRecentlyCreated) {
                $createdCount++;
                $this->line("✓ Created: {$permissionName}");
            } else {
                $updatedCount++;
                $this->line("~ Updated: {$permissionName}");
            }
        }

        // Module-specific permissions
        if (isset($this->moduleSpecificPermissions[$module])) {
            foreach ($this->moduleSpecificPermissions[$module] as $permKey => $permData) {
                $permissionName = "{$module}.{$permData['name']}";
                
                $permission = Permission::firstOrCreate(
                    ['name' => $permissionName],
                    [
                        'display_name' => $permData['display_name'],
                        'description' => $permData['description'],
                        'module' => $module,
                        'created_by' => null, // System generated
                    ]
                );

                if ($permission->wasRecentlyCreated) {
                    $createdCount++;
                    $this->line("✓ Created: {$permissionName}");
                } else {
                    $updatedCount++;
                    $this->line("~ Updated: {$permissionName}");
                }
            }
        }

        // Assign to super admin role
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $newPermissions = Permission::where('module', $module)->get();
            
            foreach ($newPermissions as $permission) {
                if (!$superAdminRole->permissions->contains($permission->id)) {
                    $superAdminRole->permissions()->attach($permission->id, [
                        'created_by' => null,
                        'updated_by' => null
                    ]);
                    $this->line("✓ Assigned to super_admin: {$permission->name}");
                }
            }
        }

        $this->info("\n=== SUMMARY ===");
        $this->line("Module: {$module}");
        $this->line("Created: {$createdCount}");
        $this->line("Updated: {$updatedCount}");
        $this->line("Total permissions for module: " . Permission::where('module', $module)->count());

        return 0;
    }
} 