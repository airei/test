<?php

namespace App\Http\Controllers\AdminPanel;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyPlantController extends Controller
{
    /**
     * Display a listing of companies with their plants.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        
        $companies = Company::with(['plants' => function($query) {
            $query->orderBy('name');
        }])
        ->when($search, function($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        })
        ->orderBy('name')
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('AdminPanel/Company/Index', [
            'companies' => $companies,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new company.
     */
    public function createCompany()
    {
        return Inertia::render('AdminPanel/Company/Create');
    }

    /**
     * Show the form for creating a new plant.
     */
    public function createPlant()
    {
        $companies = Company::where('is_active', true)->orderBy('name')->get();
        return Inertia::render('AdminPanel/Plant/Create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Show the form for editing the specified company.
     */
    public function editCompany(Company $company)
    {
        return Inertia::render('AdminPanel/Company/Edit', [
            'company' => $company,
        ]);
    }

    /**
     * Show the form for editing the specified plant.
     */
    public function editPlant(Plant $plant)
    {
        $companies = Company::where('is_active', true)->orderBy('name')->get();
        return Inertia::render('AdminPanel/Plant/Edit', [
            'plant' => $plant,
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created company.
     */
    public function storeCompany(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        // Generate kode otomatis (3 digit)
        $lastCompany = Company::orderBy('code', 'desc')->first();
        $nextCode = '001';
        
        if ($lastCompany && $lastCompany->code) {
            $lastCode = (int) $lastCompany->code;
            $nextCode = str_pad($lastCode + 1, 3, '0', STR_PAD_LEFT);
        }

        $company = Company::create([
            'code' => $nextCode,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('company-plant')->with('success', 'Perusahaan berhasil ditambahkan.');
    }

    /**
     * Update the specified company.
     */
    public function updateCompany(Request $request, Company $company)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $company->update([
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('company-plant')->with('success', 'Perusahaan berhasil diperbarui.');
    }

    /**
     * Remove the specified company.
     */
    public function destroyCompany(Company $company)
    {
        $company->delete();
        return redirect()->route('company-plant')->with('success', 'Perusahaan berhasil dihapus.');
    }

    /**
     * Toggle company status.
     */
    public function toggleCompanyStatus(Company $company)
    {
        $company->update([
            'is_active' => !$company->is_active,
            'updated_by' => Auth::id(),
        ]);

        $status = $company->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->route('company-plant')->with('success', "Perusahaan berhasil {$status}.");
    }

    /**
     * Store a newly created plant.
     */
    public function storePlant(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $plant = Plant::create([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('company-plant')->with('success', 'Plant berhasil ditambahkan.');
    }

    /**
     * Update the specified plant.
     */
    public function updatePlant(Request $request, Plant $plant)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $plant->update([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('company-plant')->with('success', 'Plant berhasil diperbarui.');
    }

    /**
     * Remove the specified plant.
     */
    public function destroyPlant(Plant $plant)
    {
        $plant->delete();
        return redirect()->route('company-plant')->with('success', 'Plant berhasil dihapus.');
    }

    /**
     * Toggle plant status.
     */
    public function togglePlantStatus(Plant $plant)
    {
        $plant->update([
            'is_active' => !$plant->is_active,
            'updated_by' => Auth::id(),
        ]);

        $status = $plant->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->route('company-plant')->with('success', "Plant berhasil {$status}.");
    }
}
