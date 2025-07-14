<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use App\Models\OutpatientQueue;
use App\Models\MedicalRecord;
use App\Models\PatientRecord;
use App\Models\Diagnosa;
use App\Models\InventoryItem;
use App\Models\DiagnosisDetail;
use App\Models\Prescription;
use App\Models\PrescriptionDetail;
use App\Models\Shift;
use App\Models\Guarantor;
use App\Models\PatientToGuarantor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\OutpatientQueueResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class KonsultasiController extends Controller
{
    use AuthorizesRequests;

    public function show($id)
    {
        $outpatientQueue = OutpatientQueue::with([
            'patientRecord.company', 
            'patientRecord.plant', 
            'patientRecord.department',
        ])->findOrFail($id);

        $this->authorize('view', $outpatientQueue);

        // Logic untuk menentukan guarantor yang akan diload
        $defaultGuarantor = null;
        
        // Cek apakah ada medical record yang sudah tersimpan untuk outpatient queue ini (draft)
        $existingMedicalRecord = MedicalRecord::where('outpatient_visit_id', $id)
            ->with([
                'examiner',
                'shift', 
                'guarantor.guarantor',
                'diagnosisDetails.diagnosa',
                'prescriptions.prescriptionDetails.inventoryItem',
                'labRequests.labDetails.labMaster',
                'labRequests.labDetails.labResult',
            ])
            ->first();

        if ($existingMedicalRecord) {
            // Jika ada medical record yang sudah tersimpan, gunakan guarantor dari sana
            $defaultGuarantor = $existingMedicalRecord->guarantor;
        } else {
            // Jika belum ada medical record, cek history konsultasi sebelumnya
            $lastMedicalRecord = MedicalRecord::where('outpatient_visit_id', '!=', $id)
                ->whereHas('outpatientQueue', function($query) use ($outpatientQueue) {
                    $query->where('patient_record_id', $outpatientQueue->patient_record_id);
                })
                ->with('guarantor.guarantor')
                ->latest('created_at')
                ->first();

            if ($lastMedicalRecord && $lastMedicalRecord->guarantor) {
                // Konsultasi kedua dan seterusnya: gunakan guarantor terakhir dari medical_records
                $defaultGuarantor = $lastMedicalRecord->guarantor;
            } else {
                // Konsultasi pertama: ambil dari patient_to_guarantors
                $patientToGuarantor = PatientToGuarantor::where('patient_records_id', $outpatientQueue->patient_record_id)
                    ->with('guarantor')
                    ->first();
                
                if ($patientToGuarantor) {
                    $defaultGuarantor = $patientToGuarantor;
                }
            }
        }
        
        // Mapping lab_requests jika ada
        $labRequests = [];
        if ($existingMedicalRecord && $existingMedicalRecord->labRequests) {
            foreach ($existingMedicalRecord->labRequests as $labRequest) {
                $labDetail = $labRequest->labDetails->first();
                $labResult = $labDetail && $labDetail->labResult ? $labDetail->labResult : null;
                $labMaster = $labDetail && $labDetail->labMaster ? $labDetail->labMaster : null;
                
                // Ambil referensi berdasarkan gender pasien dengan mapping fleksibel
                $selectedReference = '';
                $referenceType = '';
                if ($labMaster) {
                    $patientGender = $this->mapGender($outpatientQueue->patientRecord->gender);
                    $references = $labMaster->references;
                    
                    // Priority: Universal > Gender-specific
                    $universalRef = $references->where('reference_type', 'universal')->first();
                    if ($universalRef) {
                        $selectedReference = $universalRef->reference;
                        $referenceType = 'Universal';
                    } else {
                        $genderRef = $references->where('reference_type', $patientGender)->first();
                        if ($genderRef) {
                            $selectedReference = $genderRef->reference;
                            $referenceType = $patientGender === 'male' ? 'Laki-laki' : ($patientGender === 'female' ? 'Perempuan' : '');
                        }
                    }
                }
                
                $labRequests[] = [
                    'lab_master_id' => $labDetail ? $labDetail->lab_master_id : null,
                    'lab_name' => $labMaster ? $labMaster->name : '',
                    'lab_unit' => $labMaster ? $labMaster->unit : '',
                    'result' => $labResult ? $labResult->result : '',
                    'result_status' => $labResult ? $labResult->result_status : '',
                    'reference' => $selectedReference,
                    'reference_type' => $referenceType,
                ];
            }
        }
        
        return Inertia::render('Pelayanan/Konsultasi', [
            'outpatientQueue' => new OutpatientQueueResource($outpatientQueue),
            'defaultGuarantor' => $defaultGuarantor,
            'existingMedicalRecord' => $existingMedicalRecord,
            'labRequests' => $labRequests,
        ]);
    }

    public function store(Request $request)
    {


        $validated = $request->validate([
            'outpatient_queue_id' => 'required|exists:outpatient_queue,id',
            'examiner_id' => 'required|exists:users,id',
            'shift_id' => 'required|exists:shifts,id',
            'guarantor' => 'required|exists:patient_to_guarantors,id',
            'main_complaint' => 'nullable|string',
            'illness_history' => 'nullable|string',
            'tv_systolic_bp' => 'nullable|numeric|min:0|max:300',
            'tv_diastolic_bp' => 'nullable|numeric|min:0|max:200',
            'tv_pulse' => 'nullable|numeric|min:0|max:300',
            'tv_temperature' => 'nullable|numeric|min:30|max:45',
            'tv_respiration_rate' => 'nullable|numeric|min:0|max:100',
            'tv_oxygen_saturation' => 'nullable|numeric|min:0|max:100',
            'tv_weight' => 'nullable|numeric|min:0|max:500',
            'tv_height' => 'nullable|numeric|min:0|max:300',
            'tv_bmi' => 'nullable|numeric',
            'physical_examination' => 'nullable|string',
            'supporting_examination' => 'nullable|string',
            'diagnosis_details' => 'required|array|min:1',
            'diagnosis_details.*.diagnosas_id' => 'required|exists:diagnosas,id',
            'diagnosis_details.*.diagnosa_text' => 'nullable|string',
            'prescriptions' => 'nullable|array',
            'prescriptions.*.inventory_id' => 'required|exists:inventory_items,id',
            'prescriptions.*.quantity' => 'required|integer|min:1',
            'prescriptions.*.instruction' => 'nullable|string',
            'save_as_draft' => 'nullable|boolean',
            'lab_requests' => 'nullable|array',
            'lab_requests.*.lab_queue_id' => 'nullable|exists:lab_queue,id',
            'lab_requests.*.reference' => 'nullable|string',
            'lab_requests.*.lab_master_id' => 'nullable|exists:lab_masters,id',
            'lab_requests.*.result' => 'nullable|string',
            'lab_requests.*.result_status' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $outpatientQueue = OutpatientQueue::with('patientRecord')->findOrFail($validated['outpatient_queue_id']);

            // 1. Update illness_history di patient record jika ada perubahan
            if (isset($validated['illness_history']) && 
                $validated['illness_history'] !== $outpatientQueue->patientRecord->illness_history) {
                $outpatientQueue->patientRecord->update([
                    'illness_history' => $validated['illness_history'],
                    'updated_by' => auth()->id(),
                ]);
            }

            // 2. Create or Update Medical Record
            $isDraft = $validated['save_as_draft'] ?? false;
            
            // Cek apakah sudah ada medical record untuk outpatient queue ini
            $existingMedicalRecord = MedicalRecord::where('outpatient_visit_id', $outpatientQueue->id)->first();
            
            $medicalRecordData = [
                'outpatient_visit_id' => $outpatientQueue->id,
                'examiner_id' => $validated['examiner_id'],
                'shift_id' => $validated['shift_id'],
                'guarantor' => $validated['guarantor'],
                'chief_complaint' => $validated['main_complaint'],
                'systolic_bp' => $validated['tv_systolic_bp'],
                'diastolic_bp' => $validated['tv_diastolic_bp'],
                'pulse_rate' => $validated['tv_pulse'],
                'resp_rate' => $validated['tv_respiration_rate'],
                'temperature' => $validated['tv_temperature'],
                'oxygen_saturation' => $validated['tv_oxygen_saturation'],
                'weight' => $validated['tv_weight'],
                'height' => $validated['tv_height'],
                'phys_exam' => $validated['physical_examination'],
                'status' => $isDraft ? 'draft' : 'complete',
                'updated_by' => auth()->id(),
            ];
            
            if ($existingMedicalRecord) {
                $existingMedicalRecord->update($medicalRecordData);
                $medicalRecord = $existingMedicalRecord;
            } else {
                $medicalRecordData['created_by'] = auth()->id();
                $medicalRecord = MedicalRecord::create($medicalRecordData);
            }

            // 3. Create or Update Diagnosis Details
            
            // Hapus diagnosis details yang sudah ada
            DiagnosisDetail::where('medical_record_id', $medicalRecord->id)->delete();
            
            // Buat diagnosis details baru
            foreach ($validated['diagnosis_details'] as $diag) {
                $diagnosisData = [
                    'medical_record_id' => $medicalRecord->id,
                    'diagnosas_id' => $diag['diagnosas_id'],
                    'diagnosa_text' => $diag['diagnosa_text'] ?? null,
                    'created_by' => auth()->id(),
                ];
                
                DiagnosisDetail::create($diagnosisData);
            }

            // 4. Create or Update Prescriptions
            // Hapus prescriptions yang sudah ada
            $existingPrescriptions = Prescription::where('medical_record_id', $medicalRecord->id)->get();
            foreach ($existingPrescriptions as $existingPrescription) {
                PrescriptionDetail::where('prescription_id', $existingPrescription->id)->delete();
            }
            Prescription::where('medical_record_id', $medicalRecord->id)->delete();
            
            if (!empty($validated['prescriptions'])) {
                $prescription = Prescription::create([
                    'medical_record_id' => $medicalRecord->id,
                    'prescription_number' => 'RX-' . date('Ymd') . '-' . str_pad($medicalRecord->id, 4, '0', STR_PAD_LEFT),
                    'prescription_date' => now(),
                    'created_by' => auth()->id(),
                ]);

                foreach ($validated['prescriptions'] as $med) {
                    $prescriptionDetailData = [
                        'prescription_id' => $prescription->id,
                        'inventory_id' => $med['inventory_id'],
                        'quantity' => $med['quantity'],
                        'instruction' => $med['instruction'],
                        'created_by' => auth()->id(),
                    ];
                    // Remove any unwanted fields that might cause database errors
                    unset($prescriptionDetailData['unit_id']);
                    $prescriptionDetail = PrescriptionDetail::create($prescriptionDetailData);
                    // Perbaikan: kurangi stok inventory
                    $item = \App\Models\InventoryItem::find($med['inventory_id']);
                    if ($item) {
                        $item->decrement('stock', $med['quantity']);
                    }
                }
            }
            
            // 5. Update Outpatient Queue Status
            $outpatientQueue->update([
                'status' => $isDraft ? 'in_progress' : 'completed',
                'updated_by' => auth()->id()
            ]);

            // 5. Create or Update Lab Requests & Results
            // Hapus lab requests yang sudah ada
            $existingLabRequests = \App\Models\LabRequest::where('outpatient_queue_id', $outpatientQueue->id)->get();
            foreach ($existingLabRequests as $existingLabRequest) {
                // Hapus lab results
                \App\Models\LabResult::whereHas('labDetail', function($query) use ($existingLabRequest) {
                    $query->where('lab_request_id', $existingLabRequest->id);
                })->delete();
                
                // Hapus lab details
                \App\Models\LabDetail::where('lab_request_id', $existingLabRequest->id)->delete();
                
                // Hapus lab request
                $existingLabRequest->delete();
            }
            
            if (!empty($validated['lab_requests'])) {
                foreach ($validated['lab_requests'] as $lab) {
                    // Simpan ke tabel lab_request (Alur 1: dari outpatient)
                    $labRequest = \App\Models\LabRequest::create([
                        'lab_queue_id' => null, // Tidak menggunakan lab_queue untuk outpatient
                        'outpatient_queue_id' => $outpatientQueue->id,
                        'reference' => 'outpatient_queue',
                        'created_by' => auth()->id(),
                    ]);

                    // Simpan ke tabel lab_detail (jika ada detail)
                    $labDetail = null;
                    if (!empty($lab['lab_master_id'])) {
                        $labDetail = \App\Models\LabDetail::create([
                            'lab_request_id' => $labRequest->id,
                            'lab_master_id' => $lab['lab_master_id'],
                            'created_by' => auth()->id(),
                        ]);
                    }

                    // Simpan ke tabel lab_result (jika ada hasil)
                    if ($labDetail && !empty($lab['result'])) {
                        \App\Models\LabResult::create([
                            'lab_detail_id' => $labDetail->id,
                            'result' => $lab['result'],
                            'result_status' => $lab['result_status'] ?? 'normal',
                            'created_by' => auth()->id(),
                        ]);
                    }
                }
            }

            DB::commit();

            $message = $isDraft ? 'Data konsultasi berhasil disimpan sebagai draft.' : 'Data konsultasi berhasil disimpan dan diselesaikan.';
            return redirect()->route('pelayanan.rawat-jalan.index')->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data. ' . $e->getMessage()]);
        }
    }

    // Fungsi mapping gender yang fleksibel
    private function mapGender($gender)
    {
        $g = strtolower(trim($gender));
        if (in_array($g, ['l', 'male', 'm', 'laki-laki', 'laki laki', 'pria'])) return 'male';
        if (in_array($g, ['p', 'female', 'f', 'perempuan', 'wanita'])) return 'female';
        return '';
    }
}
