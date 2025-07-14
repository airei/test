<?php

namespace App\Http\Controllers\Pelayanan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OutpatientQueue;
use App\Models\MedicalRecord;
use Inertia\Inertia;

class ResumeMedisController extends Controller
{
    public function print($outpatientQueueId)
    {
        // Ambil data kunjungan rawat jalan beserta relasi yang diperlukan
        $queue = OutpatientQueue::with([
            'patientRecord.company',
            'patientRecord.plant',
            'patientRecord.department',
            'patientRecord.guarantors.guarantor',
        ])->findOrFail($outpatientQueueId);

        // Ambil medical record terkait
        $medicalRecord = MedicalRecord::where('outpatient_visit_id', $queue->id)
            ->with([
                'examiner',
                'shift',
                'diagnosisDetails.diagnosa',
                'prescriptions.prescriptionDetails.inventoryItem',
                'labRequests.labDetails.labMaster',
                'labRequests.labDetails.labResult',
            ])->first();

        // Load relasi guarantor secara terpisah untuk memastikan berfungsi
        if ($medicalRecord) {
            // Coba load dengan fresh query
            $medicalRecord->load('guarantor.guarantor');
            
            // Jika masih tidak berfungsi, ambil data guarantor secara manual
            if (!$medicalRecord->guarantor || !is_object($medicalRecord->guarantor)) {
                $patientToGuarantor = \App\Models\PatientToGuarantor::with('guarantor')
                    ->find($medicalRecord->guarantor);
                if ($patientToGuarantor) {
                    // Set relasi secara manual
                    $medicalRecord->setRelation('guarantor', $patientToGuarantor);
                }
            }
        }



        // Ambil data guarantor secara terpisah untuk memastikan tersedia
        $guarantorData = null;
        if ($medicalRecord && $medicalRecord->guarantor) {
            if (is_object($medicalRecord->guarantor)) {
                $guarantorData = $medicalRecord->guarantor;
            } else {
                // Jika masih string, ambil secara manual
                $guarantorData = \App\Models\PatientToGuarantor::with('guarantor')
                    ->find($medicalRecord->guarantor);
            }
        }

        return view('resume-medis.print', [
            'queue' => $queue,
            'medicalRecord' => $medicalRecord,
            'guarantorData' => $guarantorData,
        ]);
    }
} 