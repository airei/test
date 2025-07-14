<?php

namespace App\Console\Commands;

use App\Models\LabMaster;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestDeleteLabMaster extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:delete-lab-master {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test delete lab master by name';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        
        $this->info("Mencari lab master dengan nama: {$name}");
        
        $labMaster = LabMaster::where('name', $name)->first();
        
        if (!$labMaster) {
            $this->error("Lab master dengan nama '{$name}' tidak ditemukan!");
            return 1;
        }
        
        $this->info("Data ditemukan:");
        $this->table(
            ['ID', 'Name', 'Company ID', 'Plant ID', 'References Count'],
            [[
                $labMaster->id,
                $labMaster->name,
                $labMaster->company_id,
                $labMaster->plant_id,
                $labMaster->references()->count()
            ]]
        );
        
        if ($this->confirm("Apakah Anda yakin ingin menghapus lab master '{$name}'?")) {
            try {
                $this->info("Menghapus lab master...");
                
                // Log sebelum hapus
                Log::info("Command delete lab master: {$name}", [
                    'id' => $labMaster->id,
                    'references_count' => $labMaster->references()->count()
                ]);
                
                $deleted = $labMaster->delete();
                
                if ($deleted) {
                    $this->info("Lab master '{$name}' berhasil dihapus!");
                    Log::info("Lab master deleted successfully: {$name}");
                } else {
                    $this->error("Gagal menghapus lab master '{$name}'!");
                    Log::error("Failed to delete lab master: {$name}");
                }
                
            } catch (\Exception $e) {
                $this->error("Error: " . $e->getMessage());
                Log::error("Error deleting lab master: " . $e->getMessage());
                return 1;
            }
        } else {
            $this->info("Penghapusan dibatalkan.");
        }
        
        return 0;
    }
}
