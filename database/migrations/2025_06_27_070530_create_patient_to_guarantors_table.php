<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_to_guarantors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_records_id');
            $table->uuid('guarantors_id');
            $table->string('guarantor_number')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('patient_records_id')->references('id')->on('patient_records')->onDelete('cascade');
            $table->foreign('guarantors_id')->references('id')->on('guarantors')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('patient_records_id');
            $table->index('guarantors_id');
            $table->index('guarantor_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_to_guarantors');
    }
}; 