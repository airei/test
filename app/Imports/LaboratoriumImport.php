<?php

namespace App\Imports;

use App\Models\LabMaster;
use App\Models\LabReference;
use Rap2hpoutre\FastExcel\FastExcel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LaboratoriumImport
{
    private $errors = [];
    private $imported = 0;
    private $totalRows = 0;

    public function import($importData)
    {
        try {
            $filePath = $importData['filePath'];
            $companyId = $importData['company_id'];
            $plantId = $importData['plant_id'];
            $isSuperAdmin = $importData['isSuperAdmin'];
            
            \Log::info('LaboratoriumImport starting', [
                'filePath' => $filePath,
                'companyId' => $companyId,
                'plantId' => $plantId,
                'isSuperAdmin' => $isSuperAdmin
            ]);
            
            $data = (new FastExcel)->import($filePath, function ($line) use ($companyId, $plantId, $isSuperAdmin) {
                $this->totalRows++;
                return $this->processRow($line, $companyId, $plantId, $isSuperAdmin);
            });

            \Log::info('LaboratoriumImport completed', [
                'imported' => $this->imported,
                'errors_count' => count($this->errors),
                'total_rows' => $this->totalRows
            ]);

            return [
                'imported' => $this->imported,
                'errors' => $this->errors
            ];
        } catch (\Exception $e) {
            \Log::error('LaboratoriumImport error', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            $this->errors[] = 'Error membaca file: ' . $e->getMessage();
            return [
                'imported' => $this->imported,
                'errors' => $this->errors
            ];
        }
    }

    private function processRow($row, $companyId, $plantId, $isSuperAdmin)
    {
        // Skip if nama pemeriksaan is empty
        if (empty($row['nama_pemeriksaan'])) {
            return null;
        }

        \Log::info('Processing row', [
            'nama_pemeriksaan' => $row['nama_pemeriksaan'] ?? 'empty',
            'companyId' => $companyId,
            'plantId' => $plantId
        ]);

        // Validate the row (no need to validate company_id and plant_id from Excel)
        $validator = Validator::make($row, [
            'nama_pemeriksaan' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'harga' => 'required|numeric|min:0',
            'referensi_universal' => 'nullable|string|max:255',
            'referensi_pria' => 'nullable|string|max:255',
            'referensi_wanita' => 'nullable|string|max:255',
        ], [
            'nama_pemeriksaan.required' => 'Nama pemeriksaan wajib diisi',
            'nama_pemeriksaan.max' => 'Nama pemeriksaan maksimal 255 karakter',
            'satuan.required' => 'Satuan wajib diisi',
            'satuan.max' => 'Satuan maksimal 50 karakter',
            'harga.required' => 'Harga wajib diisi',
            'harga.numeric' => 'Harga harus berupa angka',
            'harga.min' => 'Harga minimal 0',
        ]);

        if ($validator->fails()) {
            $this->errors[] = "Baris dengan nama '{$row['nama_pemeriksaan']}': " . implode(', ', $validator->errors()->all());
            return null;
        }

        // Check if lab master already exists (considering company and plant)
        $existingQuery = LabMaster::where('name', trim($row['nama_pemeriksaan']))
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId);
        
        $existingLabMaster = $existingQuery->first();
        if ($existingLabMaster) {
            $this->errors[] = "Pemeriksaan '{$row['nama_pemeriksaan']}' sudah ada di company/plant yang sama";
            return null;
        }

        // Create the lab master
        $labMasterData = [
            'name' => trim($row['nama_pemeriksaan']),
            'unit' => trim($row['satuan']),
            'price' => (float) $row['harga'],
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'is_active' => true,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ];

        \Log::info('Creating LabMaster', $labMasterData);
        
        $labMaster = LabMaster::create($labMasterData);
        
        \Log::info('LabMaster created', ['id' => $labMaster->id]);

        // Create references
        $references = [];
        
        if (!empty($row['referensi_universal'])) {
            $references[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'lab_master_id' => $labMaster->id,
                'reference_type' => 'universal',
                'reference' => trim($row['referensi_universal']),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];
        }
        
        if (!empty($row['referensi_pria'])) {
            $references[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'lab_master_id' => $labMaster->id,
                'reference_type' => 'male',
                'reference' => trim($row['referensi_pria']),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];
        }
        
        if (!empty($row['referensi_wanita'])) {
            $references[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'lab_master_id' => $labMaster->id,
                'reference_type' => 'female',
                'reference' => trim($row['referensi_wanita']),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];
        }

        // Insert references
        if (!empty($references)) {
            LabReference::insert($references);
        }

        $this->imported++;
        return null;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getImportedCount()
    {
        return $this->imported;
    }

    public function getTotalRows()
    {
        return $this->totalRows;
    }
} 