<?php

namespace App\Imports;

use App\Models\Department;
use Rap2hpoutre\FastExcel\FastExcel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DepartemenImport
{
    private $errors = [];
    private $imported = 0;

    public function import($importData)
    {
        try {
            $filePath = $importData['filePath'];
            $companyId = $importData['company_id'];
            $plantId = $importData['plant_id'];
            $data = (new FastExcel)->import($filePath, function ($line) use ($companyId, $plantId) {
                return $this->processRow($line, $companyId, $plantId);
            });

            return [
                'imported' => $this->imported,
                'errors' => $this->errors
            ];
        } catch (\Exception $e) {
            $this->errors[] = 'Error membaca file: ' . $e->getMessage();
            return [
                'imported' => $this->imported,
                'errors' => $this->errors
            ];
        }
    }

    private function processRow($row, $companyId, $plantId)
    {
        // Skip if nama departemen is empty
        if (empty($row['nama_departemen'])) {
            return null;
        }

        // Validate the row
        $validator = Validator::make($row, [
            'nama_departemen' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ], [
            'nama_departemen.required' => 'Nama departemen wajib diisi',
            'nama_departemen.max' => 'Nama departemen maksimal 255 karakter',
        ]);

        if ($validator->fails()) {
            $this->errors[] = "Baris dengan nama '{$row['nama_departemen']}': " . implode(', ', $validator->errors()->all());
            return null;
        }

        // Check if department already exists (per company/plant)
        $existingDepartment = \App\Models\Department::where('name', trim($row['nama_departemen']))
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId)
            ->first();
        if ($existingDepartment) {
            $this->errors[] = "Departemen '{$row['nama_departemen']}' sudah ada di company/plant yang sama";
            return null;
        }

        // Create the department
        \App\Models\Department::create([
            'name' => trim($row['nama_departemen']),
            'description' => !empty($row['deskripsi']) ? trim($row['deskripsi']) : null,
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'is_active' => true,
            'created_by' => \Auth::id(),
            'updated_by' => \Auth::id(),
        ]);

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
} 