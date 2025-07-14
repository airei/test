<?php

require_once 'vendor/autoload.php';

use App\Exports\LaboratoriumExport;

try {
    echo "Testing LaboratoriumExport...\n";
    
    $export = new LaboratoriumExport();
    echo "Export class created successfully\n";
    
    // Test data retrieval
    $labMasters = \App\Models\LabMaster::with(['company', 'plant', 'references', 'creator'])
        ->orderBy('name')
        ->get();
    
    echo "Found " . $labMasters->count() . " lab masters\n";
    
    if ($labMasters->count() > 0) {
        $firstLab = $labMasters->first();
        echo "First lab: " . $firstLab->name . "\n";
        echo "References count: " . $firstLab->references->count() . "\n";
    }
    
    echo "Test completed successfully\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
} 