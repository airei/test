<?php

require_once 'vendor/autoload.php';

use App\Models\MedicalRecord;
use App\Models\DiagnosisDetail;
use App\Models\Diagnosa;
use App\Models\OutpatientQueue;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK TABLE NAMES ===\n";
echo "MedicalRecord table: " . (new MedicalRecord())->getTable() . "\n";
echo "DiagnosisDetail table: " . (new DiagnosisDetail())->getTable() . "\n";

echo "\n=== RAW SQL QUERIES ===\n";
echo "Medical Records Count: " . DB::table('medical_records')->count() . "\n";
echo "Diagnosis Details Count: " . DB::table('diagnosis_details')->count() . "\n";

echo "\n=== MEDICAL RECORDS (Raw) ===\n";
$mrs = DB::table('medical_records')->get();
foreach($mrs as $mr) {
    echo "MR ID: {$mr->id} | Status: {$mr->status} | Outpatient Visit ID: {$mr->outpatient_visit_id}\n";
}

echo "\n=== DIAGNOSIS DETAILS (Raw) ===\n";
$dds = DB::table('diagnosis_details')->get();
foreach($dds as $dd) {
    $diagnosaText = $dd->diagnosa_text ?: 'NULL';
    echo "DD ID: {$dd->id} | MR ID: {$dd->medical_record_id} | Diagnosas ID: {$dd->diagnosas_id} | Text: {$diagnosaText}\n";
}

echo "\n=== RELATIONSHIP TEST (Eloquent) ===\n";
$mr = MedicalRecord::with('diagnosisDetails.diagnosa')->first();
if ($mr) {
    echo "MR ID: {$mr->id} | Diagnosis Count: " . $mr->diagnosisDetails->count() . "\n";
    foreach($mr->diagnosisDetails as $dd) {
        $diagnosaName = $dd->diagnosa ? $dd->diagnosa->name : 'NULL';
        $diagnosaText = $dd->diagnosa_text ?: 'NULL';
        echo "  - DD ID: {$dd->id} | Diagnosa: {$diagnosaName} | Text: {$diagnosaText}\n";
    }
} else {
    echo "No medical records found\n";
}

echo "\n=== OUTPATIENT QUEUES ===\n";
$queues = OutpatientQueue::limit(3)->get();
foreach($queues as $queue) {
    echo "Queue ID: {$queue->id} | Patient: {$queue->patient_record_id}\n";
}

echo "\n=== SIMULATE BACKEND DATA ===\n";
// Simulate what backend sends to frontend
$outpatientQueue = OutpatientQueue::first();
if ($outpatientQueue) {
    echo "Testing with Outpatient Queue ID: {$outpatientQueue->id}\n";
    
    $existingMedicalRecord = MedicalRecord::where('outpatient_visit_id', $outpatientQueue->id)
        ->with([
            'examiner',
            'shift', 
            'guarantor.guarantor',
            'diagnosisDetails.diagnosa',
            'prescriptions.prescriptionDetails.inventoryItem'
        ])
        ->first();
    
    if ($existingMedicalRecord) {
        echo "Existing Medical Record found:\n";
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
        echo "No existing medical record found for outpatient queue ID: {$outpatientQueue->id}\n";
        
        // Check if there are any medical records at all
        $allMRs = MedicalRecord::all();
        echo "Total Medical Records: " . $allMRs->count() . "\n";
        foreach($allMRs as $mr) {
            echo "  - MR ID: {$mr->id} | Outpatient Visit ID: {$mr->outpatient_visit_id}\n";
        }
    }
} else {
    echo "No outpatient queue found\n";
} 