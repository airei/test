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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('outpatient_visit_id');
            $table->uuid('examiner_id');
            $table->uuid('shift_id')->nullable();
            $table->uuid('guarantor')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->integer('systolic_bp')->nullable();
            $table->integer('diastolic_bp')->nullable();
            $table->integer('pulse_rate')->nullable();
            $table->integer('resp_rate')->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('oxygen_saturation')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->text('phys_exam')->nullable();
            $table->enum('status', ['draft', 'complete'])->default('draft');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('outpatient_visit_id')->references('id')->on('outpatient_queue')->onDelete('cascade');
            $table->foreign('examiner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('shift_id')->references('id')->on('shifts')->onDelete('set null');
            $table->foreign('guarantor')->references('id')->on('patient_to_guarantors')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('outpatient_visit_id');
            $table->index('examiner_id');
            $table->index('shift_id');
            $table->index('guarantor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
