<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Imports\DiagnosaImport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Diagnosa;
use App\Models\User;

class TestImportCommand extends Command
{
    protected $signature = 'test:import {file}';
    protected $description = 'Test diagnosa import with a specific file';

    public function handle()
    {
        $this->info('=== Testing Diagnosa Import ===');
        
        // Login as admin
        try {
            $admin = User::where('email', 'admin@medicare.com')->first();
            if (!$admin) {
                $this->error('Admin user not found!');
                return 1;
            }
            Auth::login($admin);
            $this->info('Logged in as: ' . Auth::user()->email);
        } catch (\Exception $e) {
            $this->error('Login failed: ' . $e->getMessage());
            return 1;
        }
        
        // Get file path
        $testFile = $this->argument('file');
        
        $this->info("Test file: $testFile");
        $this->info("File exists: " . (file_exists($testFile) ? 'YES' : 'NO'));
        
        if (!file_exists($testFile)) {
            $this->error("Test file not found!");
            return 1;
        }
        
        $this->info("File size: " . filesize($testFile) . ' bytes');
        
        // Current database state
        $currentCount = Diagnosa::count();
        $this->info("Current diagnosa count: $currentCount");
        
        // Test import
        $this->info("\n=== Starting Import Test ===");
        
        try {
            DB::beginTransaction();
            
            $import = new DiagnosaImport();
            $import->import($testFile);
            
            $this->info("Import completed.");
            $this->info("Imported: " . $import->getImportedCount());
            $this->info("Total rows: " . $import->getTotalRows());
            $this->info("Total errors: " . $import->getTotalErrorCount());
            
            if ($import->getErrors()) {
                $this->error("Errors found:");
                foreach ($import->getErrors() as $error) {
                    $this->error("- $error");
                }
                DB::rollback();
                $this->info("Transaction rolled back due to errors.");
            } else {
                DB::commit();
                $this->info("Transaction committed successfully.");
            }
            
            $newCount = Diagnosa::count();
            $this->info("New diagnosa count: $newCount");
            $this->info("Records added: " . ($newCount - $currentCount));
            
            // Show test records
            $testRecords = Diagnosa::where('code', 'LIKE', 'TEST%')->get();
            if ($testRecords->count() > 0) {
                $this->info("\nTest records in database:");
                foreach ($testRecords as $record) {
                    $this->info("- {$record->code}: {$record->name} ({$record->description})");
                }
            }
            
        } catch (\Exception $e) {
            DB::rollback();
            $this->error("Error during import: " . $e->getMessage());
            $this->error("File: " . $e->getFile());
            $this->error("Line: " . $e->getLine());
            return 1;
        }
        
        $this->info("\n=== Test Complete ===");
        return 0;
    }
} 