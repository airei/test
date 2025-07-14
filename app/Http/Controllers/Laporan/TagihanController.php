<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\OutpatientQueue;
use App\Models\LabQueue;
use App\Models\Company;
use App\Models\Plant;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TagihanController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->role->name === 'super_admin';

        // Get filter parameters
        $filters = $request->only([
            'start_date',
            'end_date',
            'company_id',
            'plant_id',
            'department_id',
            'search',
            'status',
            'type'
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
        }

        // Get departments for filter
        $departments = Department::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        // Initialize data as empty
        $tagihan = collect();
        $totalRecords = 0;
        $hasSearched = false;

        // Only fetch data if filters are applied
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('company_id') || $request->filled('plant_id') || 
            $request->filled('department_id') || $request->filled('search') || 
            $request->filled('status') || $request->filled('type')) {
            
            $hasSearched = true;
            
            // Build query based on type
            $type = $request->get('type', 'all');
            
            if ($type === 'rawat_jalan' || $type === 'all') {
                $rawatJalanQuery = OutpatientQueue::with([
                    'patientRecord.guarantor',
                    'department',
                    'company',
                    'plant',
                    'createdBy'
                ])
                ->select([
                    'id',
                    'medical_record_number',
                    'patient_record_id',
                    'department_id',
                    'company_id',
                    'plant_id',
                    'visit_date',
                    'visit_time',
                    'status',
                    'created_by',
                    'created_at',
                    DB::raw("'rawat_jalan' as type"),
                    DB::raw("0 as amount")
                ])
                ->when(!$isSuperAdmin, function($query) use ($user) {
                    $query->where('company_id', $user->company_id)
                          ->where('plant_id', $user->plant_id);
                })
                ->when($request->filled('start_date'), function($query) use ($request) {
                    $query->whereDate('visit_date', '>=', $request->start_date);
                })
                ->when($request->filled('end_date'), function($query) use ($request) {
                    $query->whereDate('visit_date', '<=', $request->end_date);
                })
                ->when($request->filled('company_id'), function($query) use ($request) {
                    $query->where('company_id', $request->company_id);
                })
                ->when($request->filled('plant_id'), function($query) use ($request) {
                    $query->where('plant_id', $request->plant_id);
                })
                ->when($request->filled('department_id'), function($query) use ($request) {
                    $query->where('department_id', $request->department_id);
                })
                ->when($request->filled('search'), function($query) use ($request) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('medical_record_number', 'like', "%{$search}%")
                          ->orWhereHas('patientRecord', function($q2) use ($search) {
                              $q2->where('name', 'like', "%{$search}%")
                                 ->orWhere('identity_number', 'like', "%{$search}%");
                          });
                    });
                })
                ->when($request->filled('status'), function($query) use ($request) {
                    $query->where('status', $request->status);
                });
            }

            if ($type === 'lab' || $type === 'all') {
                $labQuery = LabQueue::with([
                    'patientRecord.guarantor',
                    'labMaster',
                    'company',
                    'plant',
                    'createdBy'
                ])
                ->select([
                    'id',
                    'medical_record_number',
                    'patient_record_id',
                    'lab_master_id as department_id',
                    'company_id',
                    'plant_id',
                    'visit_date',
                    'visit_time',
                    'status',
                    'created_by',
                    'created_at',
                    DB::raw("'lab' as type"),
                    DB::raw("lab_masters.price as amount")
                ])
                ->join('lab_masters', 'lab_queues.lab_master_id', '=', 'lab_masters.id')
                ->when(!$isSuperAdmin, function($query) use ($user) {
                    $query->where('lab_queues.company_id', $user->company_id)
                          ->where('lab_queues.plant_id', $user->plant_id);
                })
                ->when($request->filled('start_date'), function($query) use ($request) {
                    $query->whereDate('lab_queues.visit_date', '>=', $request->start_date);
                })
                ->when($request->filled('end_date'), function($query) use ($request) {
                    $query->whereDate('lab_queues.visit_date', '<=', $request->end_date);
                })
                ->when($request->filled('company_id'), function($query) use ($request) {
                    $query->where('lab_queues.company_id', $request->company_id);
                })
                ->when($request->filled('plant_id'), function($query) use ($request) {
                    $query->where('lab_queues.plant_id', $request->plant_id);
                })
                ->when($request->filled('department_id'), function($query) use ($request) {
                    $query->where('lab_queues.lab_master_id', $request->department_id);
                })
                ->when($request->filled('search'), function($query) use ($request) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('lab_queues.medical_record_number', 'like', "%{$search}%")
                          ->orWhereHas('patientRecord', function($q2) use ($search) {
                              $q2->where('name', 'like', "%{$search}%")
                                 ->orWhere('identity_number', 'like', "%{$search}%");
                          });
                    });
                })
                ->when($request->filled('status'), function($query) use ($request) {
                    $query->where('lab_queues.status', $request->status);
                });
            }

            // Combine queries based on type
            if ($type === 'rawat_jalan') {
                $query = $rawatJalanQuery;
            } elseif ($type === 'lab') {
                $query = $labQuery;
            } else {
                // Combine both queries
                $query = $rawatJalanQuery->union($labQuery);
            }

            $totalRecords = $query->count();
            
            $tagihan = $query->orderBy('visit_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(15)
                ->withQueryString()
                ->through(function ($item) {
                    return [
                        'id' => $item->id,
                        'type' => $item->type,
                        'type_text' => $this->getTypeText($item->type),
                        'medical_record_number' => $item->medical_record_number,
                        'patient_name' => $item->patientRecord?->name ?? '-',
                        'identity_number' => $item->patientRecord?->identity_number ?? '-',
                        'visit_date' => $item->visit_date?->format('d/m/Y') ?? '-',
                        'visit_time' => $item->visit_time ?? '-',
                        'service_name' => $this->getServiceName($item),
                        'amount' => $item->amount ? number_format($item->amount, 0, ',', '.') : '-',
                        'guarantor' => $item->patientRecord?->guarantor?->name ?? '-',
                        'status' => $item->status,
                        'status_text' => $this->getStatusText($item->status),
                        'company' => $item->company?->name ?? '-',
                        'plant' => $item->plant?->name ?? '-',
                        'created_by' => $item->createdBy?->name ?? '-',
                        'created_at' => $item->created_at?->format('d/m/Y H:i') ?? '-',
                    ];
                });
        }

        return Inertia::render('Laporan/Tagihan', [
            'tagihan' => $tagihan,
            'totalRecords' => $totalRecords,
            'hasSearched' => $hasSearched,
            'filters' => $filters,
            'companies' => $companies,
            'plants' => $plants,
            'departments' => $departments,
            'isSuperAdmin' => $isSuperAdmin,
            'statusOptions' => [
                ['value' => 'pending', 'label' => 'Menunggu'],
                ['value' => 'in_progress', 'label' => 'Sedang Berlangsung'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'cancelled', 'label' => 'Dibatalkan'],
            ],
            'typeOptions' => [
                ['value' => 'all', 'label' => 'Semua'],
                ['value' => 'rawat_jalan', 'label' => 'Rawat Jalan'],
                ['value' => 'lab', 'label' => 'Laboratorium'],
            ],
        ]);
    }

    private function getTypeText($type)
    {
        return match($type) {
            'rawat_jalan' => 'Rawat Jalan',
            'lab' => 'Laboratorium',
            default => 'Tidak Diketahui'
        };
    }

    private function getServiceName($item)
    {
        if ($item->type === 'rawat_jalan') {
            return $item->department?->name ?? '-';
        } elseif ($item->type === 'lab') {
            return $item->labMaster?->name ?? '-';
        }
        return '-';
    }

    private function getStatusText($status)
    {
        return match($status) {
            'pending' => 'Menunggu',
            'in_progress' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }
}
