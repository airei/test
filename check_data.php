<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\MedicalRecord;
use App\Models\OutpatientQueue;

echo "=== CHECK DATA ===\n";

// Check medical records
$mrs = DB::table('medical_records')->get();
echo "Medical Records Count: " . $mrs->count() . "\n";
foreach($mrs as $mr) {
    echo "MR ID: {$mr->id} | Outpatient Visit ID: {$mr->outpatient_visit_id}\n";
}

// Check diagnosis details
$dds = DB::table('diagnosis_details')->get();
echo "\nDiagnosis Details Count: " . $dds->count() . "\n";
foreach($dds as $dd) {
    echo "DD ID: {$dd->id} | MR ID: {$dd->medical_record_id} | Diagnosas ID: {$dd->diagnosas_id}\n";
}

// Check outpatient queues
$queues = DB::table('outpatient_queue')->limit(3)->get();
echo "\nOutpatient Queues Count: " . $queues->count() . "\n";
foreach($queues as $queue) {
    echo "Queue ID: {$queue->id} | Patient Record ID: {$queue->patient_record_id}\n";
}

echo "\n=== TEST RELATIONSHIP ===\n";
$queueId = "0197d5a7-0c21-7137-a81b-833732e737db";
echo "Testing with Queue ID: {$queueId}\n";

$existingMedicalRecord = MedicalRecord::where('outpatient_visit_id', $queueId)
    ->with([
        'examiner',
        'shift', 
        'guarantor.guarantor',
        'diagnosisDetails.diagnosa',
        'prescriptions.prescriptionDetails.inventoryItem'
    ])
    ->first();

if ($existingMedicalRecord) {
    echo "Medical Record found!\n";
    echo "- ID: {$existingMedicalRecord->id}\n";
    echo "- Status: {$existingMedicalRecord->status}\n";
    echo "- Diagnosis Details Count: " . $existingMedicalRecord->diagnosisDetails->count() . "\n";
    
    foreach($existingMedicalRecord->diagnosisDetails as $dd) {
        $diagnosaName = $dd->diagnosa ? $dd->diagnosa->name : 'NULL';
        $diagnosaCode = $dd->diagnosa ? $dd->diagnosa->code : 'NULL';
        $diagnosaText = $dd->diagnosa_text ?: 'NULL';
        echo "  - DD ID: {$dd->id}\n";
        echo "    Diagnosa ID: {$dd->diagnosas_id}\n";
        echo "    Diagnosa Name: {$diagnosaName}\n";
        echo "    Diagnosa Code: {$diagnosaCode}\n";
        echo "    Diagnosa Text: {$diagnosaText}\n";
    }
} else {
    echo "No medical record found for queue ID: {$queueId}\n";
} 