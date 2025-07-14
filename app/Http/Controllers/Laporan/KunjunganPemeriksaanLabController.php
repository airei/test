<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\LabQueue;
use App\Models\Company;
use App\Models\Plant;
use App\Models\LabMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KunjunganPemeriksaanLabController extends Controller
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
            $request->filled('lab_master_id') || $request->filled('search') || 
            $request->filled('status')) {
            
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
            'lab_master_id',
            'search',
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

        // Get lab masters for filter
        $labMasters = LabMaster::where('is_active', true)
            ->when(!$isSuperAdmin, function($query) use ($user) {
                $query->where('company_id', $user->company_id)
                      ->where('plant_id', $user->plant_id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        // Initialize data as empty
        $kunjungan = collect();
        $totalRecords = 0;
        $hasSearched = false;

        // Only fetch data if filters are applied
        if ($request->filled('start_date') || $request->filled('end_date') || 
            $request->filled('company_id') || $request->filled('plant_id') || 
            $request->filled('lab_master_id') || $request->filled('search') || 
            $request->filled('status')) {
            
            $hasSearched = true;
            
            $query = LabQueue::with([
                'patientRecord.guarantor',
                'labMaster',
                'company',
                'plant',
                'createdBy'
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
            ->when($request->filled('lab_master_id'), function($query) use ($request) {
                $query->where('lab_master_id', $request->lab_master_id);
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
            })
            ->orderBy('visit_date', 'desc')
            ->orderBy('created_at', 'desc');

            $totalRecords = $query->count();
            
            $kunjungan = $query->paginate(15)
                ->withQueryString()
                ->through(function ($item) {
                    return [
                        'id' => $item->id,
                        'medical_record_number' => $item->medical_record_number,
                        'patient_name' => $item->patientRecord?->name ?? '-',
                        'identity_number' => $item->patientRecord?->identity_number ?? '-',
                        'visit_date' => $item->visit_date?->format('d/m/Y') ?? '-',
                        'visit_time' => $item->visit_time ?? '-',
                        'lab_examination' => $item->labMaster?->name ?? '-',
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

        return Inertia::render('Laporan/KunjunganPemeriksaanLab', [
            'kunjungan' => $kunjungan,
            'totalRecords' => $totalRecords,
            'hasSearched' => $hasSearched,
            'filters' => $filters,
            'companies' => $companies,
            'plants' => $plants,
            'labMasters' => $labMasters,
            'isSuperAdmin' => $isSuperAdmin,
            'statusOptions' => [
                ['value' => 'pending', 'label' => 'Menunggu'],
                ['value' => 'in_progress', 'label' => 'Sedang Berlangsung'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'cancelled', 'label' => 'Dibatalkan'],
            ],
        ]);
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
