<?php

namespace App\Http\Controllers\AdminPanel;

use App\Http\Controllers\Controller;
use App\Models\Diagnosa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\DiagnosaExport;
use App\Imports\DiagnosaImport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DiagnosaController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.view')) {
            abort(403, 'Tidak punya akses lihat diagnosa');
        }

        $query = Diagnosa::query();

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $diagnosas = $query->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        // Check permissions for import/export
        $canExport = $user && $user->hasPermission('diagnosa.export');
        $canImport = $user && $user->hasPermission('diagnosa.import');

        return Inertia::render('AdminPanel/Diagnosa/Index', [
            'diagnosas' => $diagnosas,
            'filters' => $request->only(['search', 'status']),
            'canExport' => $canExport,
            'canImport' => $canImport,
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.create')) {
            abort(403, 'Tidak punya akses tambah diagnosa');
        }
        return Inertia::render('AdminPanel/Diagnosa/Create');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.create')) {
            abort(403, 'Tidak punya akses tambah diagnosa');
        }

        $request->validate([
            'code' => 'required|unique:diagnosas,code|max:50',
            'name' => 'required|max:300',
            'description' => 'nullable|max:300',
        ]);

        Diagnosa::create([
            'code' => $request->code,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('diagnosa.index')
            ->with('success', 'Diagnosa berhasil ditambahkan.');
    }

    public function show(Diagnosa $diagnosa)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.view')) {
            abort(403, 'Tidak punya akses lihat diagnosa');
        }

        return Inertia::render('AdminPanel/Diagnosa/Show', [
            'diagnosa' => $diagnosa,
        ]);
    }

    public function edit(Diagnosa $diagnosa)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.edit')) {
            abort(403, 'Tidak punya akses edit diagnosa');
        }
        return Inertia::render('AdminPanel/Diagnosa/Edit', [
            'diagnosa' => $diagnosa,
        ]);
    }

    public function update(Request $request, Diagnosa $diagnosa)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.edit')) {
            abort(403, 'Tidak punya akses edit diagnosa');
        }

        $request->validate([
            'code' => 'required|unique:diagnosas,code,' . $diagnosa->id . '|max:50',
            'name' => 'required|max:300',
            'description' => 'nullable|max:300',
        ]);

        $diagnosa->update([
            'code' => $request->code,
            'name' => $request->name,
            'description' => $request->description,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('diagnosa.index')
            ->with('success', 'Diagnosa berhasil diupdate.');
    }

    public function destroy(Diagnosa $diagnosa)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.delete')) {
            abort(403, 'Tidak punya akses hapus diagnosa');
        }

        $diagnosa->delete();

        return redirect()->route('diagnosa.index')
            ->with('success', 'Diagnosa berhasil dihapus.');
    }

    public function toggleStatus(Diagnosa $diagnosa)
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.edit')) {
            abort(403, 'Tidak punya akses edit diagnosa');
        }

        $diagnosa->update([
            'is_active' => !$diagnosa->is_active,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('diagnosa.index')
            ->with('success', 'Status diagnosa berhasil diubah.');
    }

    public function export()
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.export')) {
            abort(403, 'Tidak punya akses export diagnosa');
        }
        
        $filename = 'diagnosa_' . date('Y-m-d_H-i-s') . '.xlsx';
        return (new DiagnosaExport())->export($filename);
    }

    public function downloadTemplate()
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.import')) {
            abort(403, 'Tidak punya akses download template');
        }
        
        $filename = 'template_diagnosa_' . date('Y-m-d') . '.xlsx';
        return (new DiagnosaExport())->exportTemplate($filename);
    }

    public function showImport()
    {
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.import')) {
            abort(403, 'Tidak punya akses import diagnosa');
        }
        $importErrors = session('import_errors', []);
        return Inertia::render('AdminPanel/Diagnosa/Import', [
            'import_errors' => $importErrors,
        ]);
    }

    public function import(Request $request)
    {
        Log::info('Diagnosa import called with FastExcel', ['user_id' => auth()->id()]);
        
        $user = auth()->user();
        if (!$user || !$user->hasPermission('diagnosa.import')) {
            Log::warning('Diagnosa import forbidden', ['user_id' => auth()->id()]);
            abort(403, 'Tidak punya akses import diagnosa');
        }
        
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Diagnosa import validation error', ['error' => $e->getMessage()]);
            if ($request->expectsJson() || $request->ajax()) {
                throw $e;
            }
            return Inertia::render('AdminPanel/Diagnosa/Import', [
                'import_errors' => [],
            ])->withErrors($e->validator)->withInput();
        }
        
        try {
            // Clear previous session data
            session()->forget('import_errors');
            
            // Store uploaded file with proper handling
            $uploadedFile = $request->file('file');
            $filename = 'diagnosa_import_' . time() . '_' . $uploadedFile->getClientOriginalName();
            
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
            
            // Use database transaction
            DB::beginTransaction();
            
            $import = new DiagnosaImport();
            $import->import($fullPath);
            
            $imported = $import->getImportedCount();
            $created = $import->getCreatedCount();
            $updated = $import->getUpdatedCount();
            $errors = $import->getErrors();
            $totalErrors = $import->getTotalErrorCount();
            $totalRows = $import->getTotalRows();
            
            // Create summary for session
            $errorSummary = [];
            if (!empty($errors)) {
                DB::rollback();
                
                $errorSummary[] = "📊 RINGKASAN IMPORT:";
                $errorSummary[] = "• Total baris diproses: {$totalRows}";
                $errorSummary[] = "• Berhasil diimpor: {$imported}";
                $errorSummary[] = "  - Dibuat baru: {$created}";
                $errorSummary[] = "  - Diupdate: {$updated}";
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
                $errorSummary[] = "  - Dibuat baru: {$created}";
                $errorSummary[] = "  - Diupdate: {$updated}";
                $errorSummary[] = "• Error: 0";
                
                $message = "Berhasil mengimpor {$imported} diagnosa dari {$totalRows} baris data ({$created} baru, {$updated} diupdate).";
            }
            
            Log::info('Diagnosa import result with FastExcel', [
                'imported' => $imported,
                'created' => $created,
                'updated' => $updated,
                'total_errors' => $totalErrors,
                'total_rows' => $totalRows,
                'error_preview' => array_slice($errors, 0, 5)
            ]);
            
            // Clean up temporary file
            if (file_exists($fullPath)) {
                unlink($fullPath);
                Log::info('Temporary file cleaned up', ['file' => $fullPath]);
            }
            
            return redirect()->route('diagnosa.index')
                ->with($imported > 0 && empty($errors) ? 'success' : 'error', $message)
                ->with('import_errors', $errorSummary);
                
        } catch (\Throwable $e) {
            DB::rollback();
            Log::error('Diagnosa import error with FastExcel', [
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
            
            return Inertia::render('AdminPanel/Diagnosa/Import', [
                'import_errors' => $systemError,
            ])->with('error', 'Gagal mengimpor file. Silakan coba lagi.');
        }
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        if (empty($search)) {
            return response()->json([]);
        }

        $diagnosas = Diagnosa::where('is_active', true)
            ->where(function($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(15)
            ->get(['id', 'code', 'name', 'description']);

        return response()->json($diagnosas);
    }
}
