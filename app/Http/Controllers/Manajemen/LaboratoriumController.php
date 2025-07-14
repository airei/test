<?php

namespace App\Http\Controllers\Manajemen;

use App\Http\Controllers\Controller;
use App\Models\LabMaster;
use App\Models\LabReference;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Exports\LaboratoriumExport;
use App\Exports\LaboratoriumTemplateExport;
use App\Imports\LaboratoriumImport;
use Illuminate\Support\Facades\Log;

class LaboratoriumController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $user = Auth::user();
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
        
        $query = LabMaster::with(['company', 'plant', 'references']);
        
        // Filter berdasarkan company dan plant untuk user biasa
        if (!$isSuperAdmin) {
            $query->where('company_id', $user->company_id)
                  ->where('plant_id', $user->plant_id);
        }
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
                }

        $labMasters = $query->orderBy('created_at', 'desc')
                           ->paginate(10)
                           ->withQueryString();

        $importErrors = session('import_errors', []);

        $canExport = $user && $user->hasPermission('laboratorium.export');
        $canImport = $user && $user->hasPermission('laboratorium.import');

        return Inertia::render('Manajemen/Laboratorium/Index', [
            'labMasters' => $labMasters,
            'filters' => ['search' => $search],
            'isSuperAdmin' => $isSuperAdmin,
            'import_errors' => $importErrors,
            'canExport' => $canExport,
            'canImport' => $canImport,
        ]);
    }

    public function create()
    {
        $user = auth()->user()->load('role');
        
        $data = [
            'isSuperAdmin' => $user->role && $user->role->name === 'super_admin',
            'userCompany' => null,
            'userPlant' => null,
        ];

        if ($data['isSuperAdmin']) {
            $data['companies'] = Company::all();
            $data['plants'] = Plant::all(); // Semua plants untuk super admin
        } else {
            $data['userCompany'] = Company::find($user->company_id);
            $data['userPlant'] = Plant::find($user->plant_id);
        }

        return Inertia::render('Manajemen/Laboratorium/Create', $data);
    }

    public function store(Request $request)
    {
        try {
            // Log company_id dan plant_id
            \Log::info('Request company_id:', [$request->company_id]);
            \Log::info('Request plant_id:', [$request->plant_id]);

            // Validasi input
            $request->validate([
                'company_id' => 'required|exists:companies,id',
                'plant_id' => 'required|exists:plants,id',
                'name' => 'required|string|max:255',
                'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'references' => 'required|array|min:1',
            'references.*.type' => 'required|in:universal,male,female',
            'references.*.reference' => 'required|string|max:255',
        ]);

            // Ambil data user
            $user = auth()->user();
            $companyId = $user->role && $user->role->name === 'super_admin' ? $request->company_id : $user->company_id;
            $plantId = $user->role && $user->role->name === 'super_admin' ? $request->plant_id : $user->plant_id;

            \Log::info('Final company_id:', [$companyId]);
            \Log::info('Final plant_id:', [$plantId]);

            // Buat lab master
            $labMaster = LabMaster::create([
                'company_id' => $companyId,
                'plant_id' => $plantId,
                'name' => $request->name,
                'unit' => $request->unit,
                'price' => $request->price,
            ]);

            // Buat referensi laboratorium
            foreach ($request->references as $referenceData) {
            LabReference::create([
                'lab_master_id' => $labMaster->id,
                    'reference_type' => $referenceData['type'],
                    'reference' => $referenceData['reference'],
            ]);
        }

            return response()->json([
                'success' => true,
                'message' => 'Data laboratorium berhasil ditambahkan!',
                'data' => $labMaster
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(LabMaster $labMaster)
    {
        abort(404, 'Halaman tidak ditemukan');
    }

    public function edit(LabMaster $labMaster)
    {
        // Authorize policy
        $this->authorize('update', $labMaster);

        $user = auth()->user()->load('role');
        $data = [
            'isSuperAdmin' => $user->role && $user->role->name === 'super_admin',
            'userCompany' => null,
            'userPlant' => null,
            'labMaster' => $labMaster->load('references'),
            'companies' => [],
            'plants' => [],
        ];

        if ($data['isSuperAdmin']) {
            $data['companies'] = \App\Models\Company::all();
            $data['plants'] = \App\Models\Plant::all();
        } else {
            $data['userCompany'] = \App\Models\Company::find($user->company_id);
            $data['userPlant'] = \App\Models\Plant::find($user->plant_id);
        }
        
        return Inertia::render('Manajemen/Laboratorium/Edit', $data);
    }

    public function update(Request $request, LabMaster $labMaster)
    {
        // Authorize policy
        $this->authorize('update', $labMaster);
        
        // Debug: Log request data
        \Log::info('Update Laboratorium Request:', $request->all());
        
        $request->validate([
            'name' => 'required|string|max:100',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'references' => 'required|array|min:1',
            'references.*.reference_type' => 'required|in:universal,male,female',
            'references.*.reference' => 'required|string',
        ]);

        try {
            $user = auth()->user();
            $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
            
            // Update lab master
            $updateData = [
                'name' => $request->name,
                'unit' => $request->unit,
                'price' => $request->price,
                'updated_by' => Auth::id(),
            ];
            
            // Jika super admin, update company_id dan plant_id juga
            if ($isSuperAdmin && $request->has('company_id') && $request->has('plant_id')) {
                $updateData['company_id'] = $request->company_id;
                $updateData['plant_id'] = $request->plant_id;
            }
            
            $labMaster->update($updateData);

            // Hapus references lama dan buat yang baru
        $labMaster->references()->delete();
            
            foreach ($request->references as $ref) {
            LabReference::create([
                'lab_master_id' => $labMaster->id,
                    'reference_type' => $ref['reference_type'],
                    'reference' => $ref['reference'],
                'created_by' => Auth::id(),
                ]);
            }

            \Log::info('Update Laboratorium Success:', ['lab_master_id' => $labMaster->id]);

            return redirect()->route('laboratorium.index')
                           ->with('success', 'Data laboratorium berhasil diperbarui!');

        } catch (\Exception $e) {
            \Log::error('Update Laboratorium Error:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    public function destroy(LabMaster $labMaster)
    {
        try {
            // Authorize policy
            $this->authorize('delete', $labMaster);

            $user = Auth::user();
            $isSuperAdmin = $user->role && $user->role->name === 'super_admin';

            // Validasi akses multi-tenant
            if (!$isSuperAdmin) {
                if ($labMaster->company_id !== $user->company_id || $labMaster->plant_id !== $user->plant_id) {
                    abort(403, 'Anda tidak memiliki akses ke data ini.');
                }
            }

            // Hapus data
            $deleted = $labMaster->delete();

            if ($deleted) {
                return redirect()->route('laboratorium.index')
                               ->with('success', 'Data laboratorium berhasil dihapus!');
            } else {
                return back()->withErrors(['error' => 'Gagal menghapus data: Delete operation returned false']);
            }

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->withErrors(['error' => 'Anda tidak memiliki izin untuk menghapus data ini.']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus(LabMaster $labMaster)
    {
        // Authorize policy
        $this->authorize('update', $labMaster);
        
        try {
            $labMaster->update([
                'is_active' => !$labMaster->is_active,
                'updated_by' => Auth::id(),
            ]);

            $status = $labMaster->is_active ? 'diaktifkan' : 'dinonaktifkan';
            return redirect()->route('laboratorium.index')
                           ->with('success', "Data laboratorium berhasil {$status}!");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengubah status: ' . $e->getMessage()]);
        }
    }

    public function getPlantsByCompany($companyId)
    {
        $plants = Plant::where('company_id', $companyId)->get();
        return response()->json($plants);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $companyId = $request->get('company_id');
        $plantId = $request->get('plant_id');
        $limit = $request->get('limit', 10);
        
        $user = Auth::user();
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
        
        $labMasters = LabMaster::with(['references'])
            ->where('is_active', true);
        
        // Filter berdasarkan company dan plant
        if ($isSuperAdmin) {
            if ($companyId) {
                $labMasters->where('company_id', $companyId);
            }
            if ($plantId) {
                $labMasters->where('plant_id', $plantId);
            }
        } else {
            $labMasters->where('company_id', $user->company_id)
                     ->where('plant_id', $user->plant_id);
        }
        
        // Search by name
        if ($query) {
            $labMasters->where('name', 'like', "%{$query}%");
        }
        
        $results = $labMasters->limit($limit)->get();
        
        // Transform results untuk memastikan references dikirim dengan benar
        $transformedResults = $results->map(function ($labMaster) {
            return [
                'id' => $labMaster->id,
                'name' => $labMaster->name,
                'unit' => $labMaster->unit,
                'price' => $labMaster->price,
                'is_active' => $labMaster->is_active,
                'references' => $labMaster->references->map(function ($reference) {
                    return [
                        'id' => $reference->id,
                        'reference_type' => $reference->reference_type,
                        'reference' => $reference->reference,
                    ];
                }),
            ];
        });
        
        return response()->json($transformedResults);
    }

    /**
     * Export laboratorium to Excel
     */
    public function export()
    {
        try {
            \Log::info('Export laboratorium started');
            
            $export = new LaboratoriumExport();
            return $export->export();
            
        } catch (\Exception $e) {
            \Log::error('Export laboratorium error: ' . $e->getMessage());
            \Log::error('Export laboratorium error trace: ' . $e->getTraceAsString());
            
            return redirect()->route('laboratorium.index')
                ->with('error', 'Gagal mengexport data: ' . $e->getMessage());
        }
    }

    /**
     * Show import form
     */
    public function showImport()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
        
        $data = [
            'import_errors' => session('import_errors', []),
            'isSuperAdmin' => $isSuperAdmin,
        ];
        
        // Add companies and plants data for super admin
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)->get(['id', 'name']);
            $plants = Plant::where('is_active', true)->get(['id', 'name', 'company_id']);
            
            $data['companies'] = $companies;
            $data['plants'] = $plants;
            
            // Debug logging
            Log::info('Import form data for super admin', [
                'companies_count' => $companies->count(),
                'plants_count' => $plants->count(),
                'companies' => $companies->toArray(),
                'plants' => $plants->toArray(),
            ]);
        }
        
        return Inertia::render('Manajemen/Laboratorium/Import', $data);
    }

    /**
     * Import laboratorium from Excel
     */
    public function import(Request $request)
    {
        Log::info('Laboratorium import called with FastExcel', ['user_id' => auth()->id()]);
        
        $user = auth()->user();
        if (!$user || !$user->hasPermission('laboratorium.import')) {
            Log::warning('Laboratorium import forbidden', ['user_id' => auth()->id()]);
            abort(403, 'Tidak punya akses import laboratorium');
        }
        
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
        
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
                'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
                'plant_id' => $isSuperAdmin ? 'required|exists:plants,id' : 'nullable',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Laboratorium import validation error', ['error' => $e->getMessage()]);
            if ($request->expectsJson() || $request->ajax()) {
                throw $e;
            }
            return Inertia::render('Manajemen/Laboratorium/Import', [
                'import_errors' => [],
            ])->withErrors($e->validator)->withInput();
        }
        
        try {
            // Clear previous session data
            session()->forget('import_errors');
            
            // Store uploaded file with proper handling
            $uploadedFile = $request->file('file');
            $filename = 'laboratorium_import_' . time() . '_' . $uploadedFile->getClientOriginalName();
            
            // Ensure temp directory exists
            $tempDir = storage_path('app/temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            // Save file directly to temp directory
            $fullPath = $tempDir . '/' . $filename;
            $uploadedFile->move($tempDir, $filename);
            
            Log::info('File stored for import', [
                'original_name' => $uploadedFile->getClientOriginalName(),
                'stored_path' => $fullPath,
                'file_exists' => file_exists($fullPath),
                'file_size' => file_exists($fullPath) ? filesize($fullPath) : 0
            ]);
            
            // Verify file exists before proceeding
            if (!file_exists($fullPath)) {
                throw new \Exception("File tidak dapat disimpan dengan benar: $fullPath");
            }
            
            $import = new LaboratoriumImport();
            
            // Pass company_id and plant_id to import
            $importData = [
                'filePath' => $fullPath,
                'company_id' => $isSuperAdmin ? $request->company_id : $user->company_id,
                'plant_id' => $isSuperAdmin ? $request->plant_id : $user->plant_id,
                'isSuperAdmin' => $isSuperAdmin,
            ];
            
            // Use database transaction
            DB::beginTransaction();
            
            try {
                $result = $import->import($importData);
                $imported = $result['imported'];
                $errors = $result['errors'];
                $totalErrors = count($errors);
                $totalRows = $import->getTotalRows();
                
                // Create summary for session
                $errorSummary = [];
                if (!empty($errors)) {
                    DB::rollback();
                    
                    $errorSummary[] = "📊 RINGKASAN IMPORT:";
                    $errorSummary[] = "• Total baris diproses: {$totalRows}";
                    $errorSummary[] = "• Berhasil diimpor: {$imported}";
                    $errorSummary[] = "• Total error: {$totalErrors}";
                    $errorSummary[] = "";
                    $errorSummary[] = "🚨 DAFTAR ERROR (Maksimal 50 error pertama):";
                    
                    foreach (array_slice($errors, 0, 50) as $error) {
                        $errorSummary[] = "• " . $error;
                    }
                    
                    if ($totalErrors > 50) {
                        $errorSummary[] = "";
                        $errorSummary[] = "⚠️ Dan " . ($totalErrors - 50) . " error lainnya tidak ditampilkan.";
                        $errorSummary[] = "Silakan perbaiki error di atas terlebih dahulu.";
                    }
                    
                    $message = "Import gagal dengan {$totalErrors} error dari {$totalRows} baris data.";
                } else {
                    DB::commit();
                    $errorSummary[] = "✅ IMPORT BERHASIL!";
                    $errorSummary[] = "• Total baris diproses: {$totalRows}";
                    $errorSummary[] = "• Berhasil diimpor: {$imported}";
                    $errorSummary[] = "• Error: 0";
                    
                    $message = "Berhasil mengimpor {$imported} pemeriksaan laboratorium dari {$totalRows} baris data.";
                }
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
            
            Log::info('Laboratorium import result with FastExcel', [
                'imported' => $imported, 
                'total_errors' => $totalErrors,
                'total_rows' => $totalRows,
                'error_preview' => array_slice($errors, 0, 5)
            ]);
            
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
            
            return redirect()->route('laboratorium.index')
                ->with($imported > 0 && empty($errors) ? 'success' : 'error', $message)
                ->with('import_errors', $errorSummary);
                
        } catch (\Throwable $e) {
            DB::rollback();
            Log::error('Laboratorium import error with FastExcel', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            // Clean up file if it exists
            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            // Create minimal error summary
            $systemError = [
                "🚨 SYSTEM ERROR:",
                "• " . $e->getMessage(),
                "",
                "💡 SOLUSI:",
                "• Pastikan file Excel sesuai format template",
                "• Coba upload file dengan jumlah baris lebih sedikit", 
                "• Periksa koneksi database"
            ];
            
            return Inertia::render('Manajemen/Laboratorium/Import', [
                'import_errors' => $systemError,
            ])->with('error', 'Gagal mengimpor file. Silakan coba lagi.');
        }
    }

    /**
     * Download template import laboratorium
     */
    public function template()
    {
        try {
            $export = new LaboratoriumTemplateExport();
            return $export->export();
        } catch (\Exception $e) {
            return response('Gagal mengunduh template: ' . $e->getMessage(), 500)
                ->header('Content-Type', 'text/plain');
        }
    }
} 