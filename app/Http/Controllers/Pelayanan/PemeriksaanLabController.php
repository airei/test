<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LabQueue;
use Inertia\Inertia;
use Carbon\Carbon;

class PemeriksaanLabController extends Controller
{
    public function index(Request $request)
    {
        // Jika ada patient_id, buat lab queue baru
        if ($request->filled('patient_id')) {
            $patientRecord = \App\Models\PatientRecord::find($request->patient_id);
            if ($patientRecord) {
                // Cek apakah sudah ada lab queue untuk pasien ini hari ini
                $existingLabQueue = \App\Models\LabQueue::where('patient_record_id', $patientRecord->id)
                    ->whereDate('created_at', today())
                    ->where('status', '!=', 'batal')
                    ->first();

                if (!$existingLabQueue) {
                    // Buat lab queue baru
                    \App\Models\LabQueue::create([
                        'patient_record_id' => $patientRecord->id,
                        'lab_visit_number' => 'LV' . date('Ymd') . str_pad(\App\Models\LabQueue::count() + 1, 3, '0', STR_PAD_LEFT),
                        'status' => 'belum diperiksa',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                }
            }
        }

        $query = LabQueue::with([
            'patientRecord.company',
            'patientRecord.plant',
            'patientRecord.department',
            'patientRecord.employeeStatus',
            'createdBy'
        ]);

        // Filter berdasarkan search (nama, NIK, NIP)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patientRecord', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Jika tidak ada filter tanggal dari frontend, fallback ke hari ini (server)
        if (!$request->filled('tanggal')) {
            $request->merge(['tanggal' => today()->toDateString()]);
        }

        $offset = (int) $request->input('timezone_offset', 0);
        $tanggal = $request->tanggal;

        // Hitung rentang waktu UTC dari tanggal lokal user
        $startLocal = \Carbon\Carbon::createFromFormat('Y-m-d', $tanggal)->startOfDay();
        $endLocal = \Carbon\Carbon::createFromFormat('Y-m-d', $tanggal)->endOfDay();
        if ($offset < 0) {
            $startUTC = $startLocal->copy()->addMinutes(abs($offset))->setTimezone('UTC');
            $endUTC = $endLocal->copy()->addMinutes(abs($offset))->setTimezone('UTC');
        } else {
            $startUTC = $startLocal->copy()->subMinutes($offset)->setTimezone('UTC');
            $endUTC = $endLocal->copy()->subMinutes($offset)->setTimezone('UTC');
        }
        $query->whereBetween('created_at', [$startUTC, $endUTC]);

        // Buat string timezone dari offset (misal: -420 => +07:00)
        $timezone = $offset === 0 ? 'UTC' : sprintf('%+03d:%02d', -intdiv($offset, 60), abs($offset) % 60);

        // Ambil waktu lokal user dari frontend jika dikirim (optional, bisa tambahkan di frontend jika mau)
        $userLocalTime = $request->input('user_local_time', null);

        // Urutkan berdasarkan waktu pemeriksaan terbaru
        $labQueues = $query->orderBy('created_at', 'desc')
                          ->paginate(10)
                          ->withQueryString();

        // Transform data untuk frontend
        $labQueues->getCollection()->transform(function ($queue) use ($timezone, $offset, $userLocalTime) {
            $createdAt = \Carbon\Carbon::parse($queue->getRawOriginal('created_at'), 'UTC');
            $waktuLokal = $createdAt->setTimezone($timezone)->format('Y-m-d H:i');
            // Logging debug
            \Log::info('[DEBUG PEMERIKSAAN LAB]', [
                'offset' => $offset,
                'timezone' => $timezone,
                'created_at_utc' => $queue->getRawOriginal('created_at'),
                'created_at_local' => $waktuLokal,
                'user_local_time' => $userLocalTime,
            ]);
            return [
                'id' => $queue->id,
                'waktu' => $waktuLokal,
                'nik' => $queue->patientRecord->nik ?? '-',
                'nip' => $queue->patientRecord->nip ?? '-',
                'nama' => $queue->patientRecord->name,
                'rm' => $queue->patientRecord->medical_record_number,
                'lahir' => $queue->patientRecord->birth_date ? $queue->patientRecord->birth_date->format('Y-m-d') : '-',
                'umur' => $queue->patientRecord->age,
                'gender' => $queue->patientRecord->gender,
                'departemen' => $queue->patientRecord->department->name ?? '-',
                'status_karyawan' => $queue->patientRecord->employeeStatus->name ?? '-',
                'status' => $queue->status,
                'lab_visit_number' => $queue->lab_visit_number,
                'patient_record_id' => $queue->patient_record_id,
            ];
        });

        // Statistik box dengan timezone handling
        $userNow = Carbon::now()->addMinutes(-$offset);
        $userToday = $userNow->format('Y-m-d');
        $userThisMonth = $userNow->format('Y-m');
        
        // Hitung statistik berdasarkan waktu lokal user
        $totalHariIni = LabQueue::whereDate('created_at', $userToday)->count();
        $totalBulanIni = LabQueue::whereYear('created_at', $userNow->year)
                                ->whereMonth('created_at', $userNow->month)
                                ->count();
        $belumDiperiksaBulanIni = LabQueue::where('status', 'belum diperiksa')
                                         ->whereYear('created_at', $userNow->year)
                                         ->whereMonth('created_at', $userNow->month)
                                         ->count();
        $batalBulanIni = LabQueue::where('status', 'batal')
                                ->whereYear('created_at', $userNow->year)
                                ->whereMonth('created_at', $userNow->month)
                                ->count();
        $selesaiBulanIni = LabQueue::where('status', 'selesai')
                                  ->whereYear('created_at', $userNow->year)
                                  ->whereMonth('created_at', $userNow->month)
                                  ->count();

        return Inertia::render('Pelayanan/PemeriksaanLab', [
            'labQueues' => $labQueues,
            'filters' => $request->only(['search', 'status', 'tanggal']),
            'stats' => [
                'total_hari_ini' => $totalHariIni,
                'total_bulan_ini' => $totalBulanIni,
                'belum_diperiksa_bulan_ini' => $belumDiperiksaBulanIni,
                'batal_bulan_ini' => $batalBulanIni,
                'selesai_bulan_ini' => $selesaiBulanIni,
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:belum diperiksa,sedang diperiksa,selesai,batal'
        ]);

        $queue = LabQueue::findOrFail($id);
        $queue->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        // Return JSON response untuk AJAX request
        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Status pemeriksaan berhasil diperbarui']);
        }

        return redirect()->back()->with('success', 'Status pemeriksaan berhasil diperbarui');
    }

    public function show($id)
    {
        $labQueue = LabQueue::with([
            'patientRecord.company',
            'patientRecord.plant',
            'patientRecord.department',
            'patientRecord.employeeStatus',
            'labRequest.labDetails.labMaster',
            'labRequest.labDetails.labResult',
            'labExamDetail.examiner',
            'labExamDetail.shift',
            'labExamDetail.guarantor'
        ])->findOrFail($id);

        // Transform data untuk frontend
        $transformedLabQueue = [
            'id' => $labQueue->id,
            'lab_visit_number' => $labQueue->lab_visit_number,
            'status' => $labQueue->status,
            'created_at' => $labQueue->created_at->format('Y-m-d H:i:s'),
            'patientRecord' => [
                'id' => $labQueue->patientRecord->id,
                'name' => $labQueue->patientRecord->name,
                'nik' => $labQueue->patientRecord->nik,
                'nip' => $labQueue->patientRecord->nip,
                'medical_record_number' => $labQueue->patientRecord->medical_record_number,
                'birth_date' => $labQueue->patientRecord->birth_date ? $labQueue->patientRecord->birth_date->format('Y-m-d') : null,
                'age' => $labQueue->patientRecord->age,
                'gender' => $labQueue->patientRecord->gender,
                'company_id' => $labQueue->patientRecord->company_id,
                'plant_id' => $labQueue->patientRecord->plant_id,
                'company' => $labQueue->patientRecord->company ? [
                    'name' => $labQueue->patientRecord->company->name,
                    'address' => $labQueue->patientRecord->company->address,
                    'phone' => $labQueue->patientRecord->company->phone,
                    'email' => $labQueue->patientRecord->company->email,
                ] : null,
                'plant' => $labQueue->patientRecord->plant ? [
                    'name' => $labQueue->patientRecord->plant->name,
                    'address' => $labQueue->patientRecord->plant->address,
                    'phone' => $labQueue->patientRecord->plant->phone,
                    'email' => $labQueue->patientRecord->plant->email,
                ] : null,
                'department' => $labQueue->patientRecord->department ? [
                    'name' => $labQueue->patientRecord->department->name,
                ] : null,
                'employeeStatus' => $labQueue->patientRecord->employeeStatus ? [
                    'name' => $labQueue->patientRecord->employeeStatus->name,
                ] : null,
            ],
            'labRequest' => $labQueue->labRequest ? [
                'id' => $labQueue->labRequest->id,
                'labDetails' => $labQueue->labRequest->labDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'lab_master_id' => $detail->lab_master_id,
                        'labMaster' => $detail->labMaster ? [
                            'name' => $detail->labMaster->name,
                            'unit' => $detail->labMaster->unit,
                        ] : null,
                        'labResult' => $detail->labResult ? [
                            'result' => $detail->labResult->result,
                            'result_status' => $detail->labResult->result_status,
                        ] : null,
                    ];
                })->toArray(),
            ] : null,
            'labExamDetail' => $labQueue->labExamDetail ? [
                'id' => $labQueue->labExamDetail->id,
                'examiner' => $labQueue->labExamDetail->examiner ? [
                    'id' => $labQueue->labExamDetail->examiner->id,
                    'name' => $labQueue->labExamDetail->examiner->name,
                ] : null,
                'shift' => $labQueue->labExamDetail->shift ? [
                    'id' => $labQueue->labExamDetail->shift->id,
                    'name' => $labQueue->labExamDetail->shift->name,
                ] : null,
                'guarantor' => $labQueue->labExamDetail->guarantor ? [
                    'id' => $labQueue->labExamDetail->guarantor->id,
                    'name' => $labQueue->labExamDetail->guarantor->name,
                ] : null,
            ] : null,
        ];

        // Ambil data lab master untuk dropdown
        $labMasters = \App\Models\LabMaster::where('is_active', true)->get();

        return Inertia::render('Pelayanan/PemeriksaanLabDetail', [
            'labQueue' => $transformedLabQueue,
            'labMasters' => $labMasters,
        ]);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'lab_details' => 'required|array',
            'lab_details.*.lab_master_id' => 'required|exists:lab_masters,id',
            'lab_details.*.result' => 'required|string',
            'lab_details.*.result_status' => 'required|in:normal,abnormal',
            'examiner_id' => 'required|exists:users,id',
            'shift_id' => 'required|exists:shifts,id',
            'guarantor_id' => 'required|exists:patient_to_guarantors,id',
        ]);

        // Get the actual guarantor ID from patient_to_guarantors
        $patientToGuarantor = \App\Models\PatientToGuarantor::findOrFail($request->guarantor_id);
        $actualGuarantorId = $patientToGuarantor->guarantors_id;

        $labQueue = LabQueue::findOrFail($id);

        // Update status menjadi selesai
        $labQueue->update([
            'status' => 'selesai',
            'updated_by' => auth()->id()
        ]);

        // Simpan atau update lab exam detail
        $labExamDetail = $labQueue->labExamDetail;
        if (!$labExamDetail) {
            $labExamDetail = $labQueue->labExamDetail()->create([
                'lab_queue_id' => $labQueue->id,
                'examiner_id' => $request->examiner_id,
                'shift_id' => $request->shift_id,
                'guarantor_id' => $actualGuarantorId,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        } else {
            $labExamDetail->update([
                'examiner_id' => $request->examiner_id,
                'shift_id' => $request->shift_id,
                'guarantor_id' => $actualGuarantorId,
                'updated_by' => auth()->id(),
            ]);
        }

        // Simpan atau update lab request
        $labRequest = $labQueue->labRequest;
        if (!$labRequest) {
            $labRequest = $labQueue->labRequest()->create([
                'lab_queue_id' => $labQueue->id,
                'outpatient_queue_id' => null, // Sesuaikan jika diperlukan
                'reference' => 'lab_queue',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        }

        // Hapus detail lama jika ada
        $labRequest->labDetails()->delete();

        // Simpan detail baru
        foreach ($request->lab_details as $detail) {
            $labDetail = $labRequest->labDetails()->create([
                'lab_request_id' => $labRequest->id,
                'lab_master_id' => $detail['lab_master_id'],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            // Simpan hasil lab untuk setiap detail
            $labDetail->labResult()->create([
                'lab_detail_id' => $labDetail->id,
                'result' => $detail['result'],
                'result_status' => $detail['result_status'],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        }

        return redirect()->route('pelayanan.pemeriksaan-lab.index')
            ->with('success', 'Hasil pemeriksaan laboratorium berhasil disimpan');
    }

    public function print($id)
    {
        $labQueue = LabQueue::with([
            'patientRecord.company',
            'patientRecord.plant',
            'patientRecord.department',
            'patientRecord.employeeStatus',
            'patientRecord.guarantors',
            'labRequest.labDetails.labMaster',
            'labRequest.labDetails.labResult',
            'labExamDetail.guarantor',
            'labExamDetail.examiner'
        ])->findOrFail($id);

        return view('lab-results.print', [
            'labQueue' => $labQueue,
        ]);
    }
}
