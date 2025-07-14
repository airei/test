<?php

namespace App\Exports;

use App\Models\Diagnosa;
use Rap2hpoutre\FastExcel\FastExcel;

class DiagnosaExport
{
    public function export($filename = null)
    {
        $diagnosas = Diagnosa::with(['creator', 'updater'])
            ->orderBy('code')
            ->get()
            ->map(function ($diagnosa, $index) {
                return [
                    'No' => $index + 1,
                    'Kode' => $diagnosa->code,
                    'Nama' => $diagnosa->name,
                    'Deskripsi' => $diagnosa->description ?? '',
                    'Status' => $diagnosa->is_active ? 'Aktif' : 'Tidak Aktif',
                    'Tanggal Dibuat' => $diagnosa->created_at ? $diagnosa->created_at->format('d/m/Y H:i') : '',
                    'Tanggal Diubah' => $diagnosa->updated_at ? $diagnosa->updated_at->format('d/m/Y H:i') : '',
                ];
            });

        if ($filename) {
            return (new FastExcel($diagnosas))->download($filename);
        }

        return (new FastExcel($diagnosas))->download('diagnosa_export_' . date('Y-m-d_H-i-s') . '.xlsx');
    }

    public function exportToFile($filename = null)
    {
        $diagnosas = Diagnosa::with(['creator', 'updater'])
            ->orderBy('code')
            ->get()
            ->map(function ($diagnosa, $index) {
                return [
                    'No' => $index + 1,
                    'Kode' => $diagnosa->code,
                    'Nama' => $diagnosa->name,
                    'Deskripsi' => $diagnosa->description ?? '',
                    'Status' => $diagnosa->is_active ? 'Aktif' : 'Tidak Aktif',
                    'Tanggal Dibuat' => $diagnosa->created_at ? $diagnosa->created_at->format('d/m/Y H:i') : '',
                    'Tanggal Diubah' => $diagnosa->updated_at ? $diagnosa->updated_at->format('d/m/Y H:i') : '',
                ];
            });

        if (!$filename) {
            $filename = 'diagnosa_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        }

        $filePath = storage_path("app/$filename");
        (new FastExcel($diagnosas))->export($filePath);
        
        return $filePath;
    }

    public function exportTemplate($filename = null)
    {
        $templateData = collect([
            [
                'kode' => 'J00',
                'nama' => 'Nasopharyngitis akut',
                'deskripsi' => 'Pilek biasa atau selesma'
            ],
            [
                'kode' => 'K30',
                'nama' => 'Dispepsia',
                'deskripsi' => 'Gangguan pencernaan atau sakit maag'
            ],
            [
                'kode' => 'I10',
                'nama' => 'Hipertensi esensial',
                'deskripsi' => 'Tekanan darah tinggi primer'
            ],
        ]);

        if ($filename) {
            return (new FastExcel($templateData))->download($filename);
        }

        return (new FastExcel($templateData))->download('template_diagnosa_' . date('Y-m-d') . '.xlsx');
    }

    public function exportTemplateToFile($filename = null)
    {
        $templateData = collect([
            [
                'kode' => 'J00',
                'nama' => 'Nasopharyngitis akut',
                'deskripsi' => 'Pilek biasa atau selesma'
            ],
            [
                'kode' => 'K30',
                'nama' => 'Dispepsia',
                'deskripsi' => 'Gangguan pencernaan atau sakit maag'
            ],
            [
                'kode' => 'I10',
                'nama' => 'Hipertensi esensial',
                'deskripsi' => 'Tekanan darah tinggi primer'
            ],
        ]);

        if (!$filename) {
            $filename = 'template_diagnosa_' . date('Y-m-d') . '.xlsx';
        }

        $filePath = storage_path("app/$filename");
        (new FastExcel($templateData))->export($filePath);
        
        return $filePath;
    }
} 