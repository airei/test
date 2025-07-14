<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\OutpatientQueue;
use App\Models\Company;
use App\Models\Plant;
use App\Models\Department;
use App\Models\Shift;
use App\Models\EmployeeStatus;
use App\Models\Guarantor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KunjunganRawatJalanController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Set default values for non-superadmin users
        if (!$isSuperAdmin) {
            $request->merge([
                'company_id' => $user->company_id,
                'plant_id' => $user->plant_id
            ]);
        }

        // Validate required fields for all users
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('department_id') || $request->filled('gender') || 
            $request->filled('shift_id') || $request->filled('age_start') || 
            $request->filled('age_end') || $request->filled('employee_status_id') || 
            $request->filled('guarantor_id') || $request->filled('status')) {
            
            // Validate company_id and plant_id are required
            if (!$request->filled('company_id') || !$request->filled('plant_id')) {
                return back()->withErrors([
                    'company_id' => 'Perusahaan harus dipilih.',
                    'plant_id' => 'Plant harus dipilih.'
                ]);
            }
        }

        // Get filter parameters
        $filters = $request->only([
            'start_date',
            'end_date',
            'company_id',
            'plant_id',
            'department_id',
            'gender',
            'shift_id',
            'age_start',
            'age_end',
            'employee_status_id',
            'guarantor_id',
            'status'
        ]);

        // Get companies and plants for filter
        $companies = collect();
        $plants = collect();
        
        if ($isSuperAdmin) {
            $companies = Company::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);
            
            $plants = Plant::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id']);
        } else {
            // For non-superadmin, only show their company and plant
            $companies = Company::where('id', $user->company_id)
                ->where('is_active', true)
                ->get(['id', 'name']);
            
            $plants = Plant::where('id', $user->plant_id)
                ->where('company_id', $user->company_id)
                ->where('is_active', true)
                ->get(['id', 'name', 'company_id']);
        }

        // Get departments for filter - show all departments for selected company/plant
        $departments = collect();
        if ($isSuperAdmin) {
            // For super admin, get all departments
            $departments = Department::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        } else {
            // For regular user, get departments for their company/plant
            $departments = Department::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        }

        // Get shifts for filter - show all shifts for selected company/plant
        $shifts = collect();
        if ($isSuperAdmin) {
            // For super admin, get all shifts
            $shifts = Shift::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        } else {
            // For regular user, get shifts for their company/plant
            $shifts = Shift::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        }

        // Get employee statuses for filter - show all employee statuses for selected company/plant
        $employeeStatuses = collect();
        if ($isSuperAdmin) {
            // For super admin, get all employee statuses
            $employeeStatuses = EmployeeStatus::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        } else {
            // For regular user, get employee statuses for their company/plant
            $employeeStatuses = EmployeeStatus::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        }

        // Get guarantors for filter - show all guarantors for selected company/plant
        $guarantors = collect();
        if ($isSuperAdmin) {
            // For super admin, get all guarantors
            $guarantors = Guarantor::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        } else {
            // For regular user, get guarantors for their company/plant
            $guarantors = Guarantor::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->orderBy('name')
                ->get(['id', 'name', 'company_id', 'plant_id']);
        }

        // Initialize data as empty
        $kunjungan = collect();
        $totalRecords = 0;
        $hasSearched = false;

        // Only fetch data if filters are applied
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('company_id') || $request->filled('plant_id') || 
            $request->filled('department_id') || $request->filled('gender') || 
            $request->filled('shift_id') || $request->filled('age_start') || 
            $request->filled('age_end') || $request->filled('employee_status_id') || 
            $request->filled('guarantor_id') || $request->filled('status')) {
            
            $hasSearched = true;
            
            $query = OutpatientQueue::with([
                'patientRecord.guarantors.guarantor',
                'patientRecord.employeeStatus',
                'patientRecord.department',
                'patientRecord.company',
                'patientRecord.plant',
                'medicalRecords.shift',
                'createdBy'
            ])
            ->when(true, function($query) use ($request, $isSuperAdmin, $user) {
                $query->whereHas('patientRecord', function($q) use ($request, $isSuperAdmin, $user) {
                    if (!$isSuperAdmin) {
                        $q->where('company_id', $user->company_id)
                          ->where('plant_id', $user->plant_id);
                    }
                    if ($request->filled('company_id')) {
                        $q->where('company_id', $request->company_id);
                    }
                    if ($request->filled('plant_id')) {
                        $q->where('plant_id', $request->plant_id);
                    }
                    if ($request->filled('department_id') && $request->department_id !== 'all') {
                        $q->where('department_id', $request->department_id);
                    }
                    if ($request->filled('gender') && $request->gender !== 'all') {
                        $q->where('gender', $request->gender);
                    }
                    if ($request->filled('employee_status_id') && $request->employee_status_id !== 'all') {
                        $q->where('employee_status_id', $request->employee_status_id);
                    }
                    if ($request->filled('age_start') && $request->age_start !== '') {
                        $q->whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) >= ?', [$request->age_start]);
                    }
                    if ($request->filled('age_end') && $request->age_end !== '') {
                        $q->whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) <= ?', [$request->age_end]);
                    }
                });
            })
            // filter relasi lain tetap
            ->when($request->filled('shift_id') && $request->shift_id !== 'all', function($query) use ($request) {
                $query->whereHas('medicalRecords', function($q) use ($request) {
                    $q->where('shift_id', $request->shift_id);
                });
            })
            ->when($request->filled('guarantor_id') && $request->guarantor_id !== 'all', function($query) use ($request) {
                $query->whereHas('patientRecord.guarantors', function($q) use ($request) {
                    $q->where('guarantors_id', $request->guarantor_id);
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc');

            $totalRecords = $query->count();
            \Log::info('SQL Query: ' . $query->toSql());
            \Log::info('Query Bindings: ' . json_encode($query->getBindings()));
            
            $kunjungan = $query->paginate(15)
                ->withQueryString()
                ->through(function ($item) {
                    return [
                        'id' => $item->id,
                        'visit_datetime' => $item->created_at?->format('d/m/Y H:i') ?? '-',
                        'patient_name' => $item->patientRecord?->name ?? '-',
                        'nip' => $item->patientRecord?->nip ?? $item->patientRecord?->nik ?? '-',
                        'nik' => $item->patientRecord?->nik ?? '-',
                        'guarantor' => $item->patientRecord?->guarantors?->first()?->guarantor?->name ?? '-',
                        'department' => $item->patientRecord?->department?->name ?? '-',
                        'employee_status' => $item->patientRecord?->employeeStatus?->name ?? '-',
                        'company' => $item->patientRecord?->company?->name ?? '-',
                        'plant' => $item->patientRecord?->plant?->name ?? '-',
                        'status' => $item->status,
                        'status_text' => $this->getStatusText($item->status),
                    ];
                });
        }

        return Inertia::render('Laporan/KunjunganRawatJalan', [
            'kunjungan' => $kunjungan,
            'totalRecords' => $totalRecords,
            'hasSearched' => $hasSearched,
            'filters' => $filters,
            'companies' => $companies,
            'plants' => $plants,
            'departments' => $departments,
            'shifts' => $shifts,
            'employeeStatuses' => $employeeStatuses,
            'guarantors' => $guarantors,
            'isSuperAdmin' => $isSuperAdmin,
            'statusOptions' => [
                ['value' => 'all', 'label' => 'Semua Status'],
                ['value' => 'waiting', 'label' => 'Menunggu'],
                ['value' => 'in_progress', 'label' => 'Sedang Berlangsung'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'cancelled', 'label' => 'Dibatalkan'],
            ],
        ]);
    }

    private function getStatusText($status)
    {
        return match($status) {
            'waiting' => 'Menunggu',
            'in_progress' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }
}
