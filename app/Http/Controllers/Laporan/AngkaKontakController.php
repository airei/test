<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Department;
use App\Models\EmployeeStatus;
use App\Models\Guarantor;
use App\Models\OutpatientQueue;
use App\Models\LabQueue;
use App\Models\Plant;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AngkaKontakController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();

        // Set default values for non-superadmin users
        if (!$isSuperAdmin) {
            $request->merge([
                'company_id' => $user->company_id,
                'plant_id' => $user->plant_id
            ]);
        }

        // Validate required fields for all users
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('service_type') || $request->filled('department_id') || 
            $request->filled('employee_status_id') || $request->filled('shift_id') || 
            $request->filled('gender') || $request->filled('guarantor_id')) {
            
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
            'start_date', 'end_date', 'service_type', 'company_id', 'plant_id',
            'department_id', 'employee_status_id', 'shift_id', 'gender', 'guarantor_id'
        ]);

        // Get master data for filters
        $companies = $isSuperAdmin ? Company::orderBy('name')->get(['id', 'name']) : collect();
        $plants = $isSuperAdmin ? Plant::orderBy('name')->get(['id', 'name', 'company_id']) : collect();
        
        if (!$isSuperAdmin) {
            // For non-superadmin, only show their company and plant
            $companies = Company::where('id', $user->company_id)
                ->where('is_active', true)
                ->get(['id', 'name']);
            
            $plants = Plant::where('id', $user->plant_id)
                ->where('company_id', $user->company_id)
                ->where('is_active', true)
                ->get(['id', 'name', 'company_id']);
        }
        $departments = Department::orderBy('name')->get(['id', 'name', 'company_id', 'plant_id']);
        $shifts = Shift::orderBy('name')->get(['id', 'name', 'company_id', 'plant_id']);
        $employeeStatuses = EmployeeStatus::orderBy('name')->get(['id', 'name', 'company_id', 'plant_id']);
        $guarantors = Guarantor::orderBy('name')->get(['id', 'name', 'company_id', 'plant_id']);

        // Service types
        $serviceTypes = [
            ['value' => 'outpatient', 'label' => 'Rawat Jalan'],
            ['value' => 'laboratory', 'label' => 'Laboratorium'],
        ];

        $angkaKontak = collect();
        $totalRecords = 0;
        $hasSearched = false;

        // Only search if filters are applied
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('service_type') || $request->filled('company_id') || 
            $request->filled('plant_id') || $request->filled('department_id') || 
            $request->filled('employee_status_id') || $request->filled('shift_id') || 
            $request->filled('gender') || $request->filled('guarantor_id')) {
            
            $hasSearched = true;

            // Build query for outpatient visits
            $outpatientQuery = OutpatientQueue::with(['patientRecord.department', 'patientRecord.employeeStatus', 'patientRecord.guarantors', 'medicalRecords.shift', 'medicalRecords.examiner'])
                ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->select([
                    'outpatient_queue.id',
                    'outpatient_queue.created_at as visit_datetime',
                    'outpatient_queue.status',
                    'patient_records.id as patient_record_id',
                    'patient_records.nip',
                    'patient_records.nik',
                    'patient_records.gender',
                    'patient_records.birth_date',
                    'patient_records.department_id',
                    'patient_records.employee_status_id'
                ]);

            // Build query for laboratory visits
            $labQuery = LabQueue::with(['patientRecord.department', 'patientRecord.employeeStatus', 'patientRecord.guarantors', 'labExamDetail.shift', 'labExamDetail.examiner'])
                ->join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->select([
                    'lab_queue.id',
                    'lab_queue.created_at as visit_datetime',
                    'lab_queue.status',
                    'patient_records.id as patient_record_id',
                    'patient_records.nip',
                    'patient_records.nik',
                    'patient_records.gender',
                    'patient_records.birth_date',
                    'patient_records.department_id',
                    'patient_records.employee_status_id'
                ]);

            // Apply filters to both queries
            if ($request->filled('start_date')) {
                $outpatientQuery->whereDate('outpatient_queue.created_at', '>=', $request->start_date);
                $labQuery->whereDate('lab_queue.created_at', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $outpatientQuery->whereDate('outpatient_queue.created_at', '<=', $request->end_date);
                $labQuery->whereDate('lab_queue.created_at', '<=', $request->end_date);
            }

            // Apply patient record filters
            if ($request->filled('company_id') || $request->filled('plant_id') || 
                $request->filled('department_id') || $request->filled('employee_status_id') || 
                $request->filled('gender') || $request->filled('guarantor_id')) {
                
                $outpatientQuery->whereHas('patientRecord', function ($query) use ($request) {
                    if ($request->filled('company_id') && $request->company_id !== 'all') {
                        $query->where('company_id', $request->company_id);
                    }
                    if ($request->filled('plant_id') && $request->plant_id !== 'all') {
                        $query->where('plant_id', $request->plant_id);
                    }
                    if ($request->filled('department_id') && $request->department_id !== 'all') {
                        $query->where('department_id', $request->department_id);
                    }
                    if ($request->filled('employee_status_id') && $request->employee_status_id !== 'all') {
                        $query->where('employee_status_id', $request->employee_status_id);
                    }
                    if ($request->filled('gender') && $request->gender !== 'all') {
                        $query->where('gender', $request->gender);
                    }
                    if ($request->filled('guarantor_id') && $request->guarantor_id !== 'all') {
                        $query->whereHas('guarantors', function ($q) use ($request) {
                            $q->where('guarantors.id', $request->guarantor_id);
                        });
                    }
                });

                $labQuery->whereHas('patientRecord', function ($query) use ($request) {
                    if ($request->filled('company_id') && $request->company_id !== 'all') {
                        $query->where('company_id', $request->company_id);
                    }
                    if ($request->filled('plant_id') && $request->plant_id !== 'all') {
                        $query->where('plant_id', $request->plant_id);
                    }
                    if ($request->filled('department_id') && $request->department_id !== 'all') {
                        $query->where('department_id', $request->department_id);
                    }
                    if ($request->filled('employee_status_id') && $request->employee_status_id !== 'all') {
                        $query->where('employee_status_id', $request->employee_status_id);
                    }
                    if ($request->filled('gender') && $request->gender !== 'all') {
                        $query->where('gender', $request->gender);
                    }
                    if ($request->filled('guarantor_id') && $request->guarantor_id !== 'all') {
                        $query->whereHas('guarantors', function ($q) use ($request) {
                            $q->where('guarantors.id', $request->guarantor_id);
                        });
                    }
                });
            }

            // Apply shift filter
            if ($request->filled('shift_id') && $request->shift_id !== 'all') {
                $outpatientQuery->whereHas('medicalRecords', function ($query) use ($request) {
                    $query->where('shift_id', $request->shift_id);
                });
                $labQuery->whereHas('labExamDetail', function ($query) use ($request) {
                    $query->where('shift_id', $request->shift_id);
                });
            }

            // Get results based on service type
            $results = collect();
            
            if (!$request->filled('service_type') || $request->service_type === 'all' || $request->service_type === 'outpatient') {
                $outpatientResults = $outpatientQuery->get();
                foreach ($outpatientResults as $result) {
                    $results->push([
                        'id' => $result->id,
                        'patient_record_id' => $result->patient_record_id,
                        'patient_name' => $result->patientRecord->name,
                        'service_type' => 'outpatient',
                        'visit_datetime' => $result->visit_datetime,
                        'examiner' => $result->medicalRecords->first()?->examiner->name ?? 'N/A',
                        'status' => $result->status
                    ]);
                }
            }

            if (!$request->filled('service_type') || $request->service_type === 'all' || $request->service_type === 'laboratory') {
                $labResults = $labQuery->get();
                foreach ($labResults as $result) {
                    $results->push([
                        'id' => $result->id,
                        'patient_record_id' => $result->patient_record_id,
                        'patient_name' => $result->patientRecord->name,
                        'service_type' => 'laboratory',
                        'visit_datetime' => $result->visit_datetime,
                        'examiner' => $result->labExamDetail?->examiner->name ?? 'N/A',
                        'status' => $result->status
                    ]);
                }
            }

            // Group by patient only (combine all service types for each patient)
            $groupedResults = $results->groupBy('patient_record_id');

            $angkaKontakData = [];
            foreach ($groupedResults as $patientId => $visits) {
                $firstVisit = $visits->first();
                
                // Group contacts by service type for display
                $contactsByService = $visits->groupBy('service_type');
                $allContacts = [];
                
                foreach ($contactsByService as $serviceType => $serviceVisits) {
                    $serviceLabel = $serviceType === 'outpatient' ? 'Rawat Jalan' : 'Laboratorium';
                    $allContacts[] = [
                        'service_type' => $serviceLabel,
                        'contacts' => $serviceVisits->map(function ($visit) {
                            return [
                                'id' => $visit['id'],
                                'contact_datetime' => $visit['visit_datetime'],
                                'contact_person' => $visit['examiner'],
                                'service_type' => $visit['service_type'] === 'outpatient' ? 'Rawat Jalan' : 'Laboratorium'
                            ];
                        })->toArray()
                    ];
                }
                
                $angkaKontakData[] = [
                    'id' => $patientId,
                    'patient_name' => $firstVisit['patient_name'],
                    'total_contacts' => $visits->count(),
                    'service_types' => $allContacts
                ];
            }

            $totalRecords = count($angkaKontakData);

            // Pagination
            $perPage = 10;
            $currentPage = $request->get('page', 1);
            $offset = ($currentPage - 1) * $perPage;
            $paginatedData = array_slice($angkaKontakData, $offset, $perPage);

            $angkaKontak = [
                'data' => $paginatedData,
                'current_page' => $currentPage,
                'last_page' => ceil($totalRecords / $perPage),
                'per_page' => $perPage,
                'total' => $totalRecords,
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $totalRecords)
            ];
        }

        return Inertia::render('Laporan/AngkaKontak', [
            'angkaKontak' => $angkaKontak,
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
            'serviceTypes' => $serviceTypes,
        ]);
    }
} 