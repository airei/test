<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\InventoryUnit;
use App\Models\InventoryStockMovement;
use App\Models\Company;
use App\Models\Plant;
use App\Exports\InventoryItemExport;
use App\Exports\InventoryItemTemplateExport;
use App\Imports\InventoryItemImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $activeTab = $request->get('tab', 'items'); // Default ke 'items' jika tidak ada parameter
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $inventoryItems = InventoryItem::with(['company', 'plant', 'category', 'unit', 'createdBy'])
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat inventory dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Get categories data
        $categories = InventoryCategory::with(['createdBy', 'company', 'plant'])
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat kategori dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Get units data
        $units = InventoryUnit::with(['createdBy', 'company', 'plant'])
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat unit dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Manajemen/Inventory/Index', [
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'units' => $units,
            'filters' => [
                'search' => $search,
            ],
            'activeTab' => $activeTab, // Kirim tab aktif ke frontend
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Jika super admin, tampilkan semua company dan plant
        // Jika user biasa, gunakan company dan plant user
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)->get();
            $plants = Plant::where('is_active', true)->get();
        } else {
            $companies = collect([$user->company])->filter();
            $plants = collect([$user->plant])->filter();
        }

        $categories = InventoryCategory::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat kategori dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->get();
        $units = InventoryUnit::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat unit dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->get();

        return Inertia::render('Manajemen/Inventory/Create', [
            'companies' => $companies,
            'plants' => $plants,
            'categories' => $categories,
            'units' => $units,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Tentukan company_id dan plant_id yang akan digunakan
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $rules = [
            'category_id' => 'nullable|exists:inventory_categories,id',
            'unit_id' => 'nullable|exists:inventory_units,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_items')
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
            ],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
        ];
        
        if ($isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id';
            $rules['plant_id'] = 'required|exists:plants,id';
        }

        $request->validate($rules);

        $inventoryItem = InventoryItem::create([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'category_id' => $request->category_id,
            'unit_id' => $request->unit_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => 0, // Stock dimulai dari 0
            'min_stock' => $request->min_stock,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.index')
            ->with('success', 'Data inventory berhasil ditambahkan.');
    }

    public function show(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->load(['company', 'plant', 'category', 'unit', 'createdBy', 'updatedBy']);
        
        // Ambil data stock movements untuk grafik
        $stockMovements = $inventoryItem->stockMovements()
            ->with(['createdBy'])
            ->orderBy('created_at', 'desc')
            ->limit(30) // Ambil 30 data terakhir untuk grafik
            ->get();
        
        return Inertia::render('Manajemen/Inventory/View', [
            'inventoryItem' => $inventoryItem,
            'stockMovements' => $stockMovements,
        ]);
    }

    public function edit(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        // Jika super admin, tampilkan semua company dan plant
        // Jika user biasa, gunakan company dan plant user
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)->get();
            $plants = Plant::where('is_active', true)->get();
        } else {
            $companies = collect([$user->company])->filter();
            $plants = collect([$user->plant])->filter();
        }

        $categories = InventoryCategory::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat kategori dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->get();
        $units = InventoryUnit::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat unit dari company/plant mereka
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->get();

        return Inertia::render('Manajemen/Inventory/Edit', [
            'inventoryItem' => $inventoryItem->load(['company', 'plant', 'category', 'unit']),
            'companies' => $companies,
            'plants' => $plants,
            'categories' => $categories,
            'units' => $units,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        // Tentukan company_id dan plant_id yang akan digunakan
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $rules = [
            'category_id' => 'nullable|exists:inventory_categories,id',
            'unit_id' => 'nullable|exists:inventory_units,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_items')
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
                    ->ignore($inventoryItem->id)
            ],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
        ];
        
        if ($isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id';
            $rules['plant_id'] = 'required|exists:plants,id';
        }

        $request->validate($rules);

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $inventoryItem->update([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'category_id' => $request->category_id,
            'unit_id' => $request->unit_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            // Stock tidak diupdate di sini, gunakan fitur stock management
            'min_stock' => $request->min_stock,
            'updated_by' => Auth::id(),
        ]);

        // Hapus redirect dan biarkan frontend yang handle navigasi
        return back()->with('success', 'Data inventory berhasil diperbarui.');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Data inventory berhasil dihapus.');
    }

    /**
     * Toggle the active status of the inventory item.
     */
    public function toggleStatus(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->update([
            'is_active' => !$inventoryItem->is_active,
            'updated_by' => Auth::id(),
        ]);

        $status = $inventoryItem->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->route('inventory.index')
            ->with('success', "Data inventory berhasil {$status}.");
    }

    // ===== STOCK MANAGEMENT METHODS =====

    /**
     * Show add stock form
     */
    public function showAddStock(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->load(['company', 'plant', 'category', 'unit', 'createdBy', 'updatedBy']);
        
        return Inertia::render('Manajemen/Inventory/AddStock', [
            'inventoryItem' => $inventoryItem,
        ]);
    }

    /**
     * Add stock to inventory item
     */
    public function addStock(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $stockBefore = $inventoryItem->stock;
        $newStock = $stockBefore + $request->quantity;

        // Update stock
        $inventoryItem->update([
            'stock' => $newStock,
            'updated_by' => Auth::id(),
        ]);

        // Create stock movement record
        $inventoryItem->stockMovements()->create([
            'type' => InventoryStockMovement::TYPE_IN,
            'quantity' => $request->quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'notes' => $request->notes,
            'reference_type' => 'manual',
            'reference_id' => null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.show', $inventoryItem->id)
            ->with('success', "Stock berhasil ditambahkan sebanyak {$request->quantity} unit.");
    }

    /**
     * Show reduce stock form
     */
    public function showReduceStock(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->load(['company', 'plant', 'category', 'unit', 'createdBy', 'updatedBy']);
        
        return Inertia::render('Manajemen/Inventory/ReduceStock', [
            'inventoryItem' => $inventoryItem,
        ]);
    }

    /**
     * Reduce stock from inventory item (waste/disposal)
     */
    public function reduceStock(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'quantity' => "required|integer|min:1|max:{$inventoryItem->stock}",
            'reason' => 'required|string|in:expired,damaged,contaminated,recall,other',
            'notes' => 'nullable|string|max:500',
        ]);

        $stockBefore = $inventoryItem->stock;
        $newStock = max(0, $stockBefore - $request->quantity);

        // Update stock
        $inventoryItem->update([
            'stock' => $newStock,
            'updated_by' => Auth::id(),
        ]);

        // Create stock movement record
        $inventoryItem->stockMovements()->create([
            'type' => InventoryStockMovement::TYPE_WASTE,
            'quantity' => $request->quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'notes' => "Alasan: {$request->reason}. " . ($request->notes ?: ''),
            'reference_type' => 'waste',
            'reference_id' => null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.show', $inventoryItem->id)
            ->with('success', "Stock berhasil dibuang sebanyak {$request->quantity} unit.");
    }

    /**
     * Show adjust stock form
     */
    public function showAdjustStock(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->load(['company', 'plant', 'category', 'unit', 'createdBy', 'updatedBy']);
        
        return Inertia::render('Manajemen/Inventory/AdjustStock', [
            'inventoryItem' => $inventoryItem,
        ]);
    }

    /**
     * Adjust stock for inventory item
     */
    public function adjustStock(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'adjustment_type' => 'required|string|in:set,add,subtract',
            'quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $stockBefore = $inventoryItem->stock;
        $quantity = (int) $request->quantity;

        // Calculate new stock based on adjustment type
        switch ($request->adjustment_type) {
            case 'set':
                $newStock = $quantity;
                $movementQuantity = $quantity - $stockBefore;
                break;
            case 'add':
                $newStock = $stockBefore + $quantity;
                $movementQuantity = $quantity;
                break;
            case 'subtract':
                $newStock = max(0, $stockBefore - $quantity);
                $movementQuantity = -$quantity;
                break;
            default:
                abort(400, 'Jenis penyesuaian tidak valid.');
        }

        // Update stock
        $inventoryItem->update([
            'stock' => $newStock,
            'updated_by' => Auth::id(),
        ]);

        // Create stock movement record
        $inventoryItem->stockMovements()->create([
            'type' => InventoryStockMovement::TYPE_ADJUSTMENT,
            'quantity' => abs($movementQuantity),
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'notes' => "Penyesuaian: {$request->adjustment_type}. " . ($request->notes ?: ''),
            'reference_type' => 'adjustment',
            'reference_id' => null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.show', $inventoryItem->id)
            ->with('success', "Stock berhasil disesuaikan dari {$stockBefore} menjadi {$newStock} unit.");
    }

    /**
     * Show stock history
     */
    public function showStockHistory(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($inventoryItem->company_id !== $user->company_id || $inventoryItem->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $inventoryItem->load(['company', 'plant', 'category', 'unit']);
        
        // Get filter parameters
        $type = $request->get('type', '');
        $startDate = $request->get('start_date', '');
        $endDate = $request->get('end_date', '');

        // Build query with filters
        $query = $inventoryItem->stockMovements()
            ->with(['createdBy'])
            ->when($type && $type !== 'all', function($query, $type) {
                // Map frontend type to database type
                $dbType = match($type) {
                    'stock_in' => InventoryStockMovement::TYPE_IN,
                    'stock_out' => InventoryStockMovement::TYPE_OUT,
                    'adjustment' => InventoryStockMovement::TYPE_ADJUSTMENT,
                    'waste' => InventoryStockMovement::TYPE_WASTE,
                    default => $type
                };
                $query->where('type', $dbType);
            })
            ->when($startDate, function($query, $startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function($query, $endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            });

        $history = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Manajemen/Inventory/StockHistory', [
            'inventoryItem' => $inventoryItem,
            'history' => $history,
            'filters' => [
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function search(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'super_admin';
        
        // Check if this is a consultation context (when called from consultation page)
        $context = $request->get('context', '');
        
        if ($context === 'consultation') {
            // For consultation, all users must use the patient's company_id and plant_id
            $companyId = $request->company_id;
            $plantId = $request->plant_id;
            
            // Validate that company_id and plant_id are provided for consultation
            if (empty($companyId) || empty($plantId)) {
                return response()->json([]);
            }
        } else {
            // For regular inventory management, use existing logic
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;
        }

        if (empty($request->q)) {
            return response()->json([]);
        }

        $query = InventoryItem::with(['unit', 'company', 'plant'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->where('name', 'like', "%{$request->q}%");

        if ($companyId && $plantId) {
            $query->where('company_id', $companyId)->where('plant_id', $plantId);
        }

        $items = $query->orderBy('name')->limit(15)->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->name, // a-la-code for display
                    'stock' => $item->stock,
                    'unit_name' => $item->unit->name ?? 'unit',
                ];
            });

        return response()->json($items);
    }

    /**
     * Get categories and units based on company and plant
     */
    public function getCategoriesAndUnits(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'plant_id' => 'required|exists:plants,id',
        ]);

        $categories = InventoryCategory::where('company_id', $request->company_id)
            ->where('plant_id', $request->plant_id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        $units = InventoryUnit::where('company_id', $request->company_id)
            ->where('plant_id', $request->plant_id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return response()->json([
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    /**
     * Show all stock movement history
     */
    public function showAllHistory(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Get search and filter parameters
        $search = $request->get('search', '');
        $type = $request->get('type', '');
        $startDate = $request->get('start_date', '');
        $endDate = $request->get('end_date', '');
        $companyId = $request->get('company_id', '');
        $plantId = $request->get('plant_id', '');

        // Base query for stock movements
        $query = InventoryStockMovement::with(['item.category', 'item.unit', 'item.company', 'item.plant', 'createdBy'])
            ->when(!$isSuperAdmin, function($query) use ($user) {
                // User biasa hanya bisa melihat history dari company/plant mereka
                $query->whereHas('item', function($q) use ($user) {
                    $q->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
                });
            })
            ->when($isSuperAdmin && $companyId && $companyId !== 'all', function($query, $companyId) {
                $query->whereHas('item', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                });
            })
            ->when($isSuperAdmin && $plantId && $plantId !== 'all', function($query, $plantId) {
                $query->whereHas('item', function($q) use ($plantId) {
                    $q->where('plant_id', $plantId);
                });
            })
            ->when($search, function($query, $search) {
                $query->whereHas('item', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($type && $type !== 'all', function($query, $type) {
                // Map frontend type to database type
                $dbType = match($type) {
                    'stock_in' => InventoryStockMovement::TYPE_IN,
                    'stock_out' => InventoryStockMovement::TYPE_OUT,
                    'adjustment' => InventoryStockMovement::TYPE_ADJUSTMENT,
                    'waste' => InventoryStockMovement::TYPE_WASTE,
                    default => $type
                };
                $query->where('type', $dbType);
            })
            ->when($startDate, function($query, $startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function($query, $endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            });

        $stockMovements = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get companies and plants for super admin
        $companies = null;
        $plants = null;
        if ($isSuperAdmin) {
            $companies = \App\Models\Company::with(['plants' => function($query) {
                $query->where('is_active', true)->orderBy('name');
            }])->where('is_active', true)->orderBy('name')->get();
            
            $plants = \App\Models\Plant::where('is_active', true)->orderBy('name')->get();
        }

        return Inertia::render('Manajemen/Inventory/AllHistory', [
            'stockMovements' => $stockMovements,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'company_id' => $companyId ?: 'all',
                'plant_id' => $plantId ?: 'all',
            ],
            'user' => $user,
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    /**
     * Export inventory items
     */
    public function export()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Check permission
        if (!$isSuperAdmin && !$user->can('export inventory')) {
            abort(403, 'Anda tidak memiliki izin untuk export data inventory.');
        }

        return (new InventoryItemExport())->export();
    }

    /**
     * Export inventory items template
     */
    public function exportTemplate()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Check permission
        if (!$isSuperAdmin && !$user->can('import inventory')) {
            abort(403, 'Anda tidak memiliki izin untuk download template inventory.');
        }

        return (new InventoryItemTemplateExport())->export();
    }

    /**
     * Show import page
     */
    public function showImport()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Check permission
        if (!$isSuperAdmin && !$user->can('import inventory')) {
            abort(403, 'Anda tidak memiliki izin untuk import data inventory.');
        }

        $importErrors = session('import_errors', []);
        
        // Get companies and plants for super admin
        $companies = [];
        $plants = [];
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(function($company) {
                    return [
                        'id' => (string) $company->id,
                        'name' => $company->name
                    ];
                });
            
            $plants = Plant::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id'])
                ->map(function($plant) {
                    return [
                        'id' => (string) $plant->id,
                        'name' => $plant->name,
                        'company_id' => (string) $plant->company_id
                    ];
                });
        }

        return Inertia::render('Manajemen/Inventory/Import', [
            'import_errors' => $importErrors,
            'isSuperAdmin' => $isSuperAdmin,
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    /**
     * Import inventory items
     */
    public function import(Request $request)
    {
        try {
            Log::info('Inventory import started');
            
            $user = Auth::user();
            $isSuperAdmin = $user->role->name === 'super_admin';

            Log::info('User info', [
                'user_id' => $user->id,
                'is_super_admin' => $isSuperAdmin,
                'company_id' => $user->company_id,
                'plant_id' => $user->plant_id
            ]);

            // Check permission
            if (!$isSuperAdmin && !$user->can('import inventory')) {
                abort(403, 'Anda tidak memiliki izin untuk import data inventory.');
            }

            // Validate request
            $rules = [
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
            ];

            if ($isSuperAdmin) {
                $rules['company_id'] = 'required|exists:companies,id';
                $rules['plant_id'] = 'required|exists:plants,id';
            }

            Log::info('Validating request', [
                'has_file' => $request->hasFile('file'),
                'file_name' => $request->file('file') ? $request->file('file')->getClientOriginalName() : 'no file',
                'company_id' => $request->company_id ?? 'not provided',
                'plant_id' => $request->plant_id ?? 'not provided'
            ]);

            $request->validate($rules);
            
            Log::info('Request validation passed');

            // Store file temporarily
            $file = $request->file('file');
            $fileName = 'inventory_import_' . time() . '_' . $file->getClientOriginalName();
            $fullPath = Storage::disk('local')->path('temp/' . $fileName);
            
            // Ensure temp directory exists
            Storage::disk('local')->makeDirectory('temp');
            
            // Move uploaded file to temp directory
            $file->move(Storage::disk('local')->path('temp'), $fileName);
            
            Log::info('File uploaded for inventory import', [
                'file' => $fileName,
                'user_id' => $user->id,
                'is_super_admin' => $isSuperAdmin
            ]);

            // Use database transaction
            DB::beginTransaction();
            
            $import = new InventoryItemImport();
            
            // Pass company_id and plant_id to import
            $importData = [
                'filePath' => $fullPath,
                'company_id' => $isSuperAdmin ? $request->company_id : $user->company_id,
                'plant_id' => $isSuperAdmin ? $request->plant_id : $user->plant_id,
                'isSuperAdmin' => $isSuperAdmin,
            ];
            
            $result = $import->import($importData);
            $imported = $result['imported'];
            $errors = $result['errors'];
            $totalErrors = count($errors);
            $totalRows = $import->getTotalRows();
            
            // Create summary for session
            $errorSummary = [];
            if (!empty($errors)) {
                $errorSummary = array_slice($errors, 0, 10); // Limit to first 10 errors
                if (count($errors) > 10) {
                    $errorSummary[] = '... dan ' . (count($errors) - 10) . ' error lainnya.';
                }
            }

            // Clean up temporary file with retry
            if (file_exists($fullPath)) {
                $retryCount = 0;
                $maxRetries = 3;
                while ($retryCount < $maxRetries) {
                    try {
                        unlink($fullPath);
                        Log::info('Temporary file cleaned up', ['file' => $fullPath]);
                        break;
                    } catch (\Exception $e) {
                        $retryCount++;
                        if ($retryCount >= $maxRetries) {
                            Log::warning('Failed to delete temporary file after retries', [
                                'file' => $fullPath,
                                'error' => $e->getMessage()
                            ]);
                        } else {
                            sleep(1); // Wait 1 second before retry
                        }
                    }
                }
            }

            if ($totalErrors > 0) {
                DB::rollBack();
                
                Log::warning('Inventory import failed with errors', [
                    'total_rows' => $totalRows,
                    'imported' => $imported,
                    'errors' => $errors
                ]);

                return redirect()->route('inventory.import')
                    ->with('error', "Import gagal. {$totalErrors} error ditemukan dari {$totalRows} baris data.")
                    ->with('import_errors', $errorSummary);
            }

            DB::commit();
            
            Log::info('Inventory import completed successfully', [
                'total_rows' => $totalRows,
                'imported' => $imported
            ]);

            return redirect()->route('inventory.index')
                ->with('success', "Berhasil mengimport {$imported} data inventory dari {$totalRows} baris.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Inventory import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Clean up file if exists
            if (isset($fullPath) && file_exists($fullPath)) {
                try {
                    unlink($fullPath);
                } catch (\Exception $cleanupError) {
                    Log::warning('Failed to cleanup file after error', [
                        'file' => $fullPath,
                        'error' => $cleanupError->getMessage()
                    ]);
                }
            }

            return redirect()->route('inventory.import')
                ->with('error', 'Terjadi kesalahan saat import: ' . $e->getMessage());
        }
    }
}
