<?php

namespace App\Exports;

use App\Models\Department;
use Rap2hpoutre\FastExcel\FastExcel;

class DepartemenExport
{
    public function export()
    {
        $departments = Department::with(['company', 'plant', 'creator'])
            ->orderBy('name')
            ->get();

        $data = $departments->map(function ($department, $index) {
            return [
                'No' => $index + 1,
                'Nama Departemen' => $department->name,
                'Deskripsi' => $department->description ?? '-',
                'Perusahaan' => $department->company?->name ?? '-',
                'Plant' => $department->plant?->name ?? '-',
                'Status' => $department->is_active ? 'Aktif' : 'Nonaktif',
                'Dibuat Oleh' => $department->creator?->name ?? '-',
                'Tanggal Dibuat' => $department->created_at->format('d/m/Y H:i')
            ];
        });

        $filename = 'departemen_' . date('Y-m-d_H-i-s') . '.xlsx';

        return (new FastExcel($data))->download($filename, function ($line) {
            return $line;
        });
    }
} 