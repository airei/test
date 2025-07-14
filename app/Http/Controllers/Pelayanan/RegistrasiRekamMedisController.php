<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use App\Models\PatientRecord;
use App\Models\Company;
use App\Models\Plant;
use App\Models\Department;
use App\Models\EmployeeStatus;
use App\Models\OutpatientQueue;
use App\Models\LabRequest;
use App\Models\Guarantor;
use App\Models\PatientToGuarantor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RegistrasiRekamMedisController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientRecord::with([
            'company',
            'plant', 
            'department',
            'employeeStatus',
            'outpatientQueues',
            'labQueues'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('medical_record_number', 'like', "%{$search}%");
            });
        }

        // Filter by company
        if ($request->filled('company_id') && $request->company_id !== 'all') {
            $query->where('company_id', $request->company_id);
        }

        // Filter by plant
        if ($request->filled('plant_id') && $request->plant_id !== 'all') {
            $query->where('plant_id', $request->plant_id);
        }

        // Filter by department
        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        // Filter by employee status
        if ($request->filled('employee_status_id') && $request->employee_status_id !== 'all') {
            $query->where('employee_status_id', $request->employee_status_id);
        }

        $patientRecords = $query->orderBy('created_at', 'desc')
                               ->paginate(10)
                               ->withQueryString();

        // Transform data untuk menampilkan umur dan informasi tambahan
        $patientRecords->getCollection()->transform(function ($patient) {
            $patient->age = Carbon::parse($patient->birth_date)->age;
            $patient->last_visit = $patient->outpatientQueues->last()?->created_at;
            $patient->last_lab = $patient->labQueues->last()?->created_at;
            $patient->total_visits = $patient->outpatientQueues->count();
            $patient->total_labs = $patient->labQueues->count();
            return $patient;
        });

        // Data untuk filter
        $companies = Company::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();
        $departments = Department::where('is_active', true)->get();
        $employeeStatuses = EmployeeStatus::where('is_active', true)->get();

        return Inertia::render('Pelayanan/RegistrasiRekamMedis/Index', [
            'patientRecords' => $patientRecords,
            'filters' => [
                'companies' => $companies,
                'plants' => $plants,
                'departments' => $departments,
                'employeeStatuses' => $employeeStatuses,
            ],
            'search' => $request->search ?? '',
            'company_id' => $request->company_id ?? '',
            'plant_id' => $request->plant_id ?? '',
            'department_id' => $request->department_id ?? '',
            'employee_status_id' => $request->employee_status_id ?? '',
        ]);
    }

    public function show($id)
    {
        $patient = PatientRecord::with([
            'company',
            'plant',
            'department', 
            'employeeStatus',
            'guarantors.guarantor'
        ])->findOrFail($id);

        $patient->age = Carbon::parse($patient->birth_date)->age;

        return Inertia::render('Pelayanan/RegistrasiRekamMedis/Show', [
            'patientRecord' => $patient
        ]);
    }

    public function edit($id)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();

        $patient = PatientRecord::with([
            'company',
            'plant',
            'department',
            'employeeStatus'
        ])->findOrFail($id);

        $companies = Company::where('is_active', true)->get();
        
        if ($isSuperAdmin) {
            // Super admin - Plants will be fetched dynamically, but we need the initial list for the patient's current company to avoid data flash.
            $plants = Plant::where('is_active', true)
                ->where('company_id', $patient->company_id)
                ->get();

            // Super admin - Load departments, employee statuses, and guarantors for the patient's current company and plant
            $departments = Department::where('is_active', true)
                ->where('company_id', $patient->company_id)
                ->where('plant_id', $patient->plant_id)
                ->get();
            
            $employeeStatuses = EmployeeStatus::where('is_active', true)
                ->where('company_id', $patient->company_id)
                ->where('plant_id', $patient->plant_id)
                ->get();
            
            $guarantors = Guarantor::where('is_active', true)
                ->where('company_id', $patient->company_id)
                ->where('plant_id', $patient->plant_id)
                ->get();
        } else {
            // User biasa - data ter-filter berdasarkan company_id dan plant_id user
            $plants = Plant::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->get();
            
            $departments = Department::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
            
            $employeeStatuses = EmployeeStatus::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
            
            $guarantors = Guarantor::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
        }

        // Get patient guarantor data if exists
        $patientToGuarantors = PatientToGuarantor::with('guarantor')
            ->where('patient_records_id', $patient->id)
            ->get();

        // Debug: Log data yang akan dikirim
        \Log::info('Edit Patient Data:', [
            'patient_id' => $patient->id,
            'patient_gender' => $patient->gender,
            'patient_blood_type' => $patient->blood_type,
            'patient_blood_rhesus' => $patient->blood_rhesus,
            'patient_company_id' => $patient->company_id,
            'patient_plant_id' => $patient->plant_id,
            'patient_department_id' => $patient->department_id,
            'patient_employee_status_id' => $patient->employee_status_id,
            'companies_count' => $companies->count(),
            'plants_count' => $plants->count(),
            'departments_count' => $departments->count(),
            'employee_statuses_count' => $employeeStatuses->count(),
            'guarantors_count' => $guarantors->count(),
            'patient_guarantors_count' => $patientToGuarantors->count(),
        ]);

        // Pastikan data dikirim dengan format yang benar
        $patientData = $patient->toArray();
        
        // Add guarantors data
        $patientData['guarantors'] = $patientToGuarantors->map(function ($patientToGuarantor) {
            return [
                'id' => $patientToGuarantor->id,
                'guarantor_id' => $patientToGuarantor->guarantors_id,
                'guarantor_number' => $patientToGuarantor->guarantor_number,
            ];
        })->toArray();
        
        // Debug: Log patient data array
        \Log::info('Patient Data Array:', $patientData);

        return Inertia::render('Pelayanan/RegistrasiRekamMedis/Edit', [
            'patientRecord' => $patientData,
            'companies' => $companies,
            'plants' => $plants,
            'departments' => $departments,
            'employeeStatuses' => $employeeStatuses,
            'guarantors' => $guarantors,
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:16|unique:patient_records,nik,' . $id,
            'nip' => 'nullable|string|max:20|unique:patient_records,nip,' . $id,
            'gender' => 'required|in:L,P',
            'birth_date' => 'required|date',
            'blood_type' => 'nullable|in:A,B,AB,O',
            'blood_rhesus' => 'nullable|in:+,-',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'illness_history' => 'nullable|string',
            'allergy' => 'nullable|string',
            'prolanis_status' => 'boolean',
            'prb_status' => 'boolean',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_relations' => 'nullable|string|max:50',
            'emergency_contact_number' => 'nullable|string|max:20',
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
            'employee_status_id' => 'nullable|exists:employee_statuses,id',
            'department_id' => 'nullable|exists:departments,id',
            'guarantors' => 'nullable|array',
            'guarantors.*.guarantor_id' => 'nullable|exists:guarantors,id',
            'guarantors.*.guarantor_number' => 'nullable|string|max:100',
        ]);

        $patient = PatientRecord::findOrFail($id);
        $patient->update(array_merge($request->except(['guarantors']), [
            'updated_by' => auth()->id(),
        ]));

        // Handle multiple guarantor relations
        // Delete existing guarantor relations
        PatientToGuarantor::where('patient_records_id', $patient->id)->delete();
        
        // Create new guarantor relations if provided
        if ($request->guarantors && is_array($request->guarantors)) {
            foreach ($request->guarantors as $guarantorData) {
                if (!empty($guarantorData['guarantor_id'])) {
                    PatientToGuarantor::create([
                        'patient_records_id' => $patient->id,
                        'guarantors_id' => $guarantorData['guarantor_id'],
                        'guarantor_number' => $guarantorData['guarantor_number'] ?? '',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                }
            }
        }

        return redirect()->route('pelayanan.registrasi-rekam-medis.index')
                        ->with('success', 'Data pasien berhasil diperbarui');
    }

    /**
     * Get filtered dropdown data based on company and plant selection
     */
    public function getDropdownData(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'plant_id' => 'required|exists:plants,id',
        ]);

        $companyId = $request->company_id;
        $plantId = $request->plant_id;

        $departments = Department::where('is_active', true)
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId)
            ->select('id', 'name')
            ->get();

        $employeeStatuses = EmployeeStatus::where('is_active', true)
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId)
            ->select('id', 'name')
            ->get();

        $guarantors = Guarantor::where('is_active', true)
            ->where('company_id', $companyId)
            ->where('plant_id', $plantId)
            ->select('id', 'name')
            ->get();

        return response()->json([
            'departments' => $departments,
            'employeeStatuses' => $employeeStatuses,
            'guarantors' => $guarantors,
        ]);
    }

    /**
     * Get plants by company for super admin
     */
    public function getPlantsByCompany(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $plants = Plant::where('is_active', true)
            ->where('company_id', $request->company_id)
            ->select('id', 'name')
            ->get();

        return response()->json([
            'plants' => $plants,
        ]);
    }

    public function destroy($id)
    {
        $patient = PatientRecord::findOrFail($id);
        $patient->delete();

        return redirect()->route('pelayanan.registrasi-rekam-medis.index')
                        ->with('success', 'Data pasien berhasil dihapus');
    }

    public function create()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();

        $companies = Company::where('is_active', true)->get();
        
        if ($isSuperAdmin) {
            // Super admin - semua data kosong, akan diisi berdasarkan pilihan company/plant
            $plants = collect();
            $departments = collect();
            $employeeStatuses = collect();
            $guarantors = collect();
        } else {
            // User biasa - data ter-filter berdasarkan company_id dan plant_id user
            $plants = Plant::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->get();
            
            $departments = Department::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
            
            $employeeStatuses = EmployeeStatus::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
            
            $guarantors = Guarantor::where('is_active', true)
                ->where('company_id', $user->company_id)
                ->where('plant_id', $user->plant_id)
                ->get();
        }

        return Inertia::render('Pelayanan/RegistrasiRekamMedis/Create', [
            'companies' => $companies,
            'plants' => $plants,
            'departments' => $departments,
            'employeeStatuses' => $employeeStatuses,
            'guarantors' => $guarantors,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:16|unique:patient_records,nik',
            'nip' => 'nullable|string|max:20|unique:patient_records,nip',
            'gender' => 'required|in:L,P',
            'birth_date' => 'required|date',
            'blood_type' => 'nullable|in:A,B,AB,O',
            'blood_rhesus' => 'nullable|in:+,-',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'illness_history' => 'nullable|string',
            'allergy' => 'nullable|string',
            'prolanis_status' => 'boolean',
            'prb_status' => 'boolean',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_relations' => 'nullable|string|max:50',
            'emergency_contact_number' => 'nullable|string|max:20',
            'company_id' => 'nullable|exists:companies,id',
            'plant_id' => 'nullable|exists:plants,id',
            'employee_status_id' => 'nullable|exists:employee_statuses,id',
            'department_id' => 'nullable|exists:departments,id',
            'guarantors' => 'nullable|array',
            'guarantors.*.guarantor_id' => 'nullable|exists:guarantors,id',
            'guarantors.*.guarantor_number' => 'nullable|string|max:100',
        ]);

        // Generate medical record number with thread-safe approach
        $medicalRecordNumber = $this->generateMedicalRecordNumber(
            $request->birth_date,
            $request->gender,
            $request->company_id, 
            $request->plant_id
        );

        $patient = PatientRecord::create([
            'medical_record_number' => $medicalRecordNumber,
            'name' => $request->name,
            'nik' => $request->nik,
            'nip' => $request->nip,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'blood_type' => $request->blood_type,
            'blood_rhesus' => $request->blood_rhesus,
            'phone_number' => $request->phone_number,
            'address' => $request->address,
            'illness_history' => $request->illness_history,
            'allergy' => $request->allergy,
            'prolanis_status' => $request->prolanis_status ?? false,
            'prb_status' => $request->prb_status ?? false,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_relations' => $request->emergency_contact_relations,
            'emergency_contact_number' => $request->emergency_contact_number,
            'company_id' => $request->company_id,
            'plant_id' => $request->plant_id,
            'employee_status_id' => $request->employee_status_id,
            'department_id' => $request->department_id,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        // Create patient to guarantor relations if guarantors are provided
        if ($request->guarantors && is_array($request->guarantors)) {
            foreach ($request->guarantors as $guarantorData) {
                if (!empty($guarantorData['guarantor_id'])) {
                    PatientToGuarantor::create([
                        'patient_records_id' => $patient->id,
                        'guarantors_id' => $guarantorData['guarantor_id'],
                        'guarantor_number' => $guarantorData['guarantor_number'] ?? '',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                }
            }
        }

        // Redirect ke halaman index setelah create
        return redirect()->route('pelayanan.registrasi-rekam-medis.index')
            ->with('success', 'Data pasien berhasil ditambahkan');
    }

    /**
     * Generate medical record number with thread-safe approach
     * Format: YYMMG-CCCPPP-XXXX 
     * YY: 2 digit tahun lahir, MM: 2 digit bulan lahir, G: Gender (1=L, 0=P)
     * CCC: 3 digit kode company, PPP: 3 digit kode plant
     * XXXX: nomor urut global
     */
    private function generateMedicalRecordNumber($birthDate, $gender, $companyId = null, $plantId = null)
    {
        return \DB::transaction(function () use ($birthDate, $gender, $companyId, $plantId) {
            // Parse birth date
            $birthDateTime = \Carbon\Carbon::parse($birthDate);
            $yearBirth = $birthDateTime->format('y'); // 2 digit tahun
            $monthBirth = $birthDateTime->format('m'); // 2 digit bulan
            
            // Convert gender: L=1, P=0
            $genderCode = ($gender === 'L') ? '1' : '0';
            
            // Get company and plant codes
            $companyCode = '000'; // default
            $plantCode = '000';   // default
            
            if ($companyId) {
                $company = \App\Models\Company::find($companyId);
                $companyCode = $company ? $company->code : '000';
            }
            
            if ($plantId) {
                $plant = \App\Models\Plant::find($plantId);
                $plantCode = $plant ? $plant->code : '000';
            }
            
            // Build prefix: YYMMG-CCCPPP-
            $prefix = "{$yearBirth}{$monthBirth}{$genderCode}-{$companyCode}{$plantCode}-";
            
            // Get last global sequence number
            $lastRecord = PatientRecord::where('medical_record_number', 'LIKE', '%-' . $companyCode . $plantCode . '-%')
                ->lockForUpdate() // Important: Lock for update to prevent race condition
                ->orderBy('medical_record_number', 'desc')
                ->first();
            
            if ($lastRecord) {
                // Extract the last 4 digits from the medical record number
                $lastNumber = (int) substr($lastRecord->medical_record_number, -4);
                $newNumber = $lastNumber + 1;
            } else {
                // First record for this company-plant combination
                $newNumber = 1;
            }
            
            // Format: YYMMG-CCCPPP-XXXX
            return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        });
    }

    public function searchPatientGuarantors(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patient_records,id',
            'q' => 'nullable|string|max:255',
        ]);

        $patientRecord = PatientRecord::find($request->patient_id);
        
        if (!$patientRecord) {
            return response()->json([]);
        }

        $query = PatientToGuarantor::with('guarantor')
            ->where('patient_records_id', $patientRecord->id);

        if ($request->q) {
            $query->whereHas('guarantor', function($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        }

        $patientGuarantors = $query->get();

        return response()->json($patientGuarantors->map(function ($patientGuarantor) {
            return [
                'id' => $patientGuarantor->id,
                'name' => $patientGuarantor->guarantor->name,
                'guarantor_number' => $patientGuarantor->guarantor_number,
                'guarantor' => $patientGuarantor->guarantor,
            ];
        }));
    }
}
