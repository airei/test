<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OutpatientQueue;
use App\Models\User;
use App\Models\Shift;
use App\Models\PatientToGuarantor;
use App\Models\Diagnosa;
use App\Models\InventoryItem;
use App\Models\LabMaster;
use App\Models\MedicalRecord;
use App\Models\DiagnosisDetail;
use App\Models\Prescription;
use App\Models\PrescriptionDetail;
use App\Models\LabRequest;
use App\Models\LabDetail;
use App\Models\LabResult;
use Illuminate\Support\Facades\DB;

class TestKonsultasiWithLab extends Command
{
    protected $signature = 'test:konsultasi-with-lab';
    protected $description = 'Test konsultasi lengkap dengan lab request';

    public function handle()
    {
        $this->info('Testing Konsultasi with Lab Request...');

        try {
            // Get test data
            $outpatientQueue = OutpatientQueue::first();
            if (!$outpatientQueue) {
                $this->error('No outpatient queue found!');
                return 1;
            }

            $user = User::first();
            if (!$user) {
                $this->error('No user found!');
                return 1;
            }

            $shift = Shift::first();
            if (!$shift) {
                $this->error('No shift found!');
                return 1;
            }

            $patientGuarantor = PatientToGuarantor::where('patient_records_id', $outpatientQueue->patient_record_id)->first();
            if (!$patientGuarantor) {
                $this->error('No patient guarantor found!');
                return 1;
            }

            $diagnosa = Diagnosa::first();
            if (!$diagnosa) {
                $this->error('No diagnosa found!');
                return 1;
            }

            $inventoryItem = InventoryItem::first();
            if (!$inventoryItem) {
                $this->error('No inventory item found!');
                return 1;
            }

            $labMaster = LabMaster::first();
            if (!$labMaster) {
                $this->error('No lab master found!');
                return 1;
            }

            $this->info("Using outpatient queue ID: {$outpatientQueue->id}");
            $this->info("Using user ID: {$user->id}");
            $this->info("Using shift ID: {$shift->id}");
            $this->info("Using patient guarantor ID: {$patientGuarantor->id}");
            $this->info("Using diagnosa ID: {$diagnosa->id}");
            $this->info("Using inventory item ID: {$inventoryItem->id}");
            $this->info("Using lab master ID: {$labMaster->id}");

            // Test data
            $testData = [
                'outpatient_queue_id' => $outpatientQueue->id,
                'examiner_id' => $user->id,
                'shift_id' => $shift->id,
                'guarantor' => $patientGuarantor->id,
                'main_complaint' => 'Test complaint',
                'illness_history' => 'Test history',
                'tv_systolic_bp' => 120,
                'tv_diastolic_bp' => 80,
                'tv_pulse' => 72,
                'tv_temperature' => 36.5,
                'tv_respiration_rate' => 16,
                'tv_oxygen_saturation' => 98,
                'tv_weight' => 70,
                'tv_height' => 170,
                'tv_bmi' => 24.2,
                'physical_examination' => 'Test physical exam',
                'supporting_examination' => 'Test supporting exam',
                'diagnosis_details' => [
                    [
                        'diagnosas_id' => $diagnosa->id,
                        'diagnosa_text' => 'Test diagnosa text'
                    ]
                ],
                'prescriptions' => [
                    [
                        'inventory_id' => $inventoryItem->id,
                        'quantity' => 10,
                        'instruction' => 'Test instruction'
                    ]
                ],
                'lab_requests' => [
                    [
                        'lab_master_id' => $labMaster->id,
                        'result' => 'Test result',
                        'result_status' => 'normal',
                        'reference' => 'Test reference'
                    ]
                ],
                'save_as_draft' => false
            ];

            $this->info('Test data prepared successfully');

            // Begin transaction
            DB::beginTransaction();

            // 1. Update illness_history di patient record
            $outpatientQueue->patientRecord->update([
                'illness_history' => $testData['illness_history'],
                'updated_by' => $user->id,
            ]);

            // 2. Create Medical Record
            $medicalRecord = MedicalRecord::create([
                'outpatient_visit_id' => $outpatientQueue->id,
                'examiner_id' => $testData['examiner_id'],
                'shift_id' => $testData['shift_id'],
                'guarantor' => $testData['guarantor'],
                'chief_complaint' => $testData['main_complaint'],
                'systolic_bp' => $testData['tv_systolic_bp'],
                'diastolic_bp' => $testData['tv_diastolic_bp'],
                'pulse_rate' => $testData['tv_pulse'],
                'resp_rate' => $testData['tv_respiration_rate'],
                'temperature' => $testData['tv_temperature'],
                'oxygen_saturation' => $testData['tv_oxygen_saturation'],
                'weight' => $testData['tv_weight'],
                'height' => $testData['tv_height'],
                'phys_exam' => $testData['physical_examination'],
                'status' => 'complete',
                'created_by' => $user->id,
            ]);

            $this->info("Created medical record with ID: {$medicalRecord->id}");

            // 3. Create Diagnosis Details
            foreach ($testData['diagnosis_details'] as $diag) {
                $diagnosisDetail = DiagnosisDetail::create([
                    'medical_record_id' => $medicalRecord->id,
                    'diagnosas_id' => $diag['diagnosas_id'],
                    'diagnosa_text' => $diag['diagnosa_text'],
                    'created_by' => $user->id,
                ]);
                $this->info("Created diagnosis detail with ID: {$diagnosisDetail->id}");
            }

            // 4. Create Prescriptions
            $prescription = Prescription::create([
                'medical_record_id' => $medicalRecord->id,
                'prescription_number' => 'RX-' . date('Ymd') . '-' . str_pad($medicalRecord->id, 4, '0', STR_PAD_LEFT),
                'prescription_date' => now(),
                'created_by' => $user->id,
            ]);

            $this->info("Created prescription with ID: {$prescription->id}");

            foreach ($testData['prescriptions'] as $med) {
                $prescriptionDetail = PrescriptionDetail::create([
                    'prescription_id' => $prescription->id,
                    'inventory_id' => $med['inventory_id'],
                    'quantity' => $med['quantity'],
                    'instruction' => $med['instruction'],
                    'created_by' => $user->id,
                ]);
                $this->info("Created prescription detail with ID: {$prescriptionDetail->id}");
            }

            // 5. Update Outpatient Queue Status
            $outpatientQueue->update([
                'status' => 'completed',
                'updated_by' => $user->id
            ]);

            $this->info("Updated outpatient queue status to completed");

            // 6. Create Lab Requests & Results
            foreach ($testData['lab_requests'] as $lab) {
                // Create lab request (Alur 1: dari outpatient)
                $labRequest = LabRequest::create([
                    'lab_queue_id' => null, // Tidak menggunakan lab_queue untuk outpatient
                    'outpatient_queue_id' => $outpatientQueue->id,
                    'reference' => 'outpatient_queue',
                    'created_by' => $user->id,
                ]);

                $this->info("Created lab request with ID: {$labRequest->id}");

                // Create lab detail
                $labDetail = LabDetail::create([
                    'lab_request_id' => $labRequest->id,
                    'lab_master_id' => $lab['lab_master_id'],
                    'created_by' => $user->id,
                ]);

                $this->info("Created lab detail with ID: {$labDetail->id}");

                // Create lab result
                $labResult = LabResult::create([
                    'lab_detail_id' => $labDetail->id,
                    'result' => $lab['result'],
                    'result_status' => $lab['result_status'],
                    'created_by' => $user->id,
                ]);

                $this->info("Created lab result with ID: {$labResult->id}");
            }

            DB::commit();
            $this->info('✅ All konsultasi operations completed successfully!');

            // Clean up - delete test data
            $this->info('Cleaning up test data...');
            DB::beginTransaction();
            
            // Delete in reverse order
            LabResult::where('lab_detail_id', $labDetail->id)->delete();
            LabDetail::where('id', $labDetail->id)->delete();
            LabRequest::where('id', $labRequest->id)->delete();
            
            PrescriptionDetail::where('prescription_id', $prescription->id)->delete();
            Prescription::where('id', $prescription->id)->delete();
            
            DiagnosisDetail::where('medical_record_id', $medicalRecord->id)->delete();
            MedicalRecord::where('id', $medicalRecord->id)->delete();
            
            // Restore outpatient queue status
            $outpatientQueue->update([
                'status' => 'waiting',
                'updated_by' => $user->id
            ]);
            
            DB::commit();
            $this->info('✅ Test data cleaned up successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }
} 