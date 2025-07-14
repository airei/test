<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\Guarantor;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class PenjaminController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $query = Guarantor::with(['company', 'plant', 'creator']);

        // Filter berdasarkan company dan plant untuk user biasa
        if (!$isSuperAdmin) {
            $query->where('company_id', $user->company_id)
                  ->where('plant_id', $user->plant_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $guarantors = $query->orderBy('name')->paginate(10);

        return Inertia::render('Manajemen/Penjamin/Index', [
            'guarantors' => $guarantors,
            'filters' => $request->only(['search']),
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

        return Inertia::render('Manajemen/Penjamin/Create', [
            'companies' => $companies,
            'plants' => $plants,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $request->validate([
            'company_id' => $isSuperAdmin ? 'nullable|exists:companies,id' : 'nullable',
            'plant_id' => $isSuperAdmin ? 'nullable|exists:plants,id' : 'nullable',
            'name' => 'required|string|max:255|unique:guarantors,name',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        Guarantor::create([
            'id' => Str::uuid(),
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('penjamin.index')
            ->with('success', 'Penjamin berhasil ditambahkan.');
    }

    public function show(Guarantor $penjamin)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($penjamin->company_id !== $user->company_id || $penjamin->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $penjamin->load(['company', 'plant', 'creator', 'updater']);

        return Inertia::render('Manajemen/Penjamin/Show', [
            'guarantor' => $penjamin,
        ]);
    }

    public function edit(Guarantor $penjamin)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($penjamin->company_id !== $user->company_id || $penjamin->plant_id !== $user->plant_id) {
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

        return Inertia::render('Manajemen/Penjamin/Edit', [
            'guarantor' => $penjamin,
            'companies' => $companies,
            'plants' => $plants,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function update(Request $request, Guarantor $penjamin)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($penjamin->company_id !== $user->company_id || $penjamin->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'company_id' => $isSuperAdmin ? 'nullable|exists:companies,id' : 'nullable',
            'plant_id' => $isSuperAdmin ? 'nullable|exists:plants,id' : 'nullable',
            'name' => 'required|string|max:255|unique:guarantors,name,' . $penjamin->id . ',id',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $penjamin->update([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('penjamin.index')
            ->with('success', 'Penjamin berhasil diperbarui.');
    }

    public function destroy(Guarantor $penjamin)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($penjamin->company_id !== $user->company_id || $penjamin->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $penjamin->delete();

        return redirect()->route('penjamin.index')
            ->with('success', 'Penjamin berhasil dihapus.');
    }

    public function toggleStatus(Guarantor $penjamin)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($penjamin->company_id !== $user->company_id || $penjamin->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $penjamin->update([
            'is_active' => !$penjamin->is_active,
            'updated_by' => auth()->id(),
        ]);

        $status = $penjamin->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->back()
            ->with('success', "Penjamin berhasil {$status}.");
    }

    public function search(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $query = Guarantor::query()
            ->where('is_active', true)
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId);

        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        $limit = $request->get('limit', 15);
        $guarantors = $query->orderBy('name')->limit($limit)->get()
            ->map(function ($guarantor) {
                return [
                    'id' => $guarantor->id,
                    'name' => $guarantor->name,
                    'code' => $guarantor->name,
                ];
            });

        return response()->json($guarantors);
    }
}
