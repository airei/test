<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Department;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\DepartemenExport;
use App\Imports\DepartemenImport;

class DepartemenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        
        $departmen = Department::with(['company', 'plant', 'creator', 'updater'])
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $importErrors = session('import_errors', []);

        $user = auth()->user();
        $canExport = $user && $user->hasPermission('departemen.export');
        $canImport = $user && $user->hasPermission('departemen.import');

        return Inertia::render('Manajemen/Departemen/Index', [
            'departments' => $departmen,
            'filters' => [
                'search' => $search,
            ],
            'import_errors' => $importErrors,
            'canExport' => $canExport,
            'canImport' => $canImport,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $companies = Company::where('is_active', true)->orderBy('name')->get();
        $plants = Plant::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Manajemen/Departemen/Create', [
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $departmen = Department::create([
            'company_id' => $request->company_id,
            'plant_id' => $request->plant_id,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $departemen)
    {
        $departemen->load(['company', 'plant', 'creator', 'updater']);
        
        return Inertia::render('Manajemen/Departemen/Show', [
            'department' => $departemen,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Department $departemen)
    {
        $companies = Company::where('is_active', true)->orderBy('name')->get();
        $plants = Plant::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Manajemen/Departemen/Edit', [
            'department' => $departemen,
            'companies' => $companies,
            'plants' => $plants,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $departemen)
    {
        $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $departemen->update([
            'company_id' => $request->company_id,
            'plant_id' => $request->plant_id,
            'name' => $request->name,
            'description' => $request->description,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $departemen)
    {
        \Log::info('Destroy called', [
            'route_param' => request()->route('departemen'),
            'id' => $departemen->id ?? null,
            'departemen' => $departemen
        ]);
        $departemen->delete();
        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil dihapus.');
    }

    /**
     * Toggle the active status of the department.
     */
    public function toggleStatus(Department $departemen)
    {
        \Log::info('ToggleStatus called', [
            'id' => $departemen->id,
            'before' => $departemen->is_active,
        ]);
        $departemen->update([
            'is_active' => !$departemen->is_active,
            'updated_by' => auth()->id(),
        ]);
        \Log::info('ToggleStatus after', [
            'id' => $departemen->id,
            'after' => $departemen->fresh()->is_active,
        ]);
        $status = $departemen->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->route('departemen.index')
            ->with('success', "Departemen berhasil {$status}.");
    }

    /**
     * Export departments to Excel
     */
    public function export()
    {
        try {
            \Log::info('Export started');
            
            $export = new DepartemenExport();
            return $export->export();
            
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage());
            \Log::error('Export error trace: ' . $e->getTraceAsString());
            
            return redirect()->route('departemen.index')
                ->with('error', 'Gagal mengexport data: ' . $e->getMessage());
        }
    }

    public function template()
    {
        try {
            $export = new \App\Exports\DepartemenTemplateExport();
            return $export->export();
        } catch (\Exception $e) {
            return response('Gagal mengunduh template: ' . $e->getMessage(), 500)
                ->header('Content-Type', 'text/plain');
        }
    }

    public function showImport()
    {
        $importErrors = session('import_errors', []);
        $user = auth()->user();
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
        $data = [
            'import_errors' => $importErrors,
            'isSuperAdmin' => $isSuperAdmin,
        ];
        if ($isSuperAdmin) {
            $data['companies'] = \App\Models\Company::where('is_active', true)->get(['id', 'name']);
            $data['plants'] = \App\Models\Plant::where('is_active', true)->get(['id', 'name', 'company_id']);
        }
        return Inertia::render('Manajemen/Departemen/Import', $data);
    }

    /**
     * Import departments from Excel
     */
    public function import(Request $request)
    {
        try {
            \Log::info('Import started');
            $user = auth()->user();
            $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
                'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
                'plant_id' => $isSuperAdmin ? 'required|exists:plants,id' : 'nullable',
            ]);

            \Log::info('File validation passed');
            \Log::info('File name: ' . $request->file('file')->getClientOriginalName());

            // Simpan file ke temp
            $uploadedFile = $request->file('file');
            $filename = 'departemen_import_' . time() . '_' . $uploadedFile->getClientOriginalName();
            $tempDir = storage_path('app/temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            $fullPath = $tempDir . '/' . $filename;
            $uploadedFile->move($tempDir, $filename);

            $import = new DepartemenImport();
            \Log::info('Import class created');
            $importData = [
                'filePath' => $fullPath,
                'company_id' => $isSuperAdmin ? $request->company_id : $user->company_id,
                'plant_id' => $isSuperAdmin ? $request->plant_id : $user->plant_id,
            ];
            $result = $import->import($importData);

            $imported = $result['imported'];
            $errors = $result['errors'];

            \Log::info('Import completed. Imported: ' . $imported . ', Errors: ' . count($errors));

            $message = "Berhasil mengimpor {$imported} departemen.";
            if (!empty($errors)) {
                $message .= " Terdapat " . count($errors) . " error.";
                \Log::info('Import errors: ' . implode(', ', $errors));
            }

            // Clean up temporary file
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            return redirect()->route('departemen.index')
                ->with('success', $message)
                ->with('import_errors', $errors);

        } catch (\Exception $e) {
            \Log::error('Import error: ' . $e->getMessage());
            \Log::error('Import error trace: ' . $e->getTraceAsString());
            return redirect()->route('departemen.index')
                ->with('error', 'Gagal mengimpor file: ' . $e->getMessage());
        }
    }
}
