<?php

namespace App\Exports;

use App\Models\InventoryItem;
use Illuminate\Support\Facades\Auth;
use Rap2hpoutre\FastExcel\FastExcel;

class InventoryItemExport
{
    public function export()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $query = InventoryItem::with(['company', 'plant', 'category', 'unit'])
            ->when(!$isSuperAdmin, function($query) use ($user) {
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->orderBy('created_at', 'desc');

        $items = $query->get();

        return (new FastExcel($items))->download('inventory_items_' . date('Y-m-d_H-i-s') . '.xlsx', function ($item) {
            return [
                'nama_item' => $item->name,
                'deskripsi' => $item->description,
                'kategori' => $item->category?->name,
                'unit' => $item->unit?->name,
                'harga' => $item->price,
                'stok' => $item->stock,
                'stok_minimal' => $item->min_stock,
                'perusahaan' => $item->company?->name,
                'plant' => $item->plant?->name,
                'status' => $item->is_active ? 'Aktif' : 'Tidak Aktif',
                'tanggal_dibuat' => $item->created_at?->format('Y-m-d H:i:s'),
            ];
        });
    }
} 