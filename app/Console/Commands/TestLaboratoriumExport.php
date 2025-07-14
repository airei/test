<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Exports\LaboratoriumExport;
use App\Models\LabMaster;

class TestLaboratoriumExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:laboratorium-export';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test laboratorium export functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->info('Testing LaboratoriumExport...');
            
            $export = new LaboratoriumExport();
            $this->info('Export class created successfully');
            
            // Test data retrieval
            $labMasters = LabMaster::with(['company', 'plant', 'references', 'creator'])
                ->orderBy('name')
                ->get();
            
            $this->info('Found ' . $labMasters->count() . ' lab masters');
            
            if ($labMasters->count() > 0) {
                $firstLab = $labMasters->first();
                $this->info('First lab: ' . $firstLab->name);
                $this->info('References count: ' . $firstLab->references->count());
            }
            
            $this->info('Test completed successfully');
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile());
            $this->error('Line: ' . $e->getLine());
        }
    }
}
