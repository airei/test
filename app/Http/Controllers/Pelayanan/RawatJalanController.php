<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use App\Models\OutpatientQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RawatJalanController extends Controller
{
    public function index(Request $request)
    {
        // Jika ada patient_id, buat outpatient queue baru
        if ($request->filled('patient_id')) {
            $patientRecord = \App\Models\PatientRecord::find($request->patient_id);
            if ($patientRecord) {
                // Cek apakah sudah ada queue untuk pasien ini hari ini
                $existingQueue = OutpatientQueue::where('patient_record_id', $patientRecord->id)
                    ->whereDate('created_at', today())
                    ->where('status', '!=', 'cancelled')
                    ->first();

                if (!$existingQueue) {
                    // Buat queue baru
                    OutpatientQueue::create([
                        'patient_record_id' => $patientRecord->id,
                        'status' => 'waiting',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                }
                // Redirect ke index tanpa parameter patient_id
                return redirect()->route('pelayanan.rawat-jalan.index');
            }
        }

        $query = OutpatientQueue::with([
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

        // Urutkan berdasarkan waktu kunjungan terbaru
        $outpatientQueues = $query->orderBy('created_at', 'desc')
                                 ->paginate(10)
                                 ->withQueryString();

        // Transform data untuk frontend
        $outpatientQueues->getCollection()->transform(function ($queue) use ($timezone, $offset, $userLocalTime) {
            $createdAt = \Carbon\Carbon::parse($queue->getRawOriginal('created_at'), 'UTC');
            $waktuLokal = $createdAt->setTimezone($timezone)->format('Y-m-d H:i');
            // Logging debug
            \Log::info('[DEBUG RAWAT JALAN]', [
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
                'outpatient_visit_number' => $queue->outpatient_visit_number,
                'patient_record_id' => $queue->patient_record_id,
            ];
        });

        // Statistik box
        $totalToday = OutpatientQueue::where('status', '!=', 'cancelled')
            ->whereDate('created_at', today())
            ->count();
        $totalMonth = OutpatientQueue::where('status', '!=', 'cancelled')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $totalDraftMonth = OutpatientQueue::where('status', 'in_progress')
            ->where('created_at', '>=', now()->subMonth())
            ->count();
        $totalCancelledMonth = OutpatientQueue::where('status', 'cancelled')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $totalCompletedMonth = OutpatientQueue::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return Inertia::render('Pelayanan/RawatJalan', [
            'outpatientQueues' => $outpatientQueues,
            'filters' => $request->only(['search', 'status', 'tanggal']),
            'stats' => [
                'totalToday' => $totalToday,
                'totalMonth' => $totalMonth,
                'totalDraftMonth' => $totalDraftMonth,
                'totalCancelledMonth' => $totalCancelledMonth,
                'totalCompletedMonth' => $totalCompletedMonth,
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:waiting,in_progress,completed,cancelled'
        ]);

        $queue = OutpatientQueue::findOrFail($id);
        $queue->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        // Return JSON response untuk AJAX request
        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Status kunjungan berhasil diperbarui']);
        }

        return redirect()->back()->with('success', 'Status kunjungan berhasil diperbarui');
    }
}
