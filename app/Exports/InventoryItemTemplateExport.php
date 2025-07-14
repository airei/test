<?php

namespace App\Exports;

use Rap2hpoutre\FastExcel\FastExcel;

class InventoryItemTemplateExport
{
    public function export()
    {
        $templateData = [
            [
                'nama_item' => 'Paracetamol 500mg',
                'deskripsi' => 'Obat pereda nyeri dan demam',
                'kategori' => 'Obat Bebas',
                'unit' => 'Tablet',
                'harga' => 5000,
                'stok' => 100,
                'stok_minimal' => 20,
            ],
            [
                'nama_item' => 'Amoxicillin 500mg',
                'deskripsi' => 'Antibiotik untuk infeksi bakteri',
                'kategori' => 'Obat Keras',
                'unit' => 'Kapsul',
                'harga' => 15000,
                'stok' => 50,
                'stok_minimal' => 10,
            ],
        ];

        return (new FastExcel(collect($templateData)))->download('template_inventory_items.xlsx');
    }
} 