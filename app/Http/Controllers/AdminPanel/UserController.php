<?php

namespace App\Http\Controllers\AdminPanel;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $users = User::with(['role', 'company', 'plant'])
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('AdminPanel/User/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        $roles = Role::where('is_active', true)->get();
        $companies = Company::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();
        
        return Inertia::render('AdminPanel/User/Create', [
            'roles' => $roles,
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'nullable|exists:roles,id',
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role_id' => $request->role_id,
            'company_id' => $request->company_id,
            'plant_id' => $request->plant_id,
            'is_active' => true,
        ]);

        return redirect()->route('user.index')
            ->with('success', 'User berhasil dibuat.');
    }

    public function show(User $user)
    {
        $user->load(['role', 'company', 'plant']);
        
        return Inertia::render('AdminPanel/User/View', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['role', 'company', 'plant']);
        $roles = Role::where('is_active', true)->get();
        $companies = Company::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();
        
        return Inertia::render('AdminPanel/User/Edit', [
            'user' => $user,
            'roles' => $roles,
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'nullable|exists:roles,id',
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'company_id' => $request->company_id,
            'plant_id' => $request->plant_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return redirect()->route('user.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('user.index')
            ->with('success', 'User berhasil dihapus.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->route('user.index')->with('success', "Pengguna berhasil {$status}.");
    }

    public function search(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'super_admin';
        
        $companyId = $isSuperAdmin ? $request->company_id : $user->company_id;
        $plantId = $isSuperAdmin ? $request->plant_id : $user->plant_id;

        $query = User::query()->where('is_active', true);
        
        if ($request->filled('q')) {
            $query->where('name', 'like', "%{$request->q}%");
        }
        
        // Priority filtering: same company & plant > same company > all users
        if ($companyId && $plantId) {
            // First try: users from same company and plant
            $sameCompanyPlantUsers = clone $query;
            $sameCompanyPlantUsers->where('company_id', $companyId)->where('plant_id', $plantId);
            
            $limit = $request->get('limit', 15);
            $users = $sameCompanyPlantUsers->orderBy('name')->limit($limit)->get(['id', 'name']);
            
            // If no users found in same company & plant, try same company only
            if ($users->isEmpty() && $companyId) {
                $sameCompanyUsers = clone $query;
                $sameCompanyUsers->where('company_id', $companyId);
                $users = $sameCompanyUsers->orderBy('name')->limit($limit)->get(['id', 'name']);
            }
            
            // If still no users found, get all active users
            if ($users->isEmpty()) {
                $users = $query->orderBy('name')->limit($limit)->get(['id', 'name']);
            }
        } else {
            // If no company/plant info, get all active users
        $limit = $request->get('limit', 15);
        $users = $query->orderBy('name')->limit($limit)->get(['id', 'name']);
        }

        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'code' => $user->name,
            ];
        });

        return response()->json($formattedUsers);
    }
}
