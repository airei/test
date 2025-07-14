<?php

namespace App\Exports;

use Rap2hpoutre\FastExcel\FastExcel;

class DepartemenTemplateExport
{
    public function export()
    {
        $data = [
            [
                'nama_departemen' => 'Keuangan',
                'deskripsi' => 'Mengelola keuangan perusahaan',
            ],
            [
                'nama_departemen' => 'SDM',
                'deskripsi' => 'Mengelola sumber daya manusia',
            ],
        ];

        $filename = 'template_import_departemen.xlsx';
        return (new FastExcel(collect($data)))->download($filename, function ($line) {
            return $line;
        });
    }
} 