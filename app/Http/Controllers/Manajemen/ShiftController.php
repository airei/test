<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $query = Shift::with(['company', 'plant', 'creator']);

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

        $shifts = $query->orderBy('name')->paginate(10);

        return Inertia::render('Manajemen/Shift/Index', [
            'shifts' => $shifts,
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

        return Inertia::render('Manajemen/Shift/Create', [
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
            'name' => 'required|string|max:255|unique:shifts,name',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Validasi tambahan: end_time boleh sebelum start_time (shift malam),
        // tetapi tidak boleh sama persis dengan start_time.
        if ($request->start_time === $request->end_time) {
            return back()->withErrors([
                'end_time' => 'Waktu selesai tidak boleh sama dengan waktu mulai.'
            ])->withInput();
        }

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        Shift::create([
            'id' => Str::uuid(),
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('shift.index')
            ->with('success', 'Shift berhasil ditambahkan.');
    }

    public function show(Shift $shift)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($shift->company_id !== $user->company_id || $shift->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $shift->load(['company', 'plant', 'creator', 'updater']);

        return Inertia::render('Manajemen/Shift/Show', [
            'shift' => $shift,
        ]);
    }

    public function edit(Shift $shift)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($shift->company_id !== $user->company_id || $shift->plant_id !== $user->plant_id) {
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

        return Inertia::render('Manajemen/Shift/Edit', [
            'shift' => $shift,
            'companies' => $companies,
            'plants' => $plants,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function update(Request $request, Shift $shift)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($shift->company_id !== $user->company_id || $shift->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $request->validate([
            'company_id' => $isSuperAdmin ? 'nullable|exists:companies,id' : 'nullable',
            'plant_id' => $isSuperAdmin ? 'nullable|exists:plants,id' : 'nullable',
            'name' => 'required|string|max:255|unique:shifts,name,' . $shift->id . ',id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Validasi tambahan untuk update: end_time boleh sebelum start_time (shift malam) namun tidak boleh sama.
        if ($request->start_time === $request->end_time) {
            return back()->withErrors([
                'end_time' => 'Waktu selesai tidak boleh sama dengan waktu mulai.'
            ])->withInput();
        }

        // Untuk user biasa, gunakan company dan plant user
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $shift->update([
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('shift.index')
            ->with('success', 'Shift berhasil diperbarui.');
    }

    public function destroy(Shift $shift)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($shift->company_id !== $user->company_id || $shift->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $shift->delete();

        return redirect()->route('shift.index')
            ->with('success', 'Shift berhasil dihapus.');
    }

    public function toggleStatus(Shift $shift)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Validasi akses multi-tenant
        if (!$isSuperAdmin) {
            if ($shift->company_id !== $user->company_id || $shift->plant_id !== $user->plant_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
        }

        $shift->update([
            'is_active' => !$shift->is_active,
            'updated_by' => auth()->id(),
        ]);

        $status = $shift->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->back()
            ->with('success', "Shift berhasil {$status}.");
    }

    public function search(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        // Debug: log parameter yang diterima
        \Log::info('Shift search params:', [
            'company_id' => $companyId,
            'plant_id' => $plantId,
            'q' => $request->q,
            'limit' => $request->get('limit', 15),
            'user_role' => $user->role->name
        ]);

        $query = Shift::query()
            ->where('is_active', true);

        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        if ($plantId) {
            $query->where('plant_id', $plantId);
        }

        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        $limit = $request->get('limit', 15);
        $shifts = $query->orderBy('name')->limit($limit)->get();
        
        // Debug: log hasil query
        \Log::info('Shift search results:', [
            'count' => $shifts->count(),
            'shifts' => $shifts->toArray()
        ]);
        
        $formattedShifts = $shifts->map(function ($shift) {
            // Pastikan start_time dan end_time adalah Carbon instance
            $startTime = $shift->start_time instanceof \Carbon\Carbon 
                ? $shift->start_time->format('H:i') 
                : $shift->start_time;
            $endTime = $shift->end_time instanceof \Carbon\Carbon 
                ? $shift->end_time->format('H:i') 
                : $shift->end_time;
                
            return [
                'id' => $shift->id,
                'name' => "{$shift->name} ({$startTime} - {$endTime})",
                'code' => $shift->name,
            ];
        });

        return response()->json($formattedShifts);
    }
}
