<?php

namespace App\Http\Controllers;

use App\Models\OutpatientQueue;
use App\Models\LabQueue;
use App\Models\PatientRecord;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        
        // Get filter parameters
        $selectedMonth = $request->get('month', now()->month);
        $selectedYear = $request->get('year', now()->year);
        $selectedCompanyId = $request->get('company_id');
        $selectedPlantId = $request->get('plant_id');
        
        // Set timezone to Asia/Jakarta
        $timezone = 'Asia/Jakarta';
        $now = Carbon::now($timezone);
        $today = $now->copy()->startOfDay();
        $yesterday = $today->copy()->subDay();
        $thisMonth = $now->copy()->startOfMonth();
        $lastMonth = $thisMonth->copy()->subMonth();
        
        // Set timezone for database queries
        DB::statement("SET time_zone = '+07:00'");
        
        // Base query conditions based on user role
        $baseConditions = [];
        if (!$isSuperAdmin) {
            $baseConditions['company_id'] = $user->company_id;
            $baseConditions['plant_id'] = $user->plant_id;
        } else {
            if ($selectedCompanyId && $selectedCompanyId !== '') {
                $baseConditions['company_id'] = $selectedCompanyId;
            }
            if ($selectedPlantId && $selectedPlantId !== '') {
                $baseConditions['plant_id'] = $selectedPlantId;
            }
        }
        
        // Get outpatient visits data
        $outpatientQuery = OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id');
        
        // Apply base conditions to outpatient query
        if (!empty($baseConditions)) {
            foreach ($baseConditions as $key => $value) {
                $outpatientQuery->where("patient_records.{$key}", $value);
            }
        }
        
        // Outpatient visits today
        $outpatientToday = (clone $outpatientQuery)
            ->whereDate(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $today->format('Y-m-d'))
            ->count();
            
        // Outpatient visits yesterday
        $outpatientYesterday = (clone $outpatientQuery)
            ->whereDate(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $yesterday->format('Y-m-d'))
            ->count();
            
        // Outpatient visits this month
        $outpatientThisMonth = (clone $outpatientQuery)
            ->whereYear(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $selectedYear)
            ->whereMonth(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $selectedMonth)
            ->count();
            
        // Outpatient visits last month
        $outpatientLastMonth = (clone $outpatientQuery)
            ->whereYear(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $lastMonth->year)
            ->whereMonth(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $lastMonth->month)
            ->count();
        
        // Get lab visits data
        $labQuery = LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id');
        
        // Apply base conditions to lab query
        if (!empty($baseConditions)) {
            foreach ($baseConditions as $key => $value) {
                $labQuery->where("patient_records.{$key}", $value);
            }
        }
        
        // Lab visits today
        $labToday = (clone $labQuery)
            ->whereDate(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $today->format('Y-m-d'))
            ->count();
            
        // Lab visits yesterday
        $labYesterday = (clone $labQuery)
            ->whereDate(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $yesterday->format('Y-m-d'))
            ->count();
            
        // Lab visits this month
        $labThisMonth = (clone $labQuery)
            ->whereYear(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $selectedYear)
            ->whereMonth(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $selectedMonth)
            ->count();
            
        // Lab visits last month
        $labLastMonth = (clone $labQuery)
            ->whereYear(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $lastMonth->year)
            ->whereMonth(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $lastMonth->month)
            ->count();
        
        // Total visits this month (outpatient + lab)
        $totalVisitsThisMonth = $outpatientThisMonth + $labThisMonth;
        $totalVisitsLastMonth = $outpatientLastMonth + $labLastMonth;
        
        // Total registered patients
        $patientQuery = PatientRecord::query();
        if (!empty($baseConditions)) {
            foreach ($baseConditions as $key => $value) {
                $patientQuery->where($key, $value);
            }
        }
        $totalPatients = $patientQuery->count();
        
        // Unserved patients (waiting status) - today only
        $unservedOutpatientQuery = OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
            ->where('outpatient_queue.status', 'waiting')
            ->whereDate(DB::raw('CONVERT_TZ(outpatient_queue.created_at, "+00:00", "+07:00")'), $today->format('Y-m-d'));
            
        $unservedLabQuery = LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
            ->where('lab_queue.status', 'belum diperiksa')
            ->whereDate(DB::raw('CONVERT_TZ(lab_queue.created_at, "+00:00", "+07:00")'), $today->format('Y-m-d'));
            
        // Apply base conditions to unserved queries
        if (!empty($baseConditions)) {
            foreach ($baseConditions as $key => $value) {
                $unservedOutpatientQuery->where("patient_records.{$key}", $value);
                $unservedLabQuery->where("patient_records.{$key}", $value);
            }
        }
        
        $unservedOutpatient = $unservedOutpatientQuery->count();
        $unservedLab = $unservedLabQuery->count();
        $totalUnserved = $unservedOutpatient + $unservedLab;
        
        // Calculate percentage changes
        $outpatientPercentageChange = $outpatientYesterday > 0 
            ? round((($outpatientToday - $outpatientYesterday) / $outpatientYesterday) * 100, 1)
            : ($outpatientToday > 0 ? 100 : 0);
            
        $labPercentageChange = $labYesterday > 0 
            ? round((($labToday - $labYesterday) / $labYesterday) * 100, 1)
            : ($labToday > 0 ? 100 : 0);
            
        $totalVisitsPercentageChange = $totalVisitsLastMonth > 0 
            ? round((($totalVisitsThisMonth - $totalVisitsLastMonth) / $totalVisitsLastMonth) * 100, 1)
            : ($totalVisitsThisMonth > 0 ? 100 : 0);
        
        // Get companies and plants for super admin filter
        $companies = collect();
        $plants = collect();
        
        if ($isSuperAdmin) {
            $companies = Company::orderBy('name')->get(['id', 'name']);
            $plants = Plant::when($selectedCompanyId && $selectedCompanyId !== '', function($query) use ($selectedCompanyId) {
                return $query->where('company_id', $selectedCompanyId);
            })->orderBy('name')->get(['id', 'name', 'company_id']);
        }
        
        return Inertia::render('dashboard', [
            'metrics' => [
                'outpatient' => [
                    'today' => $outpatientToday,
                    'percentage_change' => $outpatientPercentageChange,
                    'is_increase' => $outpatientPercentageChange >= 0
                ],
                'laboratory' => [
                    'today' => $labToday,
                    'percentage_change' => $labPercentageChange,
                    'is_increase' => $labPercentageChange >= 0
                ],
                'total_visits' => [
                    'this_month' => $totalVisitsThisMonth,
                    'percentage_change' => $totalVisitsPercentageChange,
                    'is_increase' => $totalVisitsPercentageChange >= 0
                ],
                'unserved_patients' => [
                    'total' => $totalUnserved,
                    'outpatient' => $unservedOutpatient,
                    'laboratory' => $unservedLab
                ],
                'total_patients' => $totalPatients
            ],
            'filters' => [
                'month' => (int) $selectedMonth,
                'year' => (int) $selectedYear,
                'company_id' => $selectedCompanyId,
                'plant_id' => $selectedPlantId
            ],
            'is_super_admin' => $isSuperAdmin,
            'companies' => $companies,
            'plants' => $plants,
            'months' => [
                ['value' => 1, 'label' => 'Januari'],
                ['value' => 2, 'label' => 'Februari'],
                ['value' => 3, 'label' => 'Maret'],
                ['value' => 4, 'label' => 'April'],
                ['value' => 5, 'label' => 'Mei'],
                ['value' => 6, 'label' => 'Juni'],
                ['value' => 7, 'label' => 'Juli'],
                ['value' => 8, 'label' => 'Agustus'],
                ['value' => 9, 'label' => 'September'],
                ['value' => 10, 'label' => 'Oktober'],
                ['value' => 11, 'label' => 'November'],
                ['value' => 12, 'label' => 'Desember'],
            ],
            'years' => range($now->year - 5, $now->year + 1)
        ]);
    }

    public function overviewChart(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        $year = $request->get('year', now()->year);
        $jenisPelayanan = $request->get('jenis_pelayanan');
        $penjamin = $request->get('penjamin');
        $shift = $request->get('shift');
        $statusKaryawan = $request->get('status_karyawan');
        $departemen = $request->get('departemen');
        $companyId = $isSuperAdmin ? $request->get('company_id') : $user->company_id;
        $plantId = $isSuperAdmin ? $request->get('plant_id') : $user->plant_id;

        // Query base: OutpatientQueue & LabQueue
        $queries = [];
        if (!$jenisPelayanan || $jenisPelayanan === 'rawat_jalan') {
            $q = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('MONTH(outpatient_queue.created_at) as month, patient_records.gender, COUNT(*) as total');
            if ($companyId && $companyId !== '') $q->where('patient_records.company_id', $companyId);
            if ($plantId && $plantId !== '') $q->where('patient_records.plant_id', $plantId);
            if ($penjamin) $q->where('outpatient_queue.guarantor_id', $penjamin);
            if ($shift) $q->where('outpatient_queue.shift_id', $shift);
            if ($statusKaryawan) $q->where('patient_records.employee_status_id', $statusKaryawan);
            if ($departemen) $q->where('patient_records.department_id', $departemen);
            $q->groupByRaw('MONTH(outpatient_queue.created_at), patient_records.gender');
            $queries[] = $q;
        }
        if (!$jenisPelayanan || $jenisPelayanan === 'laboratorium') {
            $q = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('MONTH(lab_queue.created_at) as month, patient_records.gender, COUNT(*) as total');
            if ($companyId && $companyId !== '') $q->where('patient_records.company_id', $companyId);
            if ($plantId && $plantId !== '') $q->where('patient_records.plant_id', $plantId);
            if ($penjamin) $q->where('lab_queue.guarantor_id', $penjamin);
            if ($shift) $q->where('lab_queue.shift_id', $shift);
            if ($statusKaryawan) $q->where('patient_records.employee_status_id', $statusKaryawan);
            if ($departemen) $q->where('patient_records.department_id', $departemen);
            $q->groupByRaw('MONTH(lab_queue.created_at), patient_records.gender');
            $queries[] = $q;
        }

        // Gabungkan hasil
        $data = [];
        foreach ($queries as $q) {
            foreach ($q->get() as $row) {
                $m = (int)$row->month;
                $g = $row->gender;
                $data[$g][$m] = ($data[$g][$m] ?? 0) + $row->total;
            }
        }
        // Format untuk ApexCharts
        $result = [
            'categories' => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            'series' => [
                [
                    'name' => 'Laki-laki',
                    'data' => array_map(fn($i) => $data['L'][(int)$i] ?? 0, range(1,12)),
                ],
                [
                    'name' => 'Perempuan',
                    'data' => array_map(fn($i) => $data['P'][(int)$i] ?? 0, range(1,12)),
                ],
            ],
        ];
        return response()->json($result);
    }

    public function filterOptions(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        $companyId = $isSuperAdmin ? $request->get('company_id') : $user->company_id;
        $plantId = $isSuperAdmin ? $request->get('plant_id') : $user->plant_id;

        // Penjamin
        $penjamin = \App\Models\Guarantor::query();
        if ($companyId && $companyId !== '') $penjamin->where('company_id', $companyId);
        if ($plantId && $plantId !== '') $penjamin->where('plant_id', $plantId);
        $penjamin = $penjamin->orderBy('name')->get(['id', 'name']);

        // Shift
        $shift = \App\Models\Shift::query();
        if ($companyId && $companyId !== '') $shift->where('company_id', $companyId);
        if ($plantId && $plantId !== '') $shift->where('plant_id', $plantId);
        $shift = $shift->orderBy('name')->get(['id', 'name']);

        // Status Karyawan
        $statusKaryawan = \App\Models\EmployeeStatus::query();
        if ($companyId && $companyId !== '') $statusKaryawan->where('company_id', $companyId);
        $statusKaryawan = $statusKaryawan->orderBy('name')->get(['id', 'name']);

        // Departemen
        $departemen = \App\Models\Department::query();
        if ($companyId && $companyId !== '') $departemen->where('company_id', $companyId);
        if ($plantId && $plantId !== '') $departemen->where('plant_id', $plantId);
        $departemen = $departemen->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'penjamin' => $penjamin,
            'shift' => $shift,
            'status_karyawan' => $statusKaryawan,
            'departemen' => $departemen,
        ]);
    }

    public function demografiChart(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);
        $companyId = $isSuperAdmin ? $request->get('company_id') : $user->company_id;
        $plantId = $isSuperAdmin ? $request->get('plant_id') : $user->plant_id;

        // Base conditions
        $baseConditions = [];
        if ($companyId && $companyId !== '') $baseConditions['company_id'] = $companyId;
        if ($plantId && $plantId !== '') $baseConditions['plant_id'] = $plantId;

        // 1. Diagnosa terbanyak (donut) - dari diagnosis_details
        $diagnosaLabels = [];
        $diagnosaSeries = [];
        try {
            
            $diagnosaQuery = \App\Models\DiagnosisDetail::join('medical_records', 'diagnosis_details.medical_record_id', '=', 'medical_records.id')
                ->join('outpatient_queue', 'medical_records.outpatient_visit_id', '=', 'outpatient_queue.id')
                ->join('diagnosas', 'diagnosis_details.diagnosas_id', '=', 'diagnosas.id')
                ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('CONCAT(diagnosas.code, " - ", diagnosas.name) as diagnosa_full, COUNT(*) as total')
                ->groupBy('diagnosas.id', 'diagnosas.code', 'diagnosas.name')
                ->orderByDesc('total')
                ->limit(10);
            foreach ($baseConditions as $key => $value) {
                $diagnosaQuery->where("patient_records.{$key}", $value);
            }
            
            $diagnosaData = $diagnosaQuery->get();
            
            if ($diagnosaData->isNotEmpty()) {
                $diagnosaLabels = $diagnosaData->pluck('diagnosa_full')->toArray();
                $diagnosaSeries = $diagnosaData->pluck('total')->toArray();
            } else {
                \Log::info('DEBUG: Diagnosa data is empty, trying all-time query');
                // Jika tidak ada data, coba query tanpa filter bulan/tahun
                $diagnosaQueryAll = \App\Models\DiagnosisDetail::join('medical_records', 'diagnosis_details.medical_record_id', '=', 'medical_records.id')
                    ->join('outpatient_queue', 'medical_records.outpatient_visit_id', '=', 'outpatient_queue.id')
                    ->join('diagnosas', 'diagnosis_details.diagnosas_id', '=', 'diagnosas.id')
                    ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                    ->selectRaw('CONCAT(diagnosas.code, " - ", diagnosas.name) as diagnosa_full, COUNT(*) as total')
                    ->groupBy('diagnosas.id', 'diagnosas.code', 'diagnosas.name')
                    ->orderByDesc('total')
                    ->limit(10);
                foreach ($baseConditions as $key => $value) {
                    $diagnosaQueryAll->where("patient_records.{$key}", $value);
                }
                
                $diagnosaDataAll = $diagnosaQueryAll->get();
                
                if ($diagnosaDataAll->isNotEmpty()) {
                    $diagnosaLabels = $diagnosaDataAll->pluck('diagnosa_full')->toArray();
                    $diagnosaSeries = $diagnosaDataAll->pluck('total')->toArray();
                }
            }
            
            if (empty($diagnosaLabels)) {
                $diagnosaLabels = ['Tidak ada data'];
                $diagnosaSeries = [1];
            }
        } catch (\Exception $e) {
            $diagnosaLabels = ['Tidak ada data'];
            $diagnosaSeries = [1];
        }

        // 2. Jenis kelamin (stack) - dari outpatient_queue dan lab_queue
        $genderLabels = [];
        $genderSeries = [];
        try {
            // Data dari outpatient_queue
            $outpatientGenderQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('patient_records.gender, COUNT(*) as total')
                ->groupBy('patient_records.gender');

            foreach ($baseConditions as $key => $value) {
                $outpatientGenderQuery->where("patient_records.{$key}", $value);
            }

            $outpatientGenderData = $outpatientGenderQuery->get();

            // Data dari lab_queue
            $labGenderQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('patient_records.gender, COUNT(*) as total')
                ->groupBy('patient_records.gender');

            foreach ($baseConditions as $key => $value) {
                $labGenderQuery->where("patient_records.{$key}", $value);
            }

            $labGenderData = $labGenderQuery->get();

            // Gabungkan data
            $combinedGenderData = $outpatientGenderData->concat($labGenderData)->groupBy('gender')->map(function ($group) {
                return $group->sum('total');
            });

            $genderLabels = $combinedGenderData->keys()->toArray();
            $genderSeries = $combinedGenderData->values()->toArray();
        } catch (\Exception $e) {
            $genderLabels = ['L', 'P'];
            $genderSeries = [0, 0];
        }

        // 3. Penjamin (stack) - dari patient_to_guarantor
        $penjaminLabels = [];
        $penjaminSeries = [];
        try {
            
            // Data dari outpatient_queue dengan patient_to_guarantor
            $outpatientPenjaminQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->join('patient_to_guarantors', 'patient_records.id', '=', 'patient_to_guarantors.patient_records_id')
                ->join('guarantors', 'patient_to_guarantors.guarantors_id', '=', 'guarantors.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('guarantors.name, COUNT(*) as total')
                ->groupBy('guarantors.id', 'guarantors.name');
            foreach ($baseConditions as $key => $value) {
                $outpatientPenjaminQuery->where("patient_records.{$key}", $value);
            }
            
            $outpatientPenjaminData = $outpatientPenjaminQuery->get();
            
            // Data dari lab_queue dengan patient_to_guarantor
            $labPenjaminQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->join('patient_to_guarantors', 'patient_records.id', '=', 'patient_to_guarantors.patient_records_id')
                ->join('guarantors', 'patient_to_guarantors.guarantors_id', '=', 'guarantors.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('guarantors.name, COUNT(*) as total')
                ->groupBy('guarantors.id', 'guarantors.name');
            foreach ($baseConditions as $key => $value) {
                $labPenjaminQuery->where("patient_records.{$key}", $value);
            }
            
            $labPenjaminData = $labPenjaminQuery->get();
            
            // Gabungkan data
            $combinedPenjaminData = $outpatientPenjaminData->concat($labPenjaminData)->groupBy('name')->map(function ($group) {
                return $group->sum('total');
            })->sortDesc()->take(5);
            
            $penjaminLabels = $combinedPenjaminData->keys()->toArray();
            $penjaminSeries = $combinedPenjaminData->values()->toArray();
            
            if (empty($penjaminLabels)) {
                $penjaminLabels = ['Tidak ada data'];
                $penjaminSeries = [1];
            }
        } catch (\Exception $e) {
            $penjaminLabels = ['Tidak ada data'];
            $penjaminSeries = [1];
        }

        // 3. Kelompok usia (pie) - dari outpatient_queue dan lab_queue
        $ageLabels = [];
        $ageSeries = [];
        try {
            // Data dari outpatient_queue
            $outpatientAgeQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('
                    CASE 
                        WHEN TIMESTAMPDIFF(YEAR, patient_records.birth_date, CURDATE()) < 40 THEN "< 40"
                        ELSE ">= 40"
                    END as age_group,
                    COUNT(*) as total
                ')
                ->groupBy('age_group');

            foreach ($baseConditions as $key => $value) {
                $outpatientAgeQuery->where("patient_records.{$key}", $value);
            }

            $outpatientAgeData = $outpatientAgeQuery->get();

            // Data dari lab_queue
            $labAgeQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('
                    CASE 
                        WHEN TIMESTAMPDIFF(YEAR, patient_records.birth_date, CURDATE()) < 40 THEN "< 40"
                        ELSE ">= 40"
                    END as age_group,
                    COUNT(*) as total
                ')
                ->groupBy('age_group');

            foreach ($baseConditions as $key => $value) {
                $labAgeQuery->where("patient_records.{$key}", $value);
            }

            $labAgeData = $labAgeQuery->get();

            // Gabungkan data
            $combinedAgeData = $outpatientAgeData->concat($labAgeData)->groupBy('age_group')->map(function ($group) {
                return $group->sum('total');
            });

            $ageLabels = $combinedAgeData->keys()->toArray();
            $ageSeries = $combinedAgeData->values()->toArray();
        } catch (\Exception $e) {
            $ageLabels = ['< 40', '>= 40'];
            $ageSeries = [0, 0];
        }

        // 4. Shift (semi donut) - dari medical_records dan lab_exam_details
        $shiftLabels = [];
        $shiftSeries = [];
        try {
            // Data dari medical_records (outpatient)
            $outpatientShiftQuery = \App\Models\MedicalRecord::join('outpatient_queue', 'medical_records.outpatient_visit_id', '=', 'outpatient_queue.id')
                ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->join('shifts', 'medical_records.shift_id', '=', 'shifts.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('shifts.name, COUNT(*) as total')
                ->groupBy('shifts.id', 'shifts.name');

            foreach ($baseConditions as $key => $value) {
                $outpatientShiftQuery->where("patient_records.{$key}", $value);
            }

            $outpatientShiftData = $outpatientShiftQuery->get();
            
            // Data dari lab_exam_details
            $labShiftQuery = \App\Models\LabExamDetail::join('lab_queue', 'lab_exam_details.lab_queue_id', '=', 'lab_queue.id')
                ->join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->join('shifts', 'lab_exam_details.shift_id', '=', 'shifts.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('shifts.name, COUNT(*) as total')
                ->groupBy('shifts.id', 'shifts.name');

            foreach ($baseConditions as $key => $value) {
                $labShiftQuery->where("patient_records.{$key}", $value);
            }

            $labShiftData = $labShiftQuery->get();

            // Gabungkan data
            $combinedShiftData = $outpatientShiftData->concat($labShiftData)->groupBy('name')->map(function ($group) {
                return $group->sum('total');
            });

            $shiftLabels = $combinedShiftData->keys()->toArray();
            $shiftSeries = $combinedShiftData->values()->toArray();
            
            // Jika tidak ada data, tampilkan semua shift dengan nilai 0
            if (empty($shiftLabels)) {
                $allShifts = \App\Models\Shift::where('is_active', true)->get();
                $shiftLabels = $allShifts->pluck('name')->toArray();
                $shiftSeries = array_fill(0, count($shiftLabels), 0);
            }
        } catch (\Exception $e) {
            $shiftLabels = ['Tidak ada data'];
            $shiftSeries = [1];
        }

        // 2. Departemen (bar) - dari outpatient_queue dan lab_queue
        $departemenLabels = [];
        $departemenSeries = [];
        try {
            
            // Data dari outpatient_queue
            $outpatientDeptQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->join('departments', 'patient_records.department_id', '=', 'departments.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('departments.name, COUNT(*) as total')
                ->groupBy('departments.id', 'departments.name');

            foreach ($baseConditions as $key => $value) {
                $outpatientDeptQuery->where("patient_records.{$key}", $value);
            }

            $outpatientDeptData = $outpatientDeptQuery->get();

            // Data dari lab_queue
            $labDeptQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->join('departments', 'patient_records.department_id', '=', 'departments.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('departments.name, COUNT(*) as total')
                ->groupBy('departments.id', 'departments.name');

            foreach ($baseConditions as $key => $value) {
                $labDeptQuery->where("patient_records.{$key}", $value);
            }

            $labDeptData = $labDeptQuery->get();

            // Gabungkan data
            $combinedDeptData = $outpatientDeptData->concat($labDeptData)->groupBy('name')->map(function ($group) {
                return $group->sum('total');
            })->sortDesc()->take(10);

            $departemenLabels = $combinedDeptData->keys()->toArray();
            $departemenSeries = $combinedDeptData->values()->toArray();
            
            if (empty($departemenLabels)) {
                $departemenLabels = ['Tidak ada data'];
                $departemenSeries = [1];
            }
        } catch (\Exception $e) {
            $departemenLabels = ['Tidak ada data'];
            $departemenSeries = [1];
        }

        // 6. Status Karyawan (bar) - dari outpatient_queue dan lab_queue
        $statusLabels = [];
        $statusSeries = [];
        try {
            // Data dari outpatient_queue
            $outpatientStatusQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->join('employee_statuses', 'patient_records.employee_status_id', '=', 'employee_statuses.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('employee_statuses.name, COUNT(*) as total')
                ->groupBy('employee_statuses.id', 'employee_statuses.name');

            foreach ($baseConditions as $key => $value) {
                $outpatientStatusQuery->where("patient_records.{$key}", $value);
            }

            $outpatientStatusData = $outpatientStatusQuery->get();

            // Data dari lab_queue
            $labStatusQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->join('employee_statuses', 'patient_records.employee_status_id', '=', 'employee_statuses.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('employee_statuses.name, COUNT(*) as total')
                ->groupBy('employee_statuses.id', 'employee_statuses.name');

            foreach ($baseConditions as $key => $value) {
                $labStatusQuery->where("patient_records.{$key}", $value);
            }

            $labStatusData = $labStatusQuery->get();

            // Gabungkan data
            $combinedStatusData = $outpatientStatusData->concat($labStatusData)->groupBy('name')->map(function ($group) {
                return $group->sum('total');
            });

            $statusLabels = $combinedStatusData->keys()->toArray();
            $statusSeries = $combinedStatusData->values()->toArray();
        } catch (\Exception $e) {
            $statusLabels = ['Tidak ada data'];
            $statusSeries = [1];
        }

        return response()->json([
            'diagnosa' => [
                'labels' => $diagnosaLabels,
                'series' => $diagnosaSeries
            ],
            'gender' => [
                'labels' => $genderLabels,
                'series' => $genderSeries
            ],
            'penjamin' => [
                'labels' => $penjaminLabels,
                'series' => $penjaminSeries
            ],
            'age' => [
                'labels' => $ageLabels,
                'series' => $ageSeries
            ],
            'shift' => [
                'labels' => $shiftLabels,
                'series' => $shiftSeries
            ],
            'department' => [
                'labels' => $departemenLabels,
                'series' => $departemenSeries
            ],
            'employee_status' => [
                'labels' => $statusLabels,
                'series' => $statusSeries
            ]
        ]);
    }

    public function operasionalChart(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);
        $companyId = $isSuperAdmin ? $request->get('company_id') : $user->company_id;
        $plantId = $isSuperAdmin ? $request->get('plant_id') : $user->plant_id;

        // Base conditions
        $baseConditions = [];
        if ($companyId && $companyId !== '') $baseConditions['company_id'] = $companyId;
        if ($plantId && $plantId !== '') $baseConditions['plant_id'] = $plantId;

        // 1. Obat terbanyak (bar) - dari prescription_details
        $obatLabels = [];
        $obatSeries = [];
        try {
            $obatQuery = \App\Models\PrescriptionDetail::join('prescriptions', 'prescription_details.prescription_id', '=', 'prescriptions.id')
                ->join('inventory_items', 'prescription_details.inventory_item_id', '=', 'inventory_items.id')
                ->join('outpatient_queue', 'prescriptions.outpatient_queue_id', '=', 'outpatient_queue.id')
                ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('inventory_items.name, SUM(prescription_details.quantity) as total')
                ->groupBy('inventory_items.id', 'inventory_items.name')
                ->orderByDesc('total')
                ->limit(10);

            foreach ($baseConditions as $key => $value) {
                $obatQuery->where("patient_records.{$key}", $value);
            }

            $obatData = $obatQuery->get();

            if ($obatData->count() > 0) {
                $obatLabels = $obatData->pluck('name')->toArray();
                $obatSeries = $obatData->pluck('total')->toArray();
            } else {
                // Jika tidak ada data, coba query tanpa filter bulan/tahun
                $obatQueryAll = \App\Models\PrescriptionDetail::join('prescriptions', 'prescription_details.prescription_id', '=', 'prescriptions.id')
                    ->join('inventory_items', 'prescription_details.inventory_item_id', '=', 'inventory_items.id')
                    ->join('outpatient_queue', 'prescriptions.outpatient_queue_id', '=', 'outpatient_queue.id')
                    ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                    ->selectRaw('inventory_items.name, SUM(prescription_details.quantity) as total')
                    ->groupBy('inventory_items.id', 'inventory_items.name')
                    ->orderByDesc('total')
                    ->limit(10);

                foreach ($baseConditions as $key => $value) {
                    $obatQueryAll->where("patient_records.{$key}", $value);
                }

                $obatDataAll = $obatQueryAll->get();

                if ($obatDataAll->count() > 0) {
                    $obatLabels = $obatDataAll->pluck('name')->toArray();
                    $obatSeries = $obatDataAll->pluck('total')->toArray();
                }
            }

            if (empty($obatLabels)) {
                $obatLabels = ['Tidak ada data'];
                $obatSeries = [1];
            }
        } catch (\Exception $e) {
            $obatLabels = ['Tidak ada data'];
            $obatSeries = [1];
        }

        // 2. Lab terbanyak (bar) - dari lab_exam_details
        $labLabels = [];
        $labSeries = [];
        try {
            $labQuery = \App\Models\LabExamDetail::join('lab_requests', 'lab_exam_details.lab_request_id', '=', 'lab_requests.id')
                ->join('lab_masters', 'lab_exam_details.lab_master_id', '=', 'lab_masters.id')
                ->join('lab_queue', 'lab_requests.lab_queue_id', '=', 'lab_queue.id')
                ->join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('lab_masters.name, COUNT(*) as total')
                ->groupBy('lab_masters.id', 'lab_masters.name')
                ->orderByDesc('total')
                ->limit(10);

            foreach ($baseConditions as $key => $value) {
                $labQuery->where("patient_records.{$key}", $value);
            }

            $labData = $labQuery->get();

            if ($labData->count() > 0) {
                $labLabels = $labData->pluck('name')->toArray();
                $labSeries = $labData->pluck('total')->toArray();
            } else {
                // Jika tidak ada data, coba query tanpa filter bulan/tahun
                $labQueryAll = \App\Models\LabExamDetail::join('lab_requests', 'lab_exam_details.lab_request_id', '=', 'lab_requests.id')
                    ->join('lab_masters', 'lab_exam_details.lab_master_id', '=', 'lab_masters.id')
                    ->join('lab_queue', 'lab_requests.lab_queue_id', '=', 'lab_queue.id')
                    ->join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                    ->selectRaw('lab_masters.name, COUNT(*) as total')
                    ->groupBy('lab_masters.id', 'lab_masters.name')
                    ->orderByDesc('total')
                    ->limit(10);

                foreach ($baseConditions as $key => $value) {
                    $labQueryAll->where("patient_records.{$key}", $value);
                }

                $labDataAll = $labQueryAll->get();

                if ($labDataAll->count() > 0) {
                    $labLabels = $labDataAll->pluck('name')->toArray();
                    $labSeries = $labDataAll->pluck('total')->toArray();
                }
            }

            if (empty($labLabels)) {
                $labLabels = ['Tidak ada data'];
                $labSeries = [1];
            }
        } catch (\Exception $e) {
            $labLabels = ['Tidak ada data'];
            $labSeries = [1];
        }

        // 3. Penjamin terbanyak (pie) - dari patient_to_guarantor
        $penjaminLabels = [];
        $penjaminSeries = [];
        try {
            // Data dari outpatient_queue dengan patient_to_guarantor
            $outpatientPenjaminQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
                ->join('patient_to_guarantors', 'patient_records.id', '=', 'patient_to_guarantors.patient_records_id')
                ->join('guarantors', 'patient_to_guarantors.guarantors_id', '=', 'guarantors.id')
                ->whereMonth('outpatient_queue.created_at', $month)
                ->whereYear('outpatient_queue.created_at', $year)
                ->selectRaw('guarantors.name, COUNT(*) as total')
                ->groupBy('guarantors.id', 'guarantors.name');

            foreach ($baseConditions as $key => $value) {
                $outpatientPenjaminQuery->where("patient_records.{$key}", $value);
            }

            $outpatientPenjaminData = $outpatientPenjaminQuery->get();

            // Data dari lab_queue dengan patient_to_guarantor
            $labPenjaminQuery = \App\Models\LabQueue::join('patient_records', 'lab_queue.patient_record_id', '=', 'patient_records.id')
                ->join('patient_to_guarantors', 'patient_records.id', '=', 'patient_to_guarantors.patient_records_id')
                ->join('guarantors', 'patient_to_guarantors.guarantors_id', '=', 'guarantors.id')
                ->whereMonth('lab_queue.created_at', $month)
                ->whereYear('lab_queue.created_at', $year)
                ->selectRaw('guarantors.name, COUNT(*) as total')
                ->groupBy('guarantors.id', 'guarantors.name');

            foreach ($baseConditions as $key => $value) {
                $labPenjaminQuery->where("patient_records.{$key}", $value);
            }

            $labPenjaminData = $labPenjaminQuery->get();

            // Gabungkan data dari outpatient dan lab
            $combinedPenjaminData = collect();
            
            // Tambahkan data outpatient
            foreach ($outpatientPenjaminData as $item) {
                $combinedPenjaminData->put($item->name, ($combinedPenjaminData->get($item->name, 0) + $item->total));
            }
            
            // Tambahkan data lab
            foreach ($labPenjaminData as $item) {
                $combinedPenjaminData->put($item->name, ($combinedPenjaminData->get($item->name, 0) + $item->total));
            }

            // Urutkan berdasarkan total dan ambil 10 teratas
            $combinedPenjaminData = $combinedPenjaminData->sortDesc()->take(10);

            $penjaminLabels = $combinedPenjaminData->keys()->toArray();
            $penjaminSeries = $combinedPenjaminData->values()->toArray();

            if (empty($penjaminLabels)) {
                $penjaminLabels = ['Tidak ada data'];
                $penjaminSeries = [1];
            }
        } catch (\Exception $e) {
            $penjaminLabels = ['Tidak ada data'];
            $penjaminSeries = [1];
        }

        return response()->json([
            'obat' => [
                'labels' => $obatLabels,
                'series' => $obatSeries
            ],
            'lab' => [
                'labels' => $labLabels,
                'series' => $labSeries
            ],
            'penjamin' => [
                'labels' => $penjaminLabels,
                'series' => $penjaminSeries
            ]
        ]);
    }

    /**
     * Get low stock inventory items for dashboard
     */
    public function getLowStockItems(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->isSuperAdmin();
        $companyId = $isSuperAdmin ? $request->get('company_id') : $user->company_id;
        $plantId = $isSuperAdmin ? $request->get('plant_id') : $user->plant_id;

        try {
            $query = \App\Models\InventoryItem::with(['category', 'unit', 'company', 'plant'])
                ->where('is_active', true)
                ->where(function($q) {
                    $q->where('stock', '<=', 0)  // Stock habis
                      ->orWhereRaw('stock <= min_stock'); // Stock menipis
                })
                ->orderBy('stock', 'asc')
                ->orderBy('name', 'asc')
                ->limit(20); // Ambil 20 item teratas

            // Filter berdasarkan company dan plant
            if ($companyId && $companyId !== '') {
                $query->where('company_id', $companyId);
            }
            if ($plantId && $plantId !== '') {
                $query->where('plant_id', $plantId);
            }

            $lowStockItems = $query->get();

            // Format data untuk frontend
            $formattedItems = $lowStockItems->map(function($item) {
                $status = 'Tersedia';
                $statusColor = 'text-green-600';
                $statusBg = 'bg-green-100';
                
                if ($item->stock <= 0) {
                    $status = 'Habis';
                    $statusColor = 'text-red-600';
                    $statusBg = 'bg-red-100';
                } elseif ($item->stock <= $item->min_stock) {
                    $status = 'Stok Menipis';
                    $statusColor = 'text-yellow-600';
                    $statusBg = 'bg-yellow-100';
                }

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category?->name ?? '-',
                    'unit' => $item->unit?->name ?? '-',
                    'stock' => $item->stock,
                    'min_stock' => $item->min_stock,
                    'status' => $status,
                    'status_color' => $statusColor,
                    'status_bg' => $statusBg,
                    'price' => $item->price,
                    'company' => $item->company?->name ?? '-',
                    'plant' => $item->plant?->name ?? '-',
                ];
            });

            // Hitung jumlah item berdasarkan status
            $emptyCount = $formattedItems->where('status', 'Habis')->count();
            $lowCount = $formattedItems->where('status', 'Stok Menipis')->count();

            return response()->json([
                'items' => $formattedItems,
                'total_count' => $lowStockItems->count(),
                'empty_count' => $emptyCount,
                'low_count' => $lowCount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'items' => [],
                'total_count' => 0,
                'empty_count' => 0,
                'low_count' => 0,
                'error' => 'Terjadi kesalahan saat mengambil data stock'
            ], 500);
        }
    }
} 