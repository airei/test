<?php

namespace App\Exports;

use Rap2hpoutre\FastExcel\FastExcel;

class LaboratoriumTemplateExport
{
    public function export()
    {
        $data = [
            [
                'nama_pemeriksaan' => 'Hemoglobin',
                'satuan' => 'g/dL',
                'harga' => 15000,
                'referensi_universal' => '13-17',
                'referensi_pria' => '13-17',
                'referensi_wanita' => '12-16',
            ],
            [
                'nama_pemeriksaan' => 'Glukosa Puasa',
                'satuan' => 'mg/dL',
                'harga' => 12000,
                'referensi_universal' => '70-110',
                'referensi_pria' => '',
                'referensi_wanita' => '',
            ],
        ];

        $filename = 'template_import_laboratorium.xlsx';
        return (new FastExcel(collect($data)))->download($filename, function ($line) {
            return $line;
        });
    }
} 