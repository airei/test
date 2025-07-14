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
        Schema::create('lab_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lab_request_id');
            $table->uuid('lab_master_id');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('lab_request_id')->references('id')->on('lab_request')->onDelete('cascade');
            $table->foreign('lab_master_id')->references('id')->on('lab_masters')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('lab_request_id');
            $table->index('lab_master_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_details');
    }
};
