<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Diagnosa;
use App\Imports\DiagnosaImport;
use Rap2hpoutre\FastExcel\FastExcel;
use Illuminate\Support\Facades\Auth;

class DebugDiagnosaImport extends Command
{
    protected $signature = 'debug:diagnosa-import';
    protected $description = 'Debug FastExcel import functionality';

    public function handle()
    {
        $this->info('=== FastExcel Import Debug Test ===');
        
        // Login as admin
        Auth::loginUsingId('ff465a40-c69f-48a3-b8df-84bbbe30f244');
        $this->info('Logged in as: ' . Auth::user()->email);
        
        // Create test data
        $testData = [
            ['kode' => 'DEBUG01', 'nama' => 'Debug Test 1', 'deskripsi' => 'Testing FastExcel import debug 1'],
            ['kode' => 'DEBUG02', 'nama' => 'Debug Test 2', 'deskripsi' => 'Testing FastExcel import debug 2'],
        ];
        
        // Create Excel file using FastExcel
        $testFile = storage_path('app/temp/debug_test.xlsx');
        
        // Ensure temp directory exists
        if (!is_dir(dirname($testFile))) {
            mkdir(dirname($testFile), 0755, true);
        }
        
        $this->info("Creating test file: $testFile");
        (new FastExcel($testData))->export($testFile);
        
        $this->info("File created: " . (file_exists($testFile) ? 'YES' : 'NO'));
        $this->info("File size: " . (file_exists($testFile) ? filesize($testFile) . ' bytes' : 'N/A'));
        $this->info("File readable: " . (is_readable($testFile) ? 'YES' : 'NO'));
        
        // Test the import
        try {
            $this->info("\n=== Starting Import Test ===");
            
            $import = new DiagnosaImport();
            $import->import($testFile);
            
            $this->info("Import completed.");
            $this->info("Imported: " . $import->getImportedCount());
            $this->info("Total rows: " . $import->getTotalRows());
            $this->info("Total errors: " . $import->getTotalErrorCount());
            
            if ($import->getErrors()) {
                $this->error("Errors:");
                foreach ($import->getErrors() as $error) {
                    $this->error("- $error");
                }
            }
            
            $dbCount = Diagnosa::count();
            $this->info("Database count: $dbCount");
            
            if ($dbCount > 0) {
                $diagnosas = Diagnosa::where('code', 'LIKE', 'DEBUG%')->get();
                $this->info("Debug Records in database:");
                foreach ($diagnosas as $diagnosa) {
                    $this->info("- {$diagnosa->code}: {$diagnosa->name} ({$diagnosa->description})");
                }
            }
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("File: " . $e->getFile());
            $this->error("Line: " . $e->getLine());
        }
        
        // Clean up
        if (file_exists($testFile)) {
            unlink($testFile);
            $this->info("\nTest file cleaned up.");
        }
        
        $this->info("\n=== Debug Test Complete ===");
    }
} 