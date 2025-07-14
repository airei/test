<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\InventoryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InventoryCategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

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

        return Inertia::render('Manajemen/Inventory/Category/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';
        
        $data = [];
        
        if ($isSuperAdmin) {
            // Super admin bisa memilih company dan plant
            $data['companies'] = \App\Models\Company::where('is_active', true)
                ->with('plants')
                ->orderBy('name')
                ->get();
        }
        
        return Inertia::render('Manajemen/Inventory/Category/Create', $data);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Tentukan company_id dan plant_id yang akan digunakan
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_categories')
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
            ],
            'description' => 'nullable|string',
        ];
        
        if ($isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id';
            $rules['plant_id'] = 'required|exists:plants,id';
        }

        $request->validate($rules);

        InventoryCategory::create([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.index', ['tab' => 'categories'])
            ->with('success', 'Kategori inventory berhasil ditambahkan.');
    }

    public function edit(InventoryCategory $category)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($category->company_id !== $user->company_id || $category->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        // Load relasi company dan plant
        $category->load(['company', 'plant']);

        $data = [
            'category' => $category,
        ];
        
        if ($isSuperAdmin) {
            // Super admin bisa memilih company dan plant
            $data['companies'] = \App\Models\Company::where('is_active', true)
                ->with('plants')
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('Manajemen/Inventory/Category/Edit', $data);
    }

    public function update(Request $request, InventoryCategory $category)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($category->company_id !== $user->company_id || $category->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        // Tentukan company_id dan plant_id yang akan digunakan
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_categories')
                    ->where('company_id', $companyId)
                    ->where('plant_id', $plantId)
                    ->ignore($category->id)
            ],
            'description' => 'nullable|string',
        ];
        
        if ($isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id';
            $rules['plant_id'] = 'required|exists:plants,id';
        }

        $request->validate($rules);

        $updateData = [
            'name' => $request->name,
            'description' => $request->description,
            'updated_by' => Auth::id(),
        ];
        
        if ($isSuperAdmin) {
            $updateData['company_id'] = $request->company_id;
            $updateData['plant_id'] = $request->plant_id;
        }

        $category->update($updateData);

        return redirect()->route('inventory.index', ['tab' => 'categories'])
            ->with('success', 'Kategori inventory berhasil diperbarui.');
    }

    public function destroy(InventoryCategory $category)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($category->company_id !== $user->company_id || $category->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $category->delete();

        return redirect()->route('inventory.index', ['tab' => 'categories'])
            ->with('success', 'Kategori inventory berhasil dihapus.');
    }

    public function toggleStatus(InventoryCategory $category)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($category->company_id !== $user->company_id || $category->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $category->update([
            'is_active' => !$category->is_active,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('inventory.index', ['tab' => 'categories'])
            ->with('success', 'Status kategori berhasil diubah.');
    }
} 