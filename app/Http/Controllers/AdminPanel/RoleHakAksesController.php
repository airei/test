<?php

namespace App\Http\Controllers\AdminPanel;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleHakAksesController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $roles = Role::with(['permissions'])
            ->when($search, function($query, $search) {
                $query->where('display_name', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%");
            })
            ->orderBy('display_name')
            ->paginate(10)
            ->withQueryString();

        // Transform data untuk frontend
        $roles->getCollection()->transform(function ($role) {
            $roleData = $role->toArray();
            $roleData['permissions'] = $role->permission_modules;
            return $roleData;
        });

        return Inertia::render('AdminPanel/RoleHakAkses/Index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'modules' => 'array',
        ]);

        // Debug: Log request data
        \Log::info('Role Store Request:', [
            'name' => $request->name,
            'display_name' => $request->display_name,
            'modules' => $request->modules,
        ]);

        $role = Role::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_active' => true,
        ]);

        // Sync permissions berdasarkan permission names yang dipilih
        if (!empty($request->modules)) {
            $permissionIds = Permission::whereIn('name', $request->modules)->pluck('id');
            
            // Debug: Log permission data
            \Log::info('Permission Sync Data:', [
                'requested_modules' => $request->modules,
                'found_permission_ids' => $permissionIds->toArray(),
            ]);
            
            // Attach permissions dengan pivot data
            foreach ($permissionIds as $permissionId) {
                $role->permissions()->attach($permissionId, [
                    'created_by' => Auth::id(),
                    'updated_by' => Auth::id(),
                ]);
            }
        }

        \Log::info('Role Created Successfully:', [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'permissions_count' => $role->permissions()->count(),
        ]);

        return redirect()->route('role-hak-akses.index')
            ->with('success', 'Role berhasil dibuat.');
    }

    public function create()
    {
        // Ambil semua permission, group by modul
        $permissions = Permission::orderBy('module')->orderBy('display_name')->get();
        $modules = $permissions->groupBy('module')->map(function($perms, $module) {
            return [
                'module' => $module,
                'display' => ucwords(str_replace('_', ' ', $module)),
                'permissions' => $perms->map(function($p) {
                    return [
                        'name' => $p->name,
                        'display_name' => $p->display_name,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('AdminPanel/RoleHakAkses/Create', [
            'modules' => $modules,
        ]);
    }

    // Redirect ke edit jika ada akses ke detail
    public function show(Role $role)
    {
        return redirect()->route('role-hak-akses.edit', $role->id);
    }

    public function edit(Role $role)
    {
        $role->load(['permissions']);
        $permissions = Permission::orderBy('module')->orderBy('display_name')->get();
        $modules = $permissions->groupBy('module')->map(function($perms, $module) {
            return [
                'module' => $module,
                'display' => ucwords(str_replace('_', ' ', $module)),
                'permissions' => $perms->map(function($p) {
                    return [
                        'name' => $p->name,
                        'display_name' => $p->display_name,
                    ];
                })->values(),
            ];
        })->values();

        // Transform data untuk frontend
        $roleData = $role->toArray();
        $roleData['permissions'] = $role->permissions->pluck('name')->toArray();

        return Inertia::render('AdminPanel/RoleHakAkses/Edit', [
            'role' => $roleData,
            'modules' => $modules,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'modules' => 'array',
        ]);

        $role->update([
            'display_name' => $request->display_name,
            'description' => $request->description,
        ]);

        // Sync permissions berdasarkan permission names yang dipilih
        if (!empty($request->modules)) {
            $permissionIds = Permission::whereIn('name', $request->modules)->pluck('id');
            
            // Detach semua permissions yang ada
            $role->permissions()->detach();
            
            // Attach permissions baru dengan pivot data
            foreach ($permissionIds as $permissionId) {
                $role->permissions()->attach($permissionId, [
                    'updated_by' => Auth::id(),
                ]);
            }
        } else {
            $role->permissions()->detach();
        }

        return redirect()->route('role-hak-akses.index')
            ->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('role-hak-akses.index')->with('success', 'Role berhasil dihapus.');
    }

    public function toggleStatus(Role $role)
    {
        $role->update(['is_active' => !$role->is_active]);
        return redirect()->route('role-hak-akses.index')->with('success', 'Status role berhasil diubah.');
    }

    public function syncModules()
    {
        // Gunakan command GenerateAllPermissions untuk konsistensi
        try {
            // Panggil command GenerateAllPermissions
            \Artisan::call('permission:generate-all', ['--force' => false]);
            
            // Panggil command SyncRolePermissions untuk super admin
            \Artisan::call('permission:sync-roles', ['--role' => 'super_admin']);
            
            $output = \Artisan::output();
            
                    return redirect()->route('role-hak-akses.index')
            ->with('success', 'Sinkronisasi modul berhasil! Semua permission telah di-generate dan super admin telah di-assign semua permission.');
            
    } catch (\Exception $e) {
        return redirect()->route('role-hak-akses.index')
            ->with('error', 'Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage());
    }
}

public function syncRoles()
{
    try {
        // Panggil command SyncRolePermissions
        \Artisan::call('permission:sync-roles', ['--force' => false]);
        
        $output = \Artisan::output();
        
        return redirect()->route('role-hak-akses.index')
            ->with('success', 'Sinkronisasi role berhasil! Semua role telah di-sync dengan permission yang ada.');
            
    } catch (\Exception $e) {
        return redirect()->route('role-hak-akses.index')
            ->with('error', 'Terjadi kesalahan saat sinkronisasi role: ' . $e->getMessage());
    }
}
}
