<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\DiagnosisDetail;
use App\Models\PatientToGuarantor;
use App\Models\Guarantor;

echo "=== TEST DIAGNOSA DATA ===\n";

// Check diagnosis details
$diagnosisDetails = DiagnosisDetail::all();
echo "Total diagnosis details: " . $diagnosisDetails->count() . "\n";
foreach($diagnosisDetails as $dd) {
    echo "DD ID: {$dd->id} | Outpatient Queue ID: {$dd->outpatient_queue_id} | Diagnosa ID: {$dd->diagnosas_id}\n";
}

// Check diagnosas
$diagnosas = DB::table('diagnosas')->get();
echo "\nTotal diagnosas: " . $diagnosas->count() . "\n";
foreach($diagnosas as $diagnosa) {
    echo "Diagnosa: {$diagnosa->code} - {$diagnosa->name}\n";
}

echo "\n=== TEST PENJAMIN DATA ===\n";

// Check patient_to_guarantors
$patientToGuarantors = PatientToGuarantor::all();
echo "Total patient_to_guarantors: " . $patientToGuarantors->count() . "\n";
foreach($patientToGuarantors as $ptg) {
    echo "PTG ID: {$ptg->id} | Patient Record ID: {$ptg->patient_record_id} | Guarantor ID: {$ptg->guarantor_id}\n";
}

// Check guarantors
$guarantors = Guarantor::all();
echo "\nTotal guarantors: " . $guarantors->count() . "\n";
foreach($guarantors as $guarantor) {
    echo "Guarantor: {$guarantor->name} - ID: {$guarantor->id}\n";
}

echo "\n=== TEST QUERY DIAGNOSA ===\n";

$month = now()->month;
$year = now()->year;

// Test diagnosa query
$diagnosaQuery = DiagnosisDetail::join('outpatient_queue', 'diagnosis_details.outpatient_queue_id', '=', 'outpatient_queue.id')
    ->join('diagnosas', 'diagnosis_details.diagnosas_id', '=', 'diagnosas.id')
    ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
    ->whereMonth('outpatient_queue.created_at', $month)
    ->whereYear('outpatient_queue.created_at', $year)
    ->selectRaw('CONCAT(diagnosas.code, " - ", diagnosas.name) as diagnosa_full, COUNT(*) as total')
    ->groupBy('diagnosas.id', 'diagnosas.code', 'diagnosas.name')
    ->orderByDesc('total')
    ->limit(10);

echo "Diagnosa query SQL: " . $diagnosaQuery->toSql() . "\n";
echo "Diagnosa query bindings: " . json_encode($diagnosaQuery->getBindings()) . "\n";

$diagnosaData = $diagnosaQuery->get();
echo "Diagnosa result count: " . $diagnosaData->count() . "\n";
foreach($diagnosaData as $data) {
    echo "Diagnosa: {$data->diagnosa_full} - Total: {$data->total}\n";
}

// Test diagnosa query without date filter
echo "\n=== TEST DIAGNOSA QUERY ALL TIME ===\n";
$diagnosaQueryAll = DiagnosisDetail::join('outpatient_queue', 'diagnosis_details.outpatient_queue_id', '=', 'outpatient_queue.id')
    ->join('diagnosas', 'diagnosis_details.diagnosas_id', '=', 'diagnosas.id')
    ->join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
    ->selectRaw('CONCAT(diagnosas.code, " - ", diagnosas.name) as diagnosa_full, COUNT(*) as total')
    ->groupBy('diagnosas.id', 'diagnosas.code', 'diagnosas.name')
    ->orderByDesc('total')
    ->limit(10);

echo "Diagnosa query all time SQL: " . $diagnosaQueryAll->toSql() . "\n";

$diagnosaDataAll = $diagnosaQueryAll->get();
echo "Diagnosa all time result count: " . $diagnosaDataAll->count() . "\n";
foreach($diagnosaDataAll as $data) {
    echo "Diagnosa: {$data->diagnosa_full} - Total: {$data->total}\n";
}

echo "\n=== TEST PENJAMIN QUERY ===\n";

// Test penjamin query
$penjaminQuery = \App\Models\OutpatientQueue::join('patient_records', 'outpatient_queue.patient_record_id', '=', 'patient_records.id')
    ->join('patient_to_guarantors', 'patient_records.id', '=', 'patient_to_guarantors.patient_record_id')
    ->join('guarantors', 'patient_to_guarantors.guarantor_id', '=', 'guarantors.id')
    ->whereMonth('outpatient_queue.created_at', $month)
    ->whereYear('outpatient_queue.created_at', $year)
    ->selectRaw('guarantors.name, COUNT(*) as total')
    ->groupBy('guarantors.id', 'guarantors.name');

echo "Penjamin query SQL: " . $penjaminQuery->toSql() . "\n";
echo "Penjamin query bindings: " . json_encode($penjaminQuery->getBindings()) . "\n";

$penjaminData = $penjaminQuery->get();
echo "Penjamin result count: " . $penjaminData->count() . "\n";
foreach($penjaminData as $data) {
    echo "Penjamin: {$data->name} - Total: {$data->total}\n";
} 