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
        Schema::create('lab_exam_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lab_queue_id');
            $table->uuid('examiner_id');
            $table->uuid('guarantor_id');
            $table->uuid('shift_id');
            $table->uuid('created_by');
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('lab_queue_id')->references('id')->on('lab_queue')->onDelete('cascade');
            $table->foreign('examiner_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('guarantor_id')->references('id')->on('guarantors')->onDelete('restrict');
            $table->foreign('shift_id')->references('id')->on('shifts')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');

            // Indexes
            $table->index('lab_queue_id');
            $table->index('examiner_id');
            $table->index('guarantor_id');
            $table->index('shift_id');
            $table->index('created_by');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_exam_details');
    }
};
