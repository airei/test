<?php

namespace App\Exports;

use App\Models\LabMaster;
use Rap2hpoutre\FastExcel\FastExcel;

class LaboratoriumExport
{
    public function export()
    {
        $labMasters = LabMaster::with(['company', 'plant', 'references', 'createdBy'])
            ->orderBy('name')
            ->get();

        $data = $labMasters->map(function ($labMaster, $index) {
            // Ambil referensi berdasarkan tipe
            $universalRef = $labMaster->references->where('reference_type', 'universal')->first();
            $maleRef = $labMaster->references->where('reference_type', 'male')->first();
            $femaleRef = $labMaster->references->where('reference_type', 'female')->first();

            return [
                'No' => $index + 1,
                'Nama Pemeriksaan' => $labMaster->name,
                'Satuan' => $labMaster->unit,
                'Harga' => number_format($labMaster->price, 0, ',', '.'),
                'Perusahaan' => $labMaster->company?->name ?? '-',
                'Plant' => $labMaster->plant?->name ?? '-',
                'Referensi Universal' => $universalRef?->reference ?? '-',
                'Referensi Pria' => $maleRef?->reference ?? '-',
                'Referensi Wanita' => $femaleRef?->reference ?? '-',
                'Status' => $labMaster->is_active ? 'Aktif' : 'Nonaktif',
                'Dibuat Oleh' => $labMaster->createdBy?->name ?? '-',
                'Tanggal Dibuat' => $labMaster->created_at->format('d/m/Y H:i')
            ];
        });

        $filename = 'laboratorium_' . date('Y-m-d_H-i-s') . '.xlsx';

        return (new FastExcel($data))->download($filename, function ($line) {
            return $line;
        });
    }
} 