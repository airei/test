<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\InventoryStockMovement;
use App\Models\Company;
use App\Models\Plant;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ObatKeluarController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Get filter parameters
        $filters = $request->only([
            'start_date',
            'end_date',
            'company_id',
            'plant_id',
            'inventory_item_id',
            'search',
            'movement_type'
        ]);

        // Get companies and plants for filter
        $companies = collect();
        $plants = collect();
        
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);
            
            $plants = Plant::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id']);
        }

        // Get inventory items for filter
        $inventoryItems = InventoryItem::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        // Initialize data as empty
        $obatKeluar = collect();
        $totalRecords = 0;
        $hasSearched = false;

        // Only fetch data if filters are applied
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('company_id') || $request->filled('plant_id') || 
            $request->filled('inventory_item_id') || $request->filled('search') || 
            $request->filled('movement_type')) {
            
            $hasSearched = true;
            
            $query = InventoryStockMovement::with([
                'inventoryItem.category',
                'inventoryItem.unit',
                'company',
                'plant',
                'createdBy'
            ])
            ->where('movement_type', 'out') // Only out movements
            ->when(!$isSuperAdmin, function($query) use ($user) {
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->when($request->filled('start_date'), function($query) use ($request) {
                $query->whereDate('movement_date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function($query) use ($request) {
                $query->whereDate('movement_date', '<=', $request->end_date);
            })
            ->when($request->filled('company_id'), function($query) use ($request) {
                $query->where('company_id', $request->company_id);
            })
            ->when($request->filled('plant_id'), function($query) use ($request) {
                $query->where('plant_id', $request->plant_id);
            })
            ->when($request->filled('inventory_item_id'), function($query) use ($request) {
                $query->where('inventory_item_id', $request->inventory_item_id);
            })
            ->when($request->filled('search'), function($query) use ($request) {
                $search = $request->search;
                $query->whereHas('inventoryItem', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('movement_type'), function($query) use ($request) {
                $query->where('movement_type', $request->movement_type);
            })
            ->orderBy('movement_date', 'desc')
            ->orderBy('created_at', 'desc');

            $totalRecords = $query->count();
            
            $obatKeluar = $query->paginate(15)
                ->withQueryString()
                ->through(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->inventoryItem?->name ?? '-',
                        'category' => $item->inventoryItem?->category?->name ?? '-',
                        'unit' => $item->inventoryItem?->unit?->name ?? '-',
                        'movement_date' => $item->movement_date?->format('d/m/Y') ?? '-',
                        'quantity' => $item->quantity,
                        'movement_type' => $item->movement_type,
                        'movement_type_text' => $this->getMovementTypeText($item->movement_type),
                        'reason' => $item->reason ?? '-',
                        'reference_number' => $item->reference_number ?? '-',
                        'company' => $item->company?->name ?? '-',
                        'plant' => $item->plant?->name ?? '-',
                        'created_by' => $item->createdBy?->name ?? '-',
                        'created_at' => $item->created_at?->format('d/m/Y H:i') ?? '-',
                    ];
                });
        }

        return Inertia::render('Laporan/ObatKeluar', [
            'obatKeluar' => $obatKeluar,
            'totalRecords' => $totalRecords,
            'hasSearched' => $hasSearched,
            'filters' => $filters,
            'companies' => $companies,
            'plants' => $plants,
            'inventoryItems' => $inventoryItems,
            'isSuperAdmin' => $isSuperAdmin,
            'movementTypeOptions' => [
                ['value' => 'out', 'label' => 'Keluar'],
                ['value' => 'adjustment', 'label' => 'Penyesuaian'],
            ],
        ]);
    }

    private function getMovementTypeText($movementType)
    {
        return match($movementType) {
            'in' => 'Masuk',
            'out' => 'Keluar',
            'adjustment' => 'Penyesuaian',
            default => 'Tidak Diketahui'
        };
    }
}
