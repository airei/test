<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientRecord;
use App\Models\OutpatientQueue;
use App\Models\LabQueue;
use Inertia\Inertia;
use Carbon\Carbon;

class RiwayatRekamMedisController extends Controller
{
    public function show($patientId)
    {
        // Ambil data pasien
        $patient = PatientRecord::with([
            'company',
            'plant',
            'department',
            'employeeStatus',
            'guarantors.guarantor'
        ])->findOrFail($patientId);

        // Debug: cek data guarantor
        \Log::info('Patient guarantors:', [
            'patient_id' => $patientId,
            'guarantors' => $patient->guarantors->toArray()
        ]);

        // Ambil semua riwayat kunjungan rawat jalan
        $outpatientHistory = OutpatientQueue::with([
            'medicalRecords.examiner',
            'medicalRecords.shift',
            'medicalRecords.guarantor.guarantor',
            'medicalRecords.diagnosisDetails.diagnosa',
            'medicalRecords.prescriptions.prescriptionDetails.inventoryItem',
            'medicalRecords.labRequests.labDetails.labMaster',
            'medicalRecords.labRequests.labDetails.labResult'
        ])
        ->where('patient_record_id', $patientId)
        ->where('status', 'completed')
        ->orderBy('created_at', 'desc')
        ->get();

        // Ambil semua riwayat kunjungan lab
        $labHistory = LabQueue::with([
            'labExamDetail.examiner',
            'labExamDetail.shift',
            'labExamDetail.guarantor',
            'labRequest.labDetails.labMaster',
            'labRequest.labDetails.labResult'
        ])
        ->where('patient_record_id', $patientId)
        ->where('status', 'selesai')
        ->orderBy('created_at', 'desc')
        ->get();

        // Format data untuk frontend
        $medicalHistory = [];

        // Proses data rawat jalan
        foreach ($outpatientHistory as $outpatient) {
            if ($outpatient->medicalRecords) {
                foreach ($outpatient->medicalRecords as $medicalRecord) {
                    $medicalHistory[] = [
                        'id' => $medicalRecord->id,
                        'type' => 'outpatient',
                        'visit_date' => $outpatient->created_at,
                        'visit_number' => $outpatient->outpatient_visit_number,
                        'examiner' => $medicalRecord->examiner ? $medicalRecord->examiner->name : '-',
                        'shift' => $medicalRecord->shift ? $medicalRecord->shift->name : '-',
                        'guarantor' => (is_object($medicalRecord->guarantor) && $medicalRecord->guarantor->guarantor)
                            ? $medicalRecord->guarantor->guarantor->name
                            : (is_string($medicalRecord->guarantor) ? \App\Models\PatientToGuarantor::with('guarantor')->find($medicalRecord->guarantor)?->guarantor?->name : '-'),
                        'chief_complaint' => $medicalRecord->chief_complaint ?? '-',
                        'illness_history' => $patient->illness_history ?? '-',
                        'vital_signs' => [
                            'systolic' => $medicalRecord->systolic_bp ?? '-',
                            'diastolic' => $medicalRecord->diastolic_bp ?? '-',
                            'pulse' => $medicalRecord->pulse_rate ?? '-',
                            'respiratory' => $medicalRecord->resp_rate ?? '-',
                            'temperature' => $medicalRecord->temperature ?? '-',
                            'oxygen_saturation' => $medicalRecord->oxygen_saturation ?? '-'
                        ],
                        'physical_exam' => $medicalRecord->phys_exam ?? '-',
                        'nutrition_status' => [
                            'height' => $medicalRecord->height ?? '-',
                            'weight' => $medicalRecord->weight ?? '-',
                            'bmi' => $this->calculateBMI($medicalRecord->height, $medicalRecord->weight),
                            'bmi_category' => $this->getBMICategory($medicalRecord->height, $medicalRecord->weight)
                        ],
                        'diagnoses' => $medicalRecord->diagnosisDetails->map(function($diagnosis) {
                            return [
                                'code' => $diagnosis->diagnosa ? $diagnosis->diagnosa->code : '-',
                                'name' => $diagnosis->diagnosa ? $diagnosis->diagnosa->name : ($diagnosis->diagnosa_text ?? '-'),
                                'is_written' => !$diagnosis->diagnosa && $diagnosis->diagnosa_text
                            ];
                        })->toArray(),
                        'medications' => $medicalRecord->prescriptions->flatMap(function($prescription) {
                            return $prescription->prescriptionDetails->map(function($detail) {
                                return [
                                    'name' => $detail->inventoryItem ? $detail->inventoryItem->name : '-',
                                    'quantity' => $detail->quantity ?? '-',
                                    'unit' => $detail->inventoryItem && $detail->inventoryItem->unit 
                                        ? $detail->inventoryItem->unit->name : '-',
                                    'instruction' => $detail->instruction ?? '-'
                                ];
                            });
                        })->toArray(),
                        'lab_examinations' => $medicalRecord->labRequests->flatMap(function($labRequest) {
                            return $labRequest->labDetails->map(function($detail) {
                                return [
                                    'name' => $detail->labMaster ? $detail->labMaster->name : '-',
                                    'result' => $detail->labResult ? $detail->labResult->result : '-',
                                    'unit' => $detail->labMaster ? $detail->labMaster->unit : '-',
                                    'status' => $detail->labResult ? $detail->labResult->result_status : '-'
                                ];
                            });
                        })->toArray()
                    ];
                }
            }
        }

        // Proses data lab
        foreach ($labHistory as $labQueue) {
            if ($labQueue->labRequest) {
                $medicalHistory[] = [
                    'id' => $labQueue->id,
                    'type' => 'lab',
                    'visit_date' => $labQueue->created_at,
                    'visit_number' => $labQueue->lab_visit_number,
                    'examiner' => $labQueue->labExamDetail && $labQueue->labExamDetail->examiner 
                        ? $labQueue->labExamDetail->examiner->name : '-',
                    'shift' => $labQueue->labExamDetail && $labQueue->labExamDetail->shift 
                        ? $labQueue->labExamDetail->shift->name : '-',
                    'guarantor' => $labQueue->labExamDetail && $labQueue->labExamDetail->guarantor 
                        ? $labQueue->labExamDetail->guarantor->name : '-',
                    'chief_complaint' => '-',
                    'illness_history' => '-',
                    'vital_signs' => [
                        'systolic' => '-',
                        'diastolic' => '-',
                        'pulse' => '-',
                        'respiratory' => '-',
                        'temperature' => '-',
                        'oxygen_saturation' => '-'
                    ],
                    'physical_exam' => '-',
                    'nutrition_status' => [
                        'height' => '-',
                        'weight' => '-',
                        'bmi' => '-',
                        'bmi_category' => '-'
                    ],
                    'diagnoses' => [],
                    'medications' => [],
                    'lab_examinations' => $labQueue->labRequest->labDetails->map(function($detail) {
                        return [
                            'name' => $detail->labMaster ? $detail->labMaster->name : '-',
                            'result' => $detail->labResult ? $detail->labResult->result : '-',
                            'unit' => $detail->labMaster ? $detail->labMaster->unit : '-',
                            'status' => $detail->labResult ? $detail->labResult->result_status : '-'
                        ];
                    })->toArray()
                ];
            }
        }

        // Urutkan berdasarkan tanggal kunjungan (terbaru di atas)
        usort($medicalHistory, function($a, $b) {
            return strtotime($b['visit_date']) - strtotime($a['visit_date']);
        });

        // Pagination
        $perPage = 10;
        $currentPage = request()->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedHistory = array_slice($medicalHistory, $offset, $perPage);
        
        $totalPages = ceil(count($medicalHistory) / $perPage);
        
        // Generate pagination links
        $paginationLinks = [];
        for ($i = 1; $i <= $totalPages; $i++) {
            $paginationLinks[] = [
                'url' => route('pelayanan.riwayat-rekam-medis.show', $patientId) . '?page=' . $i,
                'label' => (string)$i,
                'active' => $i == $currentPage
            ];
        }

        return Inertia::render('Pelayanan/RiwayatRekamMedis/Show', [
            'patient' => $patient,
            'medicalHistory' => $paginatedHistory,
            'pagination' => [
                'current_page' => (int)$currentPage,
                'last_page' => $totalPages,
                'per_page' => $perPage,
                'total' => count($medicalHistory),
                'links' => $paginationLinks
            ]
        ]);
    }

    private function calculateBMI($height, $weight)
    {
        if (!$height || !$weight || $height <= 0) {
            return '-';
        }
        
        $heightInMeters = $height / 100; // Convert cm to meters
        $bmi = $weight / ($heightInMeters * $heightInMeters);
        
        return number_format($bmi, 1);
    }

    private function getBMICategory($height, $weight)
    {
        $bmi = $this->calculateBMI($height, $weight);
        
        if ($bmi === '-') {
            return '-';
        }
        
        $bmi = floatval($bmi);
        
        if ($bmi < 18.5) {
            return 'Kurus';
        } elseif ($bmi >= 18.5 && $bmi < 25) {
            return 'Normal';
        } elseif ($bmi >= 25 && $bmi < 30) {
            return 'Gemuk';
        } else {
            return 'Obesitas';
        }
    }
} 