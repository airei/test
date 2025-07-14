<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OutpatientQueue;
use App\Models\LabMaster;
use App\Models\LabRequest;
use App\Models\LabDetail;
use App\Models\LabResult;
use Illuminate\Support\Facades\DB;

class TestLabRequest extends Command
{
    protected $signature = 'test:lab-request';
    protected $description = 'Test lab request creation with sample data';

    public function handle()
    {
        $this->info('Testing Lab Request Creation...');

        try {
            // Get first outpatient queue
            $outpatientQueue = OutpatientQueue::first();
            if (!$outpatientQueue) {
                $this->error('No outpatient queue found!');
                return 1;
            }

            $this->info("Using outpatient queue ID: {$outpatientQueue->id}");

            // Get first lab master
            $labMaster = LabMaster::first();
            if (!$labMaster) {
                $this->error('No lab master found!');
                return 1;
            }

            $this->info("Using lab master ID: {$labMaster->id}");
            $this->info("Lab master name: {$labMaster->name}");

            // Test data
            $testLabData = [
                'lab_master_id' => $labMaster->id,
                'result' => 'Test Result',
                'result_status' => 'normal',
                'reference' => 'Test Reference',
            ];

            $this->info('Test lab data:');
            $this->table(['Field', 'Value'], [
                ['lab_master_id', $testLabData['lab_master_id']],
                ['lab_master_id_type', gettype($testLabData['lab_master_id'])],
                ['lab_master_id_length', strlen($testLabData['lab_master_id'])],
                ['result', $testLabData['result']],
                ['result_status', $testLabData['result_status']],
                ['reference', $testLabData['reference']],
            ]);

            // Check if lab master exists
            $labMasterExists = LabMaster::where('id', $testLabData['lab_master_id'])->exists();
            $this->info("Lab Master exists in database: " . ($labMasterExists ? 'YES' : 'NO'));

            if (!$labMasterExists) {
                $this->error('Lab Master ID not found in database!');
                return 1;
            }

            // Create lab request
            DB::beginTransaction();

            $labRequest = LabRequest::create([
                'lab_queue_id' => null,
                'outpatient_queue_id' => $outpatientQueue->id,
                'reference' => 'test',
                'created_by' => 1, // Assuming user ID 1 exists
            ]);

            $this->info("Created lab request with ID: {$labRequest->id}");

            // Create lab detail
            $labDetail = LabDetail::create([
                'lab_request_id' => $labRequest->id,
                'lab_master_id' => $testLabData['lab_master_id'],
                'created_by' => 1,
            ]);

            $this->info("Created lab detail with ID: {$labDetail->id}");

            // Create lab result
            $labResult = LabResult::create([
                'lab_detail_id' => $labDetail->id,
                'result' => $testLabData['result'],
                'result_status' => $testLabData['result_status'],
                'created_by' => 1,
            ]);

            $this->info("Created lab result with ID: {$labResult->id}");

            DB::commit();
            $this->info('✅ All lab request operations completed successfully!');

            // Clean up - delete test data
            $this->info('Cleaning up test data...');
            DB::beginTransaction();
            LabResult::where('id', $labResult->id)->delete();
            LabDetail::where('id', $labDetail->id)->delete();
            LabRequest::where('id', $labRequest->id)->delete();
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