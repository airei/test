<?php

namespace App\Imports;

use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\InventoryUnit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class InventoryItemImport
{
    private $imported = 0;
    private $errors = [];
    private $totalRows = 0;

    public function import($importData)
    {
        try {
            $filePath = $importData['filePath'];
            $companyId = $importData['company_id'];
            $plantId = $importData['plant_id'];
            $isSuperAdmin = $importData['isSuperAdmin'];
            
            $data = (new FastExcel)->import($filePath, function ($line) use ($companyId, $plantId, $isSuperAdmin) {
                $this->totalRows++;
                return $this->processRow($line, $companyId, $plantId, $isSuperAdmin);
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

    private function processRow($row, $companyId, $plantId, $isSuperAdmin)
    {
        // Skip if nama_item is empty
        if (empty($row['nama_item'])) {
            return null;
        }

        Log::info('Processing inventory item row', [
            'nama_item' => $row['nama_item'] ?? 'empty',
            'companyId' => $companyId,
            'plantId' => $plantId
        ]);

        try {
            // Validate required fields
            if (empty($row['nama_item'])) {
                $this->errors[] = "Baris {$this->totalRows}: Nama item tidak boleh kosong";
                return null;
            }

            if (empty($row['harga']) || !is_numeric($row['harga'])) {
                $this->errors[] = "Baris {$this->totalRows}: Harga harus berupa angka";
                return null;
            }

            if (empty($row['stok_minimal']) || !is_numeric($row['stok_minimal'])) {
                $this->errors[] = "Baris {$this->totalRows}: Stok minimal harus berupa angka";
                return null;
            }

            // Check if item already exists
            $existingItem = InventoryItem::where('name', trim($row['nama_item']))
                ->where('company_id', $companyId)
                ->where('plant_id', $plantId)
                ->first();

            if ($existingItem) {
                $this->errors[] = "Baris {$this->totalRows}: Item '{$row['nama_item']}' sudah ada";
                return null;
            }

            // Find or create category by name
            $categoryId = null;
            if (!empty($row['kategori'])) {
                $category = InventoryCategory::where('name', trim($row['kategori']))
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
                    ->first();
                
                if (!$category) {
                    // Buat kategori baru jika tidak ada
                    $category = InventoryCategory::create([
                        'name' => trim($row['kategori']),
                        'company_id' => $companyId,
                        'plant_id' => $plantId,
                        'is_active' => true,
                        'created_by' => Auth::id(),
                        'updated_by' => Auth::id(),
                    ]);
                    
                    Log::info('Created new category', [
                        'name' => $category->name,
                        'id' => $category->id
                    ]);
                } else {
                    // Jika kategori sudah ada, pastikan aktif
                    if (!$category->is_active) {
                        $category->update([
                            'is_active' => true,
                            'updated_by' => Auth::id(),
                        ]);
                        
                        Log::info('Activated existing category', [
                            'name' => $category->name,
                            'id' => $category->id
                        ]);
                    }
                }
                $categoryId = $category->id;
            }

            // Find or create unit by name
            $unitId = null;
            if (!empty($row['unit'])) {
                $unit = InventoryUnit::where('name', trim($row['unit']))
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
                    ->first();
                
                if (!$unit) {
                    // Buat unit baru jika tidak ada
                    $unit = InventoryUnit::create([
                        'name' => trim($row['unit']),
                        'company_id' => $companyId,
                        'plant_id' => $plantId,
                        'is_active' => true,
                        'created_by' => Auth::id(),
                        'updated_by' => Auth::id(),
                    ]);
                    
                    Log::info('Created new unit', [
                        'name' => $unit->name,
                        'id' => $unit->id
                    ]);
                } else {
                    // Jika unit sudah ada, pastikan aktif
                    if (!$unit->is_active) {
                        $unit->update([
                            'is_active' => true,
                            'updated_by' => Auth::id(),
                        ]);
                        
                        Log::info('Activated existing unit', [
                            'name' => $unit->name,
                            'id' => $unit->id
                        ]);
                    }
                }
                $unitId = $unit->id;
            }

            // Create the inventory item
            $inventoryItemData = [
                'name' => trim($row['nama_item']),
                'description' => trim($row['deskripsi'] ?? ''),
                'category_id' => $categoryId,
                'unit_id' => $unitId,
                'price' => (float) $row['harga'],
                'stock' => (int) ($row['stok'] ?? 0),
                'min_stock' => (int) $row['stok_minimal'],
                'company_id' => $companyId,
                'plant_id' => $plantId,
                'is_active' => true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];

            Log::info('Creating InventoryItem', $inventoryItemData);
            
            $inventoryItem = InventoryItem::create($inventoryItemData);
            
            Log::info('InventoryItem created successfully', ['id' => $inventoryItem->id]);
            
            $this->imported++;
            
            return $inventoryItem;

        } catch (\Exception $e) {
            Log::error('Error creating inventory item', [
                'row' => $row,
                'error' => $e->getMessage()
            ]);
            
            $this->errors[] = "Baris {$this->totalRows}: " . $e->getMessage();
            return null;
        }
    }

    public function getImportedCount()
    {
        return $this->imported;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getTotalRows()
    {
        return $this->totalRows;
    }
} 