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
        Schema::create('lab_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_record_id');
            $table->string('lab_visit_number');
            $table->enum('status', ['belum diperiksa', 'sedang diperiksa', 'selesai', 'batal'])->default('belum diperiksa');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('patient_record_id')->references('id')->on('patient_records')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('patient_record_id');
            $table->index('status');
            $table->index('lab_visit_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_queue');
    }
};
