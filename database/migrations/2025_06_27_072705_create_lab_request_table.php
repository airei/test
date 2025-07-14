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
        Schema::create('lab_request', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lab_queue_id')->nullable();
            $table->uuid('outpatient_queue_id')->nullable();
            $table->enum('reference', ['lab_queue', 'outpatient_queue'])->default('lab_queue');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints with nullable support
            $table->foreign('lab_queue_id')->references('id')->on('lab_queue')->onDelete('cascade');
            $table->foreign('outpatient_queue_id')->references('id')->on('outpatient_queue')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('lab_queue_id');
            $table->index('outpatient_queue_id');
            $table->index('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_request');
    }
};
