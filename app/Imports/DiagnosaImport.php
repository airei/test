<?php

namespace App\Imports;

use App\Models\Diagnosa;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Rap2hpoutre\FastExcel\FastExcel;

class DiagnosaImport
{
    private $errors = [];
    private $imported = 0;
    private $created = 0;
    private $updated = 0;
    private $errorCount = 0;
    private $maxErrors = 50;
    private $totalRows = 0;
    private $filePath;

    public function __construct($filePath = null)
    {
        $this->filePath = $filePath;
    }

    public function import($filePath)
    {
        $this->filePath = $filePath;
        
        try {
            Log::info('FastExcel DiagnosaImport started', [
                'file' => $filePath,
                'file_exists' => file_exists($filePath),
                'file_size' => file_exists($filePath) ? filesize($filePath) : 0
            ]);
            
            // Verify file exists and is readable
            if (!file_exists($filePath)) {
                throw new \Exception("File tidak ditemukan: $filePath");
            }
            
            if (!is_readable($filePath)) {
                throw new \Exception("File tidak dapat dibaca: $filePath");
            }
            
            // Import using FastExcel
            $collection = (new FastExcel)->import($filePath);
            
            if (empty($collection)) {
                throw new \Exception("File Excel kosong atau tidak memiliki data");
            }
            
            Log::info('FastExcel collection loaded', [
                'total_rows' => count($collection),
                'first_row_keys' => !empty($collection) ? array_keys($collection[0]) : []
            ]);
            
            foreach ($collection as $index => $row) {
                $this->processRow($row, $index + 1);
            }
            
            Log::info('FastExcel DiagnosaImport completed', [
                'imported' => $this->imported,
                'errors' => $this->errorCount,
                'total_rows' => $this->totalRows
            ]);
            
        } catch (\Exception $e) {
            Log::error('FastExcel DiagnosaImport error', [
                'error' => $e->getMessage(),
                'file' => $filePath,
                'line' => $e->getLine()
            ]);
            $this->addError("System error: " . $e->getMessage());
        }
    }

    private function processRow($row, $rowNumber)
    {
        $this->totalRows++;
        
        // Convert keys to lowercase for consistent access
        $row = array_change_key_case($row, CASE_LOWER);
        
        Log::debug('Processing row', [
            'row_number' => $rowNumber,
            'row_keys' => array_keys($row),
            'row_data' => $row
        ]);
        
        // Skip empty rows
        if (empty($row['kode']) && empty($row['nama']) && empty($row['deskripsi'])) {
            Log::debug('Skipping empty row', ['row_number' => $rowNumber]);
            return;
        }
        
        // Check required fields
        if (empty($row['kode']) || empty($row['nama'])) {
            $this->addError("Baris {$rowNumber}: Kode dan nama diagnosa wajib diisi");
            return;
        }
        
        // Trim and sanitize data
        $code = trim($row['kode']);
        $name = trim($row['nama']);
        $description = !empty($row['deskripsi']) ? trim($row['deskripsi']) : null;
        
        // Validate length
        if (strlen($code) > 50) {
            $this->addError("Baris {$rowNumber}: Kode '{$code}' terlalu panjang (maksimal 50 karakter)");
            return;
        }
        
        if (strlen($name) > 300) {
            $this->addError("Baris {$rowNumber}: Nama terlalu panjang (maksimal 300 karakter)");
            return;
        }
        
        if ($description && strlen($description) > 300) {
            $this->addError("Baris {$rowNumber}: Deskripsi terlalu panjang (maksimal 300 karakter)");
            return;
        }
        
        // Check for existing records and update if exists
        $existing = Diagnosa::where('code', $code)->first();
        
        try {
            if ($existing) {
                // Update existing record
                $existing->name = $name;
                $existing->description = $description;
                $existing->updated_by = Auth::id();
                $existing->save();
                
                $this->updated++;
                
                Log::debug('Record updated successfully', [
                    'row_number' => $rowNumber,
                    'code' => $code,
                    'id' => $existing->id,
                    'action' => 'updated'
                ]);
            } else {
                // Create new record
                $diagnosa = new Diagnosa();
                $diagnosa->id = (string) Str::uuid();
                $diagnosa->code = $code;
                $diagnosa->name = $name;
                $diagnosa->description = $description;
                $diagnosa->is_active = true;
                $diagnosa->created_by = Auth::id();
                $diagnosa->updated_by = Auth::id();
                
                $diagnosa->save();
                
                $this->created++;
                
                Log::debug('Record created successfully', [
                    'row_number' => $rowNumber,
                    'code' => $code,
                    'id' => $diagnosa->id,
                    'action' => 'created'
                ]);
            }
            
            $this->imported++;
            
        } catch (\Exception $e) {
            Log::error('Error saving record', [
                'row_number' => $rowNumber,
                'code' => $code,
                'error' => $e->getMessage()
            ]);
            $this->addError("Baris {$rowNumber}: Error saving - " . $e->getMessage());
        }
    }

    private function addError($message)
    {
        $this->errorCount++;
        
        if (count($this->errors) < $this->maxErrors) {
            $this->errors[] = $message;
        } elseif (count($this->errors) == $this->maxErrors) {
            $this->errors[] = "... dan " . ($this->errorCount - $this->maxErrors) . " error lainnya.";
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getImportedCount()
    {
        return $this->imported;
    }

    public function getCreatedCount()
    {
        return $this->created;
    }

    public function getUpdatedCount()
    {
        return $this->updated;
    }

    public function getTotalErrorCount()
    {
        return $this->errorCount;
    }

    public function getTotalRows()
    {
        return $this->totalRows;
    }
} 