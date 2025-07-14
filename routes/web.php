<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;

use App\Http\Controllers\Pelayanan\RegistrasiRekamMedisController;
use App\Http\Controllers\Pelayanan\RawatJalanController;
use App\Http\Controllers\Pelayanan\KonsultasiController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminPanel\CompanyPlantController;
use App\Http\Controllers\AdminPanel\RoleHakAksesController;
use App\Http\Controllers\AdminPanel\UserController;
use App\Http\Controllers\AdminPanel\DiagnosaController;
use App\Http\Controllers\Manajemen\DepartemenController;
use App\Http\Controllers\Manajemen\ShiftController;
use App\Http\Controllers\Manajemen\StatusKaryawanController;
use App\Http\Controllers\Manajemen\PenjaminController;
use App\Http\Controllers\Manajemen\LaboratoriumController;
use App\Http\Controllers\Manajemen\InventoryController;
use App\Http\Controllers\Manajemen\InventoryCategoryController;
use App\Http\Controllers\Manajemen\InventoryUnitController;
use App\Http\Controllers\Laporan\KunjunganRawatJalanController;
use App\Http\Controllers\Laporan\KunjunganPemeriksaanLabController;
use App\Http\Controllers\Laporan\AngkaKontakController;
use App\Http\Controllers\Laporan\ObatKeluarController;
use App\Http\Controllers\Laporan\TagihanController;
use Illuminate\Http\Request;
use App\Http\Controllers\Pelayanan\ResumeMedisController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('api/dashboard/overview', [DashboardController::class, 'overviewChart']);
    Route::get('api/dashboard/demografi', [DashboardController::class, 'demografiChart']);
    Route::get('api/dashboard/operasional', [DashboardController::class, 'operasionalChart']);
    Route::get('api/dashboard/filters', [DashboardController::class, 'filterOptions']);
    Route::get('api/dashboard/low-stock', [DashboardController::class, 'getLowStockItems']);
});

// Pelayanan Routes
Route::prefix('pelayanan')->middleware(['auth', 'verified', 'module:pelayanan'])->group(function () {
    // API untuk dropdown data berdasarkan company dan plant (harus sebelum resource route)
    Route::get('registrasi-rekam-medis/dropdown-data', [RegistrasiRekamMedisController::class, 'getDropdownData'])
        ->name('pelayanan.registrasi-rekam-medis.dropdown-data');
    
    // API untuk plants berdasarkan company  
    Route::get('registrasi-rekam-medis/plants-by-company', [RegistrasiRekamMedisController::class, 'getPlantsByCompany'])
        ->name('pelayanan.registrasi-rekam-medis.plants-by-company');
    
    // API untuk search patient guarantors
    Route::get('patient-guarantors/search', [RegistrasiRekamMedisController::class, 'searchPatientGuarantors'])
        ->name('patient-guarantors.search');
    
    // Registrasi Rekam Medis Routes
    Route::resource('registrasi-rekam-medis', RegistrasiRekamMedisController::class)
        ->names('pelayanan.registrasi-rekam-medis')
        ->parameters(['registrasi-rekam-medis' => 'registrasiRekamMedis']);
    
    // Rawat Jalan Routes
    Route::get('/rawat-jalan', [RawatJalanController::class, 'index'])->name('pelayanan.rawat-jalan.index');
    Route::patch('/rawat-jalan/{id}/status', [RawatJalanController::class, 'updateStatus'])->name('pelayanan.rawat-jalan.update-status');
    
    // Konsultasi Routes
    Route::get('/konsultasi/{id}', [KonsultasiController::class, 'show'])->name('konsultasi.show');
    Route::post('/konsultasi/{id}', [KonsultasiController::class, 'store'])->name('konsultasi.store');
    
    Route::get('/pemeriksaan-lab', [\App\Http\Controllers\Pelayanan\PemeriksaanLabController::class, 'index'])->name('pelayanan.pemeriksaan-lab.index');
    Route::patch('/pemeriksaan-lab/{id}/status', [\App\Http\Controllers\Pelayanan\PemeriksaanLabController::class, 'updateStatus'])->name('pelayanan.pemeriksaan-lab.update-status');
    
    // Lab examination routes
    Route::get('/lab/{id}', [\App\Http\Controllers\Pelayanan\PemeriksaanLabController::class, 'show'])->name('lab.show');
    Route::post('/lab/{id}', [\App\Http\Controllers\Pelayanan\PemeriksaanLabController::class, 'store'])->name('lab.store');
    Route::get('/lab/{id}/print', [\App\Http\Controllers\Pelayanan\PemeriksaanLabController::class, 'print'])->name('lab.print');
    
    // Riwayat Rekam Medis Routes
    Route::get('/riwayat-rekam-medis/{patientId}', [\App\Http\Controllers\Pelayanan\RiwayatRekamMedisController::class, 'show'])
        ->name('pelayanan.riwayat-rekam-medis.show');
    
    Route::get('/konsultasi-lab', function (Request $request) {
        $patient = null;
        if ($request->has('patient_id')) {
            $patient = \App\Models\PatientRecord::with(['company', 'plant', 'department', 'employeeStatus'])
                ->find($request->patient_id);
        }
        return Inertia::render('Pelayanan/Konsultasi', [
            'patient' => $patient,
            'patient_id' => $request->patient_id
        ]);
    })->name('pelayanan.konsultasi-lab');
});

// Manajemen Routes
Route::prefix('manajemen')->middleware(['auth', 'verified', 'module:manajemen'])->group(function () {
    // Export dan Import routes harus didefinisikan sebelum resource route
    Route::get('departemen/export', [DepartemenController::class, 'export'])->name('departemen.export');
    Route::get('departemen/template', [DepartemenController::class, 'template'])->name('departemen.template');
    Route::get('departemen/import', [DepartemenController::class, 'showImport'])->name('departemen.import');
    Route::post('departemen/import', [DepartemenController::class, 'import'])->name('departemen.import.store');
    
    Route::resource('departemen', DepartemenController::class)
        ->names('departemen')
        ->parameters(['departemen' => 'departemen']);
    Route::patch('departemen/{departemen}/toggle-status', [DepartemenController::class, 'toggleStatus'])->name('departemen.toggle-status');
    
    Route::get('shift/search', [ShiftController::class, 'search'])->name('shift.search');
    Route::resource('shift', ShiftController::class)->names('shift');
    Route::patch('shift/{shift}/toggle-status', [ShiftController::class, 'toggleStatus'])->name('shift.toggle-status');
    
    Route::resource('status-karyawan', StatusKaryawanController::class)->names('status-karyawan');
    Route::patch('status-karyawan/{statusKaryawan}/toggle-status', [StatusKaryawanController::class, 'toggleStatus'])->name('status-karyawan.toggle-status');
    Route::get('penjamin/search', [PenjaminController::class, 'search'])->name('penjamin.search');
    
    Route::resource('penjamin', PenjaminController::class)->names('penjamin');
    Route::patch('penjamin/{penjamin}/toggle-status', [PenjaminController::class, 'toggleStatus'])->name('penjamin.toggle-status');
    
    Route::get('laboratorium/search', [LaboratoriumController::class, 'search'])->name('laboratorium.search');
    Route::get('laboratorium/export', [LaboratoriumController::class, 'export'])->name('laboratorium.export');
    Route::get('laboratorium/import', [LaboratoriumController::class, 'showImport'])->name('laboratorium.import');
    Route::post('laboratorium/import', [LaboratoriumController::class, 'import'])->name('laboratorium.import.store');
    Route::get('laboratorium/template', [LaboratoriumController::class, 'template'])->name('laboratorium.template');
    Route::get('laboratorium/plants/{companyId}', [LaboratoriumController::class, 'getPlantsByCompany'])->name('laboratorium.plants-by-company');
    Route::resource('laboratorium', LaboratoriumController::class)
        ->names('laboratorium')
        ->parameters(['laboratorium' => 'labMaster']);
    Route::patch('laboratorium/{laboratorium}/toggle-status', [LaboratoriumController::class, 'toggleStatus'])->name('laboratorium.toggle-status');
    
    // Inventory search route harus didefinisikan sebelum resource route
    Route::get('inventory/search', [InventoryController::class, 'search'])->name('inventory.search');
    Route::get('inventory/categories-units', [InventoryController::class, 'getCategoriesAndUnits'])->name('inventory.categories-units');
    
    // Inventory export dan import routes
    Route::get('inventory/export', [InventoryController::class, 'export'])->name('inventory.export');
    Route::get('inventory/template', [InventoryController::class, 'exportTemplate'])->name('inventory.template');
    Route::get('inventory/import', [InventoryController::class, 'showImport'])->name('inventory.import');
    Route::post('inventory/import', [InventoryController::class, 'import'])->name('inventory.import.store');
    
    Route::resource('inventory', InventoryController::class)->names('inventory')->parameters([
        'inventory' => 'inventoryItem'
    ]);
    Route::patch('inventory/{inventoryItem}/toggle-status', [InventoryController::class, 'toggleStatus'])->name('inventory.toggle-status');
    
    // Stock Management Routes
    Route::get('inventory/{inventoryItem}/add-stock', [InventoryController::class, 'showAddStock'])->name('inventory.add-stock');
    Route::post('inventory/{inventoryItem}/add-stock', [InventoryController::class, 'addStock'])->name('inventory.add-stock.store');
    
    Route::get('inventory/{inventoryItem}/reduce-stock', [InventoryController::class, 'showReduceStock'])->name('inventory.reduce-stock');
    Route::post('inventory/{inventoryItem}/reduce-stock', [InventoryController::class, 'reduceStock'])->name('inventory.reduce-stock.store');
    
    Route::get('inventory/{inventoryItem}/adjust-stock', [InventoryController::class, 'showAdjustStock'])->name('inventory.adjust-stock');
    Route::post('inventory/{inventoryItem}/adjust-stock', [InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock.store');
    
    Route::get('inventory/{inventoryItem}/stock-history', [InventoryController::class, 'showStockHistory'])->name('inventory.stock-history');
    
    // All History Route
    Route::get('inventory-all-history', [InventoryController::class, 'showAllHistory'])->name('inventory.all-history');
    
    // Inventory Category Routes
    Route::resource('inventory-category', InventoryCategoryController::class)->names('inventory.category')->parameters([
        'inventory-category' => 'category'
    ]);
    Route::patch('inventory-category/{category}/toggle-status', [InventoryCategoryController::class, 'toggleStatus'])->name('inventory.category.toggle-status');
    
    // Inventory Unit Routes
    Route::resource('inventory-unit', InventoryUnitController::class)->names('inventory.unit')->parameters([
        'inventory-unit' => 'unit'
    ]);
    Route::patch('inventory-unit/{unit}/toggle-status', [InventoryUnitController::class, 'toggleStatus'])->name('inventory.unit.toggle-status');
});

// Laporan Routes
Route::prefix('laporan')->middleware(['auth', 'verified', 'module:laporan'])->group(function () {
    Route::get('/kunjungan-rawat-jalan', [KunjunganRawatJalanController::class, 'index'])->name('laporan.kunjungan-rawat-jalan');
    
    Route::get('/kunjungan-pemeriksaan-lab', [KunjunganPemeriksaanLabController::class, 'index'])->name('laporan.kunjungan-pemeriksaan-lab');
    
    Route::get('/angka-kontak', [AngkaKontakController::class, 'index'])->name('laporan.angka-kontak');
    
    Route::get('/obat-keluar', [ObatKeluarController::class, 'index'])->name('laporan.obat-keluar');
    
    Route::get('/tagihan', [TagihanController::class, 'index'])->name('laporan.tagihan');
});

// Admin Panel Routes
Route::prefix('admin')->middleware(['auth', 'verified', 'module:admin'])->group(function () {
    Route::get('/company-plant', [CompanyPlantController::class, 'index'])->name('company-plant');
    Route::get('/role-hak-akses', function () {
        return Inertia::render('AdminPanel/RoleHakAkses/Index');
    })->name('admin.role-hak-akses');
    
    Route::resource('user', UserController::class)->except(['show'])->names('user');
    Route::patch('user/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('user.toggle-status');
    Route::get('user/search', [UserController::class, 'search'])->name('user.search');
    Route::get('diagnosa/export', [DiagnosaController::class, 'export'])->name('diagnosa.export');
    Route::get('diagnosa/template', [DiagnosaController::class, 'downloadTemplate'])->name('diagnosa.template');
    Route::get('diagnosa/import', [DiagnosaController::class, 'showImport'])->name('diagnosa.import');
    Route::post('diagnosa/import', [DiagnosaController::class, 'import'])->name('diagnosa.import.store');
    Route::resource('diagnosa', DiagnosaController::class)->except(['show'])->names('diagnosa');
    Route::patch('diagnosa/{diagnosa}/toggle-status', [DiagnosaController::class, 'toggleStatus'])->name('diagnosa.toggle-status');
    Route::get('diagnosa/search', [DiagnosaController::class, 'search'])->name('diagnosa.search');

    // Company routes
    Route::get('/company/create', [CompanyPlantController::class, 'createCompany'])->name('company.create');
    Route::get('/company/{company}/edit', [CompanyPlantController::class, 'editCompany'])->name('company.edit');
    Route::post('/company', [CompanyPlantController::class, 'storeCompany'])->name('company.store');
    Route::put('/company/{company}', [CompanyPlantController::class, 'updateCompany'])->name('company.update');
    Route::delete('/company/{company}', [CompanyPlantController::class, 'destroyCompany'])->name('company.destroy');
    Route::patch('/company/{company}/toggle-status', [CompanyPlantController::class, 'toggleCompanyStatus'])->name('company.toggle-status');
    
    // Plant routes
    Route::get('/plant/create', [CompanyPlantController::class, 'createPlant'])->name('plant.create');
    Route::get('/plant/{plant}/edit', [CompanyPlantController::class, 'editPlant'])->name('plant.edit');
    Route::post('/plant', [CompanyPlantController::class, 'storePlant'])->name('plant.store');
    Route::put('/plant/{plant}', [CompanyPlantController::class, 'updatePlant'])->name('plant.update');
    Route::delete('/plant/{plant}', [CompanyPlantController::class, 'destroyPlant'])->name('plant.destroy');
    Route::patch('/plant/{plant}/toggle-status', [CompanyPlantController::class, 'togglePlantStatus'])->name('plant.toggle-status');

    Route::resource('role-hak-akses', RoleHakAksesController::class)->parameters([
        'role-hak-akses' => 'role'
    ]);
    Route::patch('role-hak-akses/{role}/toggle-status', [RoleHakAksesController::class, 'toggleStatus'])->name('role-hak-akses.toggle-status');
    Route::post('role-hak-akses/sync-modules', [RoleHakAksesController::class, 'syncModules'])->name('role-hak-akses.sync-modules');
    Route::get('role-hak-akses/sync-roles', [RoleHakAksesController::class, 'syncRoles'])->name('role-hak-akses.sync-roles');
});

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
});

Route::get('/debug/modules', function () {
    $user = auth()->user();
    if (!$user) return 'Not logged in';
    return [
        'user' => $user->email,
        'modules' => $user->getAccessibleModules(),
        'permissions' => $user->getAllPermissions()->pluck('name'),
        'role' => $user->role ? $user->role->name : null,
    ];
});

// Route print resume medis rawat jalan
Route::get('/resume-medis/print/{outpatientQueueId}', [ResumeMedisController::class, 'print'])->name('resume-medis.print');

// Debug route untuk mengecek data companies dan plants
Route::get('/debug/import-data', function () {
    $user = auth()->user();
    $isSuperAdmin = $user->role && $user->role->name === 'super_admin';
    
    if (!$isSuperAdmin) {
        return response()->json(['error' => 'Not super admin']);
    }
    
    $companies = \App\Models\Company::where('is_active', true)->get(['id', 'name']);
    $plants = \App\Models\Plant::where('is_active', true)->get(['id', 'name', 'company_id']);
    
    return response()->json([
        'isSuperAdmin' => $isSuperAdmin,
        'companies' => $companies,
        'plants' => $plants,
        'companies_count' => $companies->count(),
        'plants_count' => $plants->count(),
    ]);
})->name('debug.import-data');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
