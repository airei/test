<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\EmployeeStatus;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class StatusKaryawanController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $query = EmployeeStatus::with(['company', 'plant', 'creator']);

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

        $employeeStatuses = $query->orderBy('name')->paginate(10);

        return Inertia::render('Manajemen/StatusKaryawan/Index', [
            'employeeStatuses' => $employeeStatuses,
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

        return Inertia::render('Manajemen/StatusKaryawan/Create', [
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
            'name' => 'required|string|max:255|unique:employee_statuses,name',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        EmployeeStatus::create([
            'id' => Str::uuid(),
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('status-karyawan.index')
            ->with('success', 'Status karyawan berhasil ditambahkan.');
    }

    public function show(EmployeeStatus $statusKaryawan)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($statusKaryawan->company_id !== $user->company_id || $statusKaryawan->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $statusKaryawan->load(['company', 'plant', 'creator', 'updater']);

        return Inertia::render('Manajemen/StatusKaryawan/Show', [
            'employeeStatus' => $statusKaryawan,
        ]);
    }

    public function edit(EmployeeStatus $statusKaryawan)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($statusKaryawan->company_id !== $user->company_id || $statusKaryawan->plant_id !== $user->plant_id) {
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

        return Inertia::render('Manajemen/StatusKaryawan/Edit', [
            'employeeStatus' => $statusKaryawan,
            'companies' => $companies,
            'plants' => $plants,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function update(Request $request, EmployeeStatus $statusKaryawan)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($statusKaryawan->company_id !== $user->company_id || $statusKaryawan->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'company_id' => $isSuperAdmin ? 'nullable|exists:companies,id' : 'nullable',
            'plant_id' => $isSuperAdmin ? 'nullable|exists:plants,id' : 'nullable',
            'name' => 'required|string|max:255|unique:employee_statuses,name,' . $statusKaryawan->id . ',id',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $statusKaryawan->update([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('status-karyawan.index')
            ->with('success', 'Status karyawan berhasil diperbarui.');
    }

    public function destroy(EmployeeStatus $statusKaryawan)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($statusKaryawan->company_id !== $user->company_id || $statusKaryawan->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $statusKaryawan->delete();

        return redirect()->route('status-karyawan.index')
            ->with('success', 'Status karyawan berhasil dihapus.');
    }

    public function toggleStatus(EmployeeStatus $statusKaryawan)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($statusKaryawan->company_id !== $user->company_id || $statusKaryawan->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $statusKaryawan->update([
            'is_active' => !$statusKaryawan->is_active,
            'updated_by' => auth()->id(),
        ]);

        $status = $statusKaryawan->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->back()
            ->with('success', "Status karyawan berhasil {$status}.");
    }
}
